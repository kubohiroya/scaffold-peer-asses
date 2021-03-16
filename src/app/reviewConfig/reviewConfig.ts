import {Reviewer} from './ReviewUser';
import {createReviewees, createReviewers} from './createReviewUsers';
import {
  createAssignedReviews,
  importReviewAssignmentsFromSheet,
  storeReviewAssignmentsToSheet
} from './createAssignmentReviews';
import {getSelectedCourseWorks} from '../classroom/selectors';
import {getSheetByUrl} from '../sheetUtil';
import {openURL} from '../openURL';
import {showPicker} from '../picker/picker';
import {getFormSrc} from '../form/getFormSrc';
import {formSrcToSurveySrc} from './formSrcToSurveySrc';
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;


export interface ReviewConfig {
  courseId: string,
  courseName: string,
  courseWorkId: string,
  courseWorkTitle: string,
  submissionsUrl: string,
  groupSrcUrl: string,
  formSrcType: string,
  formSrcUrl: string,
  formSrcTitle: string,
  reviewerSrcType: string,
  reviewerSrcSpreadsheetUrl: string,
  revieweeSrcType: string,
  binding: string,
  numReviewRequired: number | null,
  reviewThemselves: boolean,
  anonymousReviewee: boolean,
  anonymousReviewer: boolean,
  overwriteBindings: boolean,

  acceptingResponses: boolean,
  allowResponseEdits: boolean,
  shuffleReviewForms: boolean,

  nonce: string,
  actionUrl: string,
  gid: string;
  resultUrl: string;

}

export const CONFIG_METADATA_RANGE = "A1:B25";
export const REVIEW_BINDING_ROW_RANGE_START = "A27:J27";
export const REVIEW_BINDING_ROW_START = 27;
const ACTION_URL_ROW_OFFSET_FROM_END = -2;

const FORM_URL_INPUT_BOX_TITLE = "「フォーム」または「フォーム定義シート」のURLを入力してください";
const FORM_URL_INPUT_BOX_PROMPT = "★「フォーム」の場合：「docs.google.com/form」で始まるもの<br/>" +
  "★「フォーム定義シート」の場合：「docs.google.com/spreadsheet」で始まるもの";
const GROUP_SPREADSHEET_URL_INPUT_BOX_TITLE = "「グループ一覧(groups:)」を含むスプレッドシートのURLを入力...";
const GROUP_SPREADSHEET_URL_INPUT_BOX_PROMPT = "★「docs.google.com/spreadsheet」で始まるもの";
const FORM_PICKER_TITLE = "「フォーム」または「フォーム定義シート」を選択...";
const GROUP_SHEET_PICKER_TITLE = '「グループ一覧(groups:)」を含むスプレッドシートを選択...';

export function selectFormUrlWithPicker(callbackCommand: string) {
  showPicker(FORM_PICKER_TITLE, [
      'application/vnd.google-apps.form', 'application/vnd.google-apps.spreadsheet'],
    callbackCommand);
}

export function startConfigWithGroupSubmissionsWithPicker() {
  startConfig(function () {
    selectGroupSpreadsheetWithPicker('startFormPicker');
  })
}

export function startFormPicker() {
  selectFormUrlWithPicker('startReviewConfig');
}

export function selectGroupSpreadsheetWithPicker(callbackCommand: string) {
  showPicker(GROUP_SHEET_PICKER_TITLE, [
    'application/vnd.google-apps.spreadsheet'
  ], callbackCommand);
}

export function startConfigWithSubmissionsWithPicker() {
  startConfig(function () {
    selectFormUrlWithPicker('startReviewConfig');
  })
}

export function startConfigWithSubmissionsWithInputBox() {
  startConfig(function () {
    selectFormUrlWithInputBox();
    startReviewConfig();
  })
}

export function startConfigWithGroupSubmissionsWithInputBox() {
  startConfig(function () {
    selectFormUrlWithInputBox();
    selectGroupSpreadsheetUrlWithInputBox();
    startReviewConfig();
  })
}

