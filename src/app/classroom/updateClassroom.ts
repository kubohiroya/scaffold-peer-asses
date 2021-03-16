import Teacher = GoogleAppsScript.Classroom.Schema.Teacher;
import {formatDateTime} from '../dateTimeUtils';

export function updateCourses(){
  const sheet = SpreadsheetApp.getActiveSheet();
  if(! sheet.getSheetName().startsWith("courses")){
    Browser.msgBox("Please activate 'courses' tab");
    return;
  }
  const values = sheet.getDataRange().getValues();
  values.forEach((row, rowIndex)=>{
    if(row[0] === "courseId"){
      return;
    }else if(row[0] !== "" ){
      const [ id, name, section, descriptionHeading, room, ownerId, courseState] = [row[0], row[1], row[2], row[3], row[4], row[6], row[10]];
      const currentCourse = Classroom.Courses.get(id);
      const course = {
        name, section, descriptionHeading, room, courseState
      };
      const updateMask = 'name,section,descriptionHeading,room,courseState';
      const patchedCourse = Classroom.Courses.patch(course, id, {updateMask});
      row[8] = formatDateTime(patchedCourse.updateTime);
      sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
      if(ownerId !== currentCourse.ownerId){
        try{
          Classroom.Courses.patch({ownerId}, id, {updateMask:'ownerId'});
        }catch(ignore){
          Logger.log(ignore);
        }
      }
      return;
    }else if(row[0] === ""){
      const [ name, section, descriptionHeading, room, ownerId] = [row[1], row[2], row[3], row[4], row[6]];
      const course = {name, section, descriptionHeading, room, ownerId};
      const createdCourse = Classroom.Courses.create(course);
      [row[0], row[7], row[8], row[10]] = [createdCourse.id, formatDateTime(createdCourse.creationTime), formatDateTime(createdCourse.updateTime), createdCourse.courseState];
      sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
      return
    }
  })
}

export function updateCourseTeachers(){
  const sheet = SpreadsheetApp.getActiveSheet();
  if(! sheet.getSheetName().startsWith("teachers")){
    Browser.msgBox("Please activate 'teachers' tab");
    return;
  }

  const currentTeachersMap = new Map<string, Map<string, Teacher>>();
  const updateCurrentCourseTeachersMap = function (courseId: string){
    if(! currentTeachersMap.has(courseId)){
      const teachers = Classroom.Courses.Teachers.list(courseId).teachers;
      const teachersMap = new Map<string, Teacher>(teachers.map(teacher=>[teacher.profile.emailAddress, teacher]))
      currentTeachersMap.set(courseId, teachersMap);
    }
  }

  const updatedTeachersMap = new Map<string, Map<string, string>>();
  const updateCourseTeachersMap = function (courseId: string, email: string, teacherName: string){
    if(updatedTeachersMap.has(courseId)){
      updatedTeachersMap.get(courseId).set(email, teacherName);
    }else{
      const teachersMap = new Map<string, string>()
      teachersMap.set(email, teacherName);
      updatedTeachersMap.set(courseId, teachersMap);
    }
  }

  const values = sheet.getDataRange().getValues();
  values.forEach((row, rowIndex)=> {
    if (row[0] === "courseId" || row[0] === "") {
      return;
    } else if (row[0] !== "") {
      const [courseId, email, teacherName] = [row[0], row[2], row[3]];
      updateCurrentCourseTeachersMap(courseId);
      updateCourseTeachersMap(courseId, email, teacherName)
    }
  });

  Object.entries(currentTeachersMap).forEach(([courseId, teachersMap])=>{
    const updatedTeachers = updatedTeachersMap.get(courseId);
    Object.keys(updatedTeachers).forEach(email=>{
      if(!teachersMap.has(email)){
        Classroom.Courses.Teachers.remove(courseId, email);
      }
    });
  });

  Object.entries(updatedTeachersMap).forEach(([courseId, teachersMap])=>{
    const currentTeachers = currentTeachersMap.get(courseId);
    Object.entries(currentTeachers).forEach(([email, teacherName])=>{
      if(!teachersMap.has(email)){
        Classroom.Courses.Teachers.create({
          userId: email,
        }, courseId);
      }
    })
  })
}

export function updateCourseStudents(){
  Browser.msgBox("not implemented for now") // FIXME
}

export function updateCourseWorks(){
  Browser.msgBox("not implemented for now") // FIXME
}
