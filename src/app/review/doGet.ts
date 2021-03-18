import {getFormSrc} from '../form/getFormSrc';
import {jsonToSurveyJs} from '../form/jsonToSurveyJs';
import {getReviewConfigFromSheet, REVIEW_BINDING_ROW_START} from '../reviewConfig/reviewConfig';
import {openSheetByUrl} from '../sheetUtil';
import Teacher = GoogleAppsScript.Classroom.Schema.Teacher;
import Range = GoogleAppsScript.Spreadsheet.Range;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import {traverseFormSrc} from '../form/jsonToFormColumnNames';
import {reviewUserToArray} from '../reviewConfig/createReviewUsers';

type Config = {[key:string]: string|number|boolean|null}

interface ReviewUser{
  index: number,
  emailAddress: string,
  fullName: string,
  photoUrl: string,
  hashDigest: string
}

interface Submission{
  courseName: string,
  courseWorkTitle: string,
  // courseWorkDescription: string,
  // creatatin
  // dueDate,
  // dueTime,
  // topicId,...
  state: string,
  createdAt: number,
  updatedAt: number,
  values: Array<string|number|boolean|null>,
}

interface ReviewArticle{
  timestamp: number;
  reviewer: ReviewUser;
  reviewee: ReviewUser;
  data: Object;
}

interface Summary{
}


export function doGet(ev: any) {
  const gid = ev.parameter.gid;
  const template = HtmlService.createTemplateFromFile('review');
  template.gid = gid;
  return template.evaluate();
}

function queryReviewRequests(sheet: GoogleAppsScript.Spreadsheet.Sheet, userEmailAddress: string, queryColumn: number) : {reviewer:ReviewUser, reviewee:ReviewUser}[]{
  const textFinders = sheet.createTextFinder(userEmailAddress).findAll();
  const ranges = textFinders.filter(textFinder => textFinder.getColumn() == queryColumn && textFinder.getRow() >= REVIEW_BINDING_ROW_START)
  const reviews = ranges.map(range => sheet.getRange(range.getRow(), 1, 1, 10).getValues()[0]).map(row => ({
    reviewer: {
      index: parseInt(row[0]) - 1,
      emailAddress: row[1],
      fullName: row[2],
      photoUrl: row[3],
      hashDigest: row[4],
    },
    reviewee: {
      index: parseInt(row[5]) - 1,
      emailAddress: row[6],
      fullName: row[7],
      photoUrl: row[8],
      hashDigest: row[9],
    },
  }))
  return reviews;
}

function getReviewers(sheet: GoogleAppsScript.Spreadsheet.Sheet) : Map<string,ReviewUser> {
  const reviewers = new Map<string,ReviewUser>();
  const values = sheet.getRange(REVIEW_BINDING_ROW_START, 1, sheet.getLastRow() - REVIEW_BINDING_ROW_START + 1, 5).getValues();
  values.forEach(([serial, emailAddress, fullName, photoUrl, hashDigest])=>{
    const index = parseInt(serial) - 1;
    reviewers.set(emailAddress, {index, emailAddress, fullName, photoUrl, hashDigest});
  })
  return reviewers;
}

function getReviewees(sheet: GoogleAppsScript.Spreadsheet.Sheet) : Map<string,ReviewUser> {
  const reviewees = new Map<string,ReviewUser>();
  const values = sheet.getRange(REVIEW_BINDING_ROW_START, 6, sheet.getLastRow() - REVIEW_BINDING_ROW_START + 1, 10).getValues();
  values.forEach(([serial, emailAddress, fullName, photoUrl, hashDigest])=>{
    const index = parseInt(serial) - 1;
    reviewees.set(emailAddress, {index, emailAddress, fullName, photoUrl, hashDigest});
  })
  return reviewees;
}

function getReviewConfigSheet(gid: string){
  const url = "https://docs.google.com/spreadsheets/d/"+process.env.SPREADSHEET_ID +"/edit?usp=sharing#gid="+gid;
  const ss = SpreadsheetApp.openByUrl(url);
  return ss.getSheets().find(sheet=>sheet.getSheetId().toString()===gid);
}

function getStudentSubmissionMap(config: Config, emailAddressList: string[]): {[emailAddress:string]:Submission}{
  const sheet = openSheetByUrl(config["submissionsUrl"] as string);
  const ret = {} as {[emailAddress:string]:Submission};
  emailAddressList.forEach(userEmailAddress=>{
    const textFinders = sheet.createTextFinder(userEmailAddress).findAll();
    const ranges = textFinders.filter(textFinder => textFinder.getColumn() == 6)
    if(ranges.length == 0){
      return;
    }
    const values = sheet.getRange(ranges[0].getRowIndex(), 1, 1, 14).getValues()[0];
    const courseName = values[1] as string;
    const courseWorkTitle = values[3] as string;
    const state = values[7] as string;
    const createdAt = (values[8] as Date).getTime();
    const updatedAt = (values[9] as Date).getTime();
    ret[userEmailAddress] = {courseName, courseWorkTitle, state, createdAt, updatedAt, values: values.slice(10)};
  });
  return ret;
}