function startConfig(callback: Function) {
  clearReviewContext();
  checkSheetName("submissions:");
  setSubmissionsUrl();
  callback();
}

function showInputBox(title: string, prompt: string): string {
  const input = Browser.inputBox(
    title, prompt,
    Browser.Buttons.OK_CANCEL
  );
  if (input === "cancel") {
    throw new Error();
  }
  if (input === "") {
    return showInputBox(title, prompt);
  }
  return input;
}

function selectFormUrlWithInputBox() {
  const url = showInputBox(FORM_URL_INPUT_BOX_TITLE, FORM_URL_INPUT_BOX_PROMPT);
  setFormSrcPropertiesWithUrlParams(url);
}

function selectGroupSpreadsheetUrlWithInputBox() {
  const url = showInputBox(GROUP_SPREADSHEET_URL_INPUT_BOX_TITLE, GROUP_SPREADSHEET_URL_INPUT_BOX_PROMPT);
  setGroupSrcPropertiesWithUrlParams(url);
}

function clearReviewContext() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('reviewSheetName');
}

function checkSheetName(sheetNamePrefix: string | null) {
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheetNamePrefix != null && !sheet.getSheetName().startsWith(sheetNamePrefix)) {
    throw new Error(`事前に '${sheetNamePrefix}' タブを選択してください`);
  }
}

export function continueConfig() {
  let sheet = SpreadsheetApp.getActiveSheet();
  if (!sheet.getSheetName().startsWith("config:")) {
    SpreadsheetApp.getUi().alert("Please activate 'config:' sheet.");
    return;
  }

  setPropertiesWithSheet(sheet);
  startReviewConfig();
}

function createNonce() {
  return Math.random().toString(32).substring(2);
}

function setSubmissionsUrl() {
  const userProperties = PropertiesService.getUserProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getSheetName().startsWith("submissions:")) {
    const submissionsUrl = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/edit#gid=" + sheet.getSheetId();
    userProperties.setProperty('submissionsUrl', submissionsUrl);
  }
}

export function setFormSrcPropertiesWithUrlParams(url: string) {
  const userProperties = PropertiesService.getUserProperties();
  if (url.indexOf("/forms/d/")) {
    const form = FormApp.openByUrl(url);
    userProperties.setProperty('formSrcType', 'form')
    userProperties.setProperty('formSrcUrl', url)
    userProperties.setProperty('formSrcTitle', form.getTitle());
  } else if (url.indexOf("/spreadsheet/d/") > 0 && url.indexOf("#gid=") > 0) {
    const formTitle = getConfigPropertyValueFromSpreadsheetUrl(url, 'title');
    userProperties.setProperty('formSrcType', 'spreadsheet')
    userProperties.setProperty('formSrcUrl', url)
    userProperties.setProperty('formSrcTitle', formTitle)
  } else {
    throw new Error("invalid url:" + url);
  }
}

export function setGroupSrcPropertiesWithUrlParams(url: string) {
  const userProperties = PropertiesService.getUserProperties();
  if (url.indexOf("/spreadsheet/d/") > 0 && url.indexOf("#gid=") > 0) {
    userProperties.setProperty('groupSrcUrl', url)
  } else {
    throw new Error("invalid url:" + url);
  }
}

export function setPropertiesWithSheet(sheet: Sheet) {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('reviewSheetName', sheet.getSheetName());
}

export function startReviewConfig() {
  const title = "評価を準備...";
  const html = HtmlService.createTemplateFromFile('reviewConfig');
  SpreadsheetApp.getUi().showSidebar(html.evaluate().setTitle(title))
}

export function readConfigFromSheet(sheet: Sheet) {
  const ret: { [key: string]: string | number | boolean | null } = {};
  const values = sheet.getRange(CONFIG_METADATA_RANGE).getValues() as Array<Array<string | number | boolean | null>>;
  values.forEach(value => {
    ret[value[0] as string] = value[1];
  })
  return ret;
}

