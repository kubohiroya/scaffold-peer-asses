import {ReviewConfig} from './reviewConfig';
import {
  getStudentProfile,
  getTeacherProfile,
  listStudentProfiles,
  listStudentSubmissions,
  listTeacherProfiles, regulatePhotoUrl
} from '../classroom/importClassroom';
import {ReviewUser} from './ReviewUser';
import {openSheetByUrl} from '../sheetUtil';
import {RevieweeUserGroup} from './RevieweeUserGroup';
import UserProfile = GoogleAppsScript.Classroom.Schema.UserProfile;
import md5 from 'md5';

export function createReviewers(config: ReviewConfig): Array<ReviewUser>{
  switch(config.reviewerSrcType){
    case "owner":
      return [getOwner(config.courseId, config.nonce)];
    case "teachers":
      return getTeachers(config.courseId, config.nonce);
    case "students":
      return getStudents(config.courseId, config.nonce);
    case "submitters":
      return getSubmitters(config.courseId, config.courseName, config.courseWorkId, "TURNED_IN", config.nonce);
    case "spreadsheet":
      return getReviewUsersFromSpreadsheet(config, config.reviewerSrcSpreadsheetUrl, config.nonce);
    default:
      throw new Error("Invalid config.reviewerSrcType="+config.reviewerSrcType);
  }
}

export function createReviewees(config: ReviewConfig): Array<ReviewUser|RevieweeUserGroup> {
  if(config.groupSrcUrl && config.groupSrcUrl.length > 0){
    return getReviewUserGroupsFromSpreadsheet(config, config.nonce);
  }else{
    switch (config.revieweeSrcType) {
      case "students":
        return getSubmitters(config.courseId, config.courseName, config.courseWorkId, null, config.nonce);
      case "submitters":
        return getSubmitters(config.courseId, config.courseName, config.courseWorkId, 'TURNED_IN', config.nonce);
      default:
        throw new Error("Invalid config.revieweeSrcType=" + config.revieweeSrcType);
    }
  }
}

function getReviewUsersFromSpreadsheet(config: ReviewConfig, url: string, nonce: string): Array<ReviewUser>{
  const sheet = openSheetByUrl(url);
  const sheetName = sheet.getSheetName();
  const values = sheet.getDataRange().getValues();
  return values.map((row, index)=>createReviewUser(
    (config.revieweeSrcType == "group")?
      {index: parseInt(row[0])-1, emailAddress: row[1], fullName: row[2], photoUrl: row[6], nonce}:
      (sheetName.startsWith("submissions:"))?
        {index, fullName: row[4], emailAddress: row[5], photoUrl: row[6], nonce}:
        (sheetName.startsWith("teachers:") || sheetName.startsWith("students:"))?
          {index, emailAddress: row[2], fullName: row[3], photoUrl: row[4], nonce}:
          {index, emailAddress: row[1], fullName: row[2], photoUrl: row[3], nonce}
  ));
}

function getReviewUserGroupsFromSpreadsheet(config: ReviewConfig, nonce: string): Array<RevieweeUserGroup>{
  const users = getReviewUsersFromSpreadsheet(config, config.groupSrcUrl, nonce);
  const groups: {[key:number]: RevieweeUserGroup} = {};
  users.forEach(user=>{
    const userGroup = groups[user.index] ? groups[user.index] : {
      index: user.index,
      hashDigest: createHashDigest(user.index, nonce),
      members: new Array<ReviewUser>(),
    };
    userGroup.members.push(user);
    groups[user.index] = userGroup;
  })

  return Object.values(groups).sort((a,b)=>b.index - a.index);
}

function getOwner(courseId: string, nonce: string){
  const course = Classroom.Courses.get(courseId);
  if(course){
    const teacher = getTeacherProfile(courseId, course.ownerId);
    const photoUrl = regulatePhotoUrl(teacher.photoUrl)
    return createReviewUser({index: 0, fullName: teacher.name.fullName, emailAddress: teacher.emailAddress, photoUrl, nonce});
  }else{
    throw new Error("Invalid course");
  }
}

function getTeachers(courseId: string, nonce: string){
  return getUsers(listTeacherProfiles(courseId).map(t=>t.profile), nonce);
}

function getStudents(courseId: string, nonce: string){
  return getUsers(listStudentProfiles(courseId).map(t=>t.profile), nonce);
}

function getSubmitters(courseId: string, courseName: string, courseWorkId: string, state: string, nonce: string){
  return getUsers(listStudentSubmissions(courseId, courseName, courseWorkId)
    .filter((submission) => (state == null || submission.state === state))
    .map(submission => {
      return getStudentProfile(courseId, submission.userId);
    }), nonce);
}

export function userEmailAddressCompare(a: {emailAddress: string}, b: {emailAddress: string}){
  if(a.emailAddress > b.emailAddress){
    return 1;
  }else if(a.emailAddress < b.emailAddress) {
    return -1;
  }else{
    return 0;
  }
}

function getUsers(userProfiles: Array<UserProfile>, nonce: string){
  return userProfiles.sort(userEmailAddressCompare).map((profile, index)=>(createReviewUser({
    index,
    fullName: profile.name.fullName,
    emailAddress: profile.emailAddress,
    photoUrl: regulatePhotoUrl(profile.photoUrl),
    nonce
  })))
}

export function createReviewUser(params: {index: number, fullName: string, emailAddress: string, photoUrl: string, nonce: string}){
  const {index, fullName, emailAddress, photoUrl, nonce} = params;
  return {
    index,
    fullName,
    emailAddress,
    photoUrl,
    hashDigest: createHashDigest(index, nonce),
  }
}

export function createHashDigest(index: number, nonce: string){
  return md5(nonce+"@"+index).toString()
}

export function getUser(courseId: string, userId: string){
  return Classroom.Courses.Students.get(courseId, userId) || Classroom.Courses.Teachers.get(courseId, userId);
}

export function reviewUserToArray(user: ReviewUser){
  return [user.index+1, user.emailAddress, user.fullName, user.photoUrl, user.hashDigest];
}