function getFormSrcByConfig(config: Config){
  const formSrcType = config['formSrcType'] as string;
  const formSrcUrl = config['formSrcUrl'] as string;
  const formSrc = getFormSrc(formSrcType, formSrcUrl);
  if(! formSrc){
    throw new Error("Invalid formSrcUrl: "+formSrcUrl);
  }
  return formSrc;
}

function getCourseOwner(config: Config): Teacher{
  const courseId = config['courseId'] as string;
  const ownerId = Classroom.Courses.get(courseId).ownerId;
  return Classroom.Courses.Teachers.get(courseId, ownerId);
}

const RESULT_SHEET_REVIEWER_EMAIL_COLUMN = 3;
const RESULT_SHEET_REVIEWEE_EMAIL_COLUMN = 8;

function getReviewArticles(config: Config, userEmailAddress: string, keyColumn: number): {[emailAddress:string]:ReviewArticle} {
  const resultUrl = config['resultUrl'] as string;
  const resultSheet = openSheetByUrl(resultUrl);
  const formSrc = getFormSrcByConfig(config);

  const ret = {} as {[emailAddress:string]:ReviewArticle};

  const textFinders = resultSheet.createTextFinder(userEmailAddress).findAll();
  const ranges = textFinders.filter(textFinder => textFinder.getColumn() == keyColumn)
  ranges.forEach(range=>{

    const row = resultSheet.getRange(range.getRow(), 1, 1, resultSheet.getMaxColumns()).getValues()[0];

    const reviewer = {index: parseInt(row[1]) - 1, emailAddress: row[2], fullName: row[3], photoUrl: row[4], hashDigest: row[5]};
    const reviewee = {index: parseInt(row[6]) - 1, emailAddress: row[7], fullName: row[8], photoUrl: row[9], hashDigest: row[10]};

    const dataSrc = row.slice(11);

    const data = {} as any;
    let dataSrcIndex = 0;

    traverseFormSrc(formSrc, function(type: string, key1: string, key2?: string){
      if(type === "surveyJs:matrix"){
        if(key2){
          if(! data[key1]){
            data[key1] = {} as any;
          }
          data[key1][key2] = dataSrc[dataSrcIndex];
          // Logger.log("surveyJs:row "+key1+" "+key2+" : "+dataSrcIndex+" = "+data[key1][key2]);
          dataSrcIndex++;
        }
      }else{
        // Logger.log(type + " "+key1+" "+" : "+dataSrcIndex+" = "+ data[key1]);
        data[key1] = dataSrc[dataSrcIndex];
        dataSrcIndex++;
      }
    })

    const timestamp = (row[0] as Date).getTime();
    const key = keyColumn === RESULT_SHEET_REVIEWER_EMAIL_COLUMN ? reviewee.emailAddress : keyColumn === RESULT_SHEET_REVIEWEE_EMAIL_COLUMN ? reviewer.emailAddress : undefined;
    if(key){
      ret[key] = {
        timestamp,
        reviewer,
        reviewee,
        data,
      };
    }
  })
  // Logger.log(JSON.stringify(ret, null, " "));
  return ret;
}

function getReviewArticlesOfReviewer(config: Config, userEmailAddress: string): {[emailAddress:string]:ReviewArticle} {
  return getReviewArticles(config, userEmailAddress, RESULT_SHEET_REVIEWER_EMAIL_COLUMN);
}
function getReviewArticlesForReviewee(config: Config, userEmailAddress: string): {[emailAddress:string]:ReviewArticle} {
  return getReviewArticles(config, userEmailAddress, RESULT_SHEET_REVIEWEE_EMAIL_COLUMN);
}

/*
function createReviewArticle(row: string[]){
  const timestamp = row[0];
  const reviewer = {index: parseInt(row[1]) - 1, emailAddress: row[2], fullName: row[3], photoUrl: row[4], hashDigest: row[5]};
  const reviewee = {index: parseInt(row[6]) - 1, emailAddress: row[7], fullName: row[8], photoUrl: row[9], hashDigest: row[10]};
  const data = row.slice(11);
  return {
    timestamp,
    reviewer,
    reviewee,
    data
  };
}

function createReviewArticleRow(r: ReviewArticle): Array<string|number|boolean|null>{
  return [
    r.timestamp,
    r.reviewer.index,
    r.reviewer.emailAddress,
    r.reviewer.fullName,
    r.reviewer.hashDigest,
    r.reviewee.index,
    r.reviewee.emailAddress,
    r.reviewee.fullName,
    r.reviewee.hashDigest,
    ...reviewArticleDataToValues(r.data)
  ];
}

function reviewArticleDataToValues(data: Object): string[]{
  return [];
}
*/