export function initializeReviewConfig() {

  const userProperties = PropertiesService.getUserProperties();
  const reviewSheetName = userProperties.getProperty('reviewSheetName');

  const configValuesFromSpreadsheet = (() => {
    if (reviewSheetName) {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(reviewSheetName);
      return readConfigFromSheet(sheet);
    } else {
      return {
        nonce: createNonce()
      }
    }
  })();

  const configValuesFromUserProperties = (() => {
    if (reviewSheetName) {
      return {};
    } else {
      const {courseId, courseName, courseWorkId, courseWorkTitle} = getSelectedCourseWorks();
      const userProperties = PropertiesService.getUserProperties();
      const formSrcType = userProperties.getProperty('formSrcType')
      const formSrcUrl = userProperties.getProperty('formSrcUrl')
      const formSrcTitle = userProperties.getProperty('formSrcTitle')
      const groupSrcUrl = userProperties.getProperty('groupSrcUrl')
      const submissionsUrl = userProperties.getProperty('submissionsUrl')
      return {
        courseId,
        courseName,
        courseWorkId,
        courseWorkTitle,
        submissionsUrl,
        formSrcType,
        formSrcUrl,
        formSrcTitle,
        groupSrcUrl,
      };
    }
  })();

  return {
    ...configValuesFromSpreadsheet,
    ...configValuesFromUserProperties,
  }

}

const getConfigPropertyValueFromSpreadsheetUrl = (url: string, command: string) => {
  const sheet = getSheetByUrl(url);
  return getConfigPropertyValueFromSheet(sheet, command);
}
const getConfigPropertyValueFromSheet = (sheet: Sheet, command: string) => {
  const row = sheet.getDataRange().getValues().find(row => row[0] === command);
  return row && row.length > 0 ? row[1] : null;
}

export function configJsonToValues(config: ReviewConfig): Array<Array<number | string | boolean | null>> {
  return [
    ['courseId', config.courseId],
    ['courseName', config.courseName],
    ['courseWorkId', config.courseWorkId],
    ['courseWorkTitle', config.courseWorkTitle],
    ['submissionsUrl', config.submissionsUrl],

    ['groupSrcUrl', config.groupSrcUrl],
    ['formSrcType', config.formSrcType],
    ['formSrcUrl', config.formSrcUrl],
    ['formSrcTitle', config.formSrcTitle],
    ['reviewerSrcType', config.reviewerSrcType],

    ['reviewerSrcSpreadsheetUrl', config.reviewerSrcSpreadsheetUrl],
    ['revieweeSrcType', config.revieweeSrcType],

    ['anonymousReviewee', config.anonymousReviewee],
    ['anonymousReviewer', config.anonymousReviewer],

    ['binding', config.binding],
    ['numReviewRequired', config.numReviewRequired],
    ['reviewThemselves', config.reviewThemselves],

    ['overwriteBindings', config.overwriteBindings],

    ['allowResponseEdits', config.allowResponseEdits],
    ['shuffleReviewForms', config.shuffleReviewForms],
    ['acceptingResponses', config.acceptingResponses],

    ['nonce', config.nonce],
    ['actionUrl', config.actionUrl],
    ['resultUrl', config.resultUrl],

    ['', ''] // separator
  ];
}

function selectConfigSheet(config: ReviewConfig): Sheet {
  const userProperties = PropertiesService.getUserProperties();
  const configSheetUrl = userProperties.getProperty('configSheetUrl');
  const sheetTitle = 'config:' + config.courseName + " " + config.courseWorkTitle;
  if (configSheetUrl) {
    return getSheetByUrl(configSheetUrl);
  } else {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetTitle);
    if(! sheet){
      sheet = ss.insertSheet(sheetTitle);
      sheet.setTabColor("blue");
    }
    return sheet;
  }
}

