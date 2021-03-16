import {getFormSrc} from '../form/getFormSrc';
import {formSrcToSurveySrc} from '../reviewConfig/formSrcToSurveySrc';
import {readConfigFromSheet, REVIEW_BINDING_ROW_START} from '../reviewConfig/reviewConfig';
import {getSheetByUrl} from '../sheetUtil';

type Config = {[key:string]: string|number|boolean|null}

const adminUserEmailAddress = 'hiroya@cuc.global';

interface ReviewArticle{
}

interface Stats{
}

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

export function doGet(ev: any) {
  const gid = ev.parameter.gid;
  const template = HtmlService.createTemplateFromFile('review');
  template.gid = gid;
  return template.evaluate();
}

function queryReviews(sheet: GoogleAppsScript.Spreadsheet.Sheet, userEmailAddress: string, queryColumn: number) : {reviewer:ReviewUser, reviewee:ReviewUser}[]{
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

function getReviewConfigSheet(gid: string){
  const url = "https://docs.google.com/spreadsheets/d/"+process.env.SPREADSHEET_ID +"/edit?usp=sharing#gid="+gid;
  const ss = SpreadsheetApp.openByUrl(url);
  return ss.getSheets().find(sheet=>sheet.getSheetId().toString()===gid);
}

function getStudentSubmissionMap(config: Config, emailAddressList: string[]): {[emailAddress:string]:Submission}{
  const sheet = getSheetByUrl(config["submissionsUrl"] as string);
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

function getReviewArticles(userEmailAddress: string): ReviewArticle[] {
  return []; // FIXME
}

function getStats(config: Config): any {
  return null; // FIXME
}

export function initializeReviewPage(gid: string, effectiveUserEmailAddress: string){
  if(! gid){
    throw new Error("Invalid argument: gid="+gid);
  }
  const activeUserEmailAddress = Session.getActiveUser().getEmail();
  const isAdmin = (activeUserEmailAddress === adminUserEmailAddress);
  effectiveUserEmailAddress = isAdmin? (effectiveUserEmailAddress || activeUserEmailAddress) : activeUserEmailAddress;
  const sheet = getReviewConfigSheet(gid);
  const config = readConfigFromSheet (sheet);
  const formSrc = getFormSrcByConfig(config);
  const reviews = queryReviews(sheet, effectiveUserEmailAddress, 2);

  const userEmailAddressList = [effectiveUserEmailAddress, ...reviews.map(review=>review.reviewee.emailAddress)];
  const submissionMap = getStudentSubmissionMap(config, userEmailAddressList);
  const reports = getReviewArticles(effectiveUserEmailAddress);
  const stats: Stats = getStats(config);

  const reviewers = Array.from(getReviewers(sheet).keys()).sort();

  return {
    availableModes: ['submission', 'review', 'report', 'stat'],
    gid,
    effectiveUserEmailAddress: effectiveUserEmailAddress,
    config,
    surveySrc: formSrcToSurveySrc(formSrc),
    submissionMap,
    reviews,
    reports,
    stats,
    admin: (isAdmin)? {
      //reviewers: ['b8c0045@cuc.global']
      reviewers
    } : null,
  };
}