function lookupReviewArticleRow(resultSheet: Sheet, reviewerEmailAddress: string, revieweeEmailAddress: string): Range {
  // const ret = {} as {[emailAddress:string]:ReviewArticle};
  const textFinders = resultSheet.createTextFinder(reviewerEmailAddress).findAll();
  const range = textFinders
    .filter(textFinder => textFinder.getColumn() == 2)
    .map(range=>resultSheet.getRange(range.getRow(), 0, 1, resultSheet.getMaxColumns()))
    .find(range=>range.getValues()[0][7] === revieweeEmailAddress);
  return range;
}

function upsertReviewArticleRow(config: Config, reviewer: ReviewUser, reviewee: ReviewUser, data: Array<string|number>){
  const resultUrl = config['resultUrl'] as string;
  const resultSheet = openSheetByUrl(resultUrl);

  const range = lookupReviewArticleRow(resultSheet, reviewer.emailAddress, reviewee.emailAddress);

  const row = [new Date(), ...reviewUserToArray(reviewer), ...reviewUserToArray(reviewee), ...data];

  if(range){
    range.setValues([row]);
  }else{
    resultSheet.appendRow(row)
  }
}

export function submitReviewArticle(gid: string, reviewerEmailAddress: string, revieweeEmailAddress: string, data: {[key:string]: string|number}){
  if(! gid){
    throw new Error("Invalid argument: gid="+gid);
  }
  const configSheet = getReviewConfigSheet(gid);
  const config = getReviewConfigFromSheet (configSheet);
  const review = queryReviewRequests(configSheet, reviewerEmailAddress, 2).find(({reviewer, reviewee})=>(
    reviewer.emailAddress === reviewerEmailAddress && reviewee.emailAddress === revieweeEmailAddress
  ));

  const formSrc = getFormSrc(config['formSrcType'] as string, config['formSrcUrl'] as string);
  const row = new Array<string|number>();
  traverseFormSrc(formSrc, (type: string, key1: string, key2?: string)=>{
    if(type === "surveyJs:matrix"){
      const value = (data[key1] as any)[key2] as string|number || '';
      row.push(value);
    }else{
      const value = data[key1] as string|number || '';
      row.push(value)
    }
  })
  upsertReviewArticleRow(config, review.reviewer, review.reviewee, row);
}

function geSummary(config: Config): any {
  return null; // FIXME
}

export function initializeReviewPage(gid: string, effectiveUserEmailAddress: string){
  if(! gid){
    throw new Error("Invalid argument: gid="+gid);
  }
  const configSheet = getReviewConfigSheet(gid);
  const config = getReviewConfigFromSheet (configSheet);

  const activeUserEmailAddress = Session.getActiveUser().getEmail();
  const isAdmin = activeUserEmailAddress === getCourseOwner(config).profile.emailAddress;
  effectiveUserEmailAddress = isAdmin? (effectiveUserEmailAddress || activeUserEmailAddress) : activeUserEmailAddress;


  const formSrc = getFormSrcByConfig(config);
  const reviewRequests = queryReviewRequests(configSheet, effectiveUserEmailAddress, 2);

  const userEmailAddressList = [effectiveUserEmailAddress, ...reviewRequests.map(review=>review.reviewee.emailAddress)];
  const submissionMap = getStudentSubmissionMap(config, userEmailAddressList);

  const reviewArticlesOfReviewer = getReviewArticlesOfReviewer(config, effectiveUserEmailAddress);
  const reviewArticlesForReviewee = getReviewArticlesForReviewee(config, effectiveUserEmailAddress);
  Logger.log("reviewArticlesForReviewee "+JSON.stringify(reviewArticlesForReviewee, null, ' '));
  const summary: Summary = geSummary(config);

  const reviewers = Array.from(getReviewers(configSheet).keys()).sort();
  const reviewees = Array.from(getReviewees(configSheet).keys()).sort();

  return {
    availableModes: ['submission', 'review', 'report', 'stat'],
    gid,
    effectiveUserEmailAddress: effectiveUserEmailAddress,
    config,
    surveyJs: jsonToSurveyJs(formSrc),
    submissionMap,
    reviewRequests,
    reviewArticlesOfReviewer,
    reviewArticlesForReviewee,
    summary,
    admin: (isAdmin)? {
      reviewers,
      reviewees
    } : null,
  };
}