const getFormColumnNames = (config: ReviewConfig) => {
  const columnNames = new Array<string>();
  const formSrc = getFormSrc(config.formSrcType, config.formSrcUrl);
  const surveySrc = formSrcToSurveySrc(formSrc);
  surveySrc.pages.forEach(page=>{
    page.elements.forEach((element: {name: string})=>{
      columnNames.push(element.name);
    })
  })
  return columnNames;
}

const initializeResultSheet = (config: ReviewConfig) => {
  const columnNames = getFormColumnNames(config);

  let resultSheet = config.resultUrl && config.resultUrl.length > 0 && getSheetByUrl(config.resultUrl);
  if(! resultSheet){
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const resultSheetName = "result:"+config.courseName+" "+config.courseWorkTitle;
    resultSheet = ss.getSheetByName(resultSheetName);
    if(! resultSheet){
      resultSheet = ss.insertSheet(resultSheetName).setTabColor("red");
      resultSheet.appendRow([
        "更新日時",
        "評価者名",
        "評価者メールアドレス",
        "評価者ハッシュ値",
        "被評価者名",
        "被評価者メールアドレス",
        "被評価者ハッシュ値",
        ...columnNames,
      ]);
    }
    config.resultUrl = ss.getUrl()+"#gid="+resultSheet.getSheetId();
  }
}

export function submitReviewConfig(config: ReviewConfig) {

  initializeResultSheet(config);

  const configValues = configJsonToValues(config);
  const sheet = selectConfigSheet(config);
  const gid = sheet.getSheetId().toString();
  const actionUrl = configValues[configValues.length + ACTION_URL_ROW_OFFSET_FROM_END][1] = process.env.DEPLOYED_URL + "?gid=" + gid;

  sheet.getRange(CONFIG_METADATA_RANGE).setValues(configValues);

  const reviewers: Array<Reviewer> = createReviewers(config);
  const startRow = configValues.length + 1;

  const firstBindingValues = sheet.getRange(REVIEW_BINDING_ROW_RANGE_START).getValues();
  const hasDefinedBindings = firstBindingValues[0][0] && firstBindingValues[0][0].length > 0;

  if (!hasDefinedBindings || config.overwriteBindings) {
    const reviews = createAssignedReviews(config, reviewers, createReviewees(config));
    storeReviewAssignmentsToSheet(config, reviews, sheet, startRow);
  } else {
    importReviewAssignmentsFromSheet(config, reviewers, sheet, startRow);
  }

  // ['評価者通し番号','評価者メールアドレス','評価者氏名','被評価者の通し番号','被評価者メールアドレス','被評価者氏名','評価者のハッシュ値', '評価者のハッシュ値']
  return actionUrl;
}

export function submitPropertyValue(config: ReviewConfig, key: string, value: string){
  (config as any)[key] = value;
  const configValues = configJsonToValues(config);
  const sheet = selectConfigSheet(config);
  sheet.getRange(CONFIG_METADATA_RANGE).setValues(configValues);
}

export function openReviewPage(actionUrl: string | undefined) {
  if (!actionUrl) {
    const sheet = SpreadsheetApp.getActiveSheet();
    actionUrl = getConfigPropertyValueFromSheet(sheet, "actionUrl");
  }

  if (actionUrl.startsWith(process.env.DEPLOYED_URL + "?gid=")) {
    openURL('Please wait to open the reviewConfig page...', actionUrl);
  } else {
    SpreadsheetApp.getUi().alert('Invalid URL: ' + actionUrl);
  }
}

export function openResultSheet(resultUrl: string | undefined) {
  if (!resultUrl) {
    const sheet = SpreadsheetApp.getActiveSheet();
    resultUrl = getConfigPropertyValueFromSheet(sheet, "resultUrl");
  }
  openURL('Please wait to open the resultSheet...', resultUrl);
}

export function initializeFormPreviewPage(gid: string) {
  const formSrc = getFormSrc("spreadsheet", SpreadsheetApp.getActiveSpreadsheet().getUrl() + "?gid=" + gid);
  const surveySrc = formSrcToSurveySrc(formSrc);
  return {
    surveySrc,
    gid,
  }
}
