import { Reviewer } from "./ReviewUser";
import { createReviewees, createReviewers } from "./createReviewUsers";
import {
  createAssignedReviews,
  importReviewAssignmentsFromSheet,
  storeReviewAssignmentsToSheet,
} from "./createAssignmentReviews";
import { getSelectedCourseWorks } from "../classroom/selectors";
import {
  createSpreadsheetUrl,
  isSpreadsheetUrl,
  openSheetByUrl,
} from "../sheetUtil";
import { openUrl } from "../openUrl";
import { getFormSrc } from "../form/getFormSrc";
import { jsonToSurveyJs } from "../form/jsonToSurveyJs";
import { jsonToFormColumnNames } from "../form/jsonToFormColumnNames";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export interface ReviewConfig {
  courseId: string;
  courseName: string;
  courseWorkId: string;
  courseWorkTitle: string;
  submissionsUrl: string;
  groupSrcUrl: string;
  formSrcType: string;
  formSrcUrl: string;
  formSrcTitle: string;
  reviewerSrcType: string;
  reviewerSrcSpreadsheetUrl: string;
  revieweeSrcType: string;
  binding: string;
  numReviewRequired: number | null;
  reviewThemselves: boolean;
  anonymousReviewee: boolean;
  anonymousReviewer: boolean;
  overwriteBindings: boolean;

  acceptingResponses: boolean;
  allowResponseEdits: boolean;
  shuffleReviewForms: boolean;

  nonce: string;
  actionUrl: string;
  gid: string;
  resultUrl: string;
  summaryUrl: string;
}

export const CONFIG_METADATA_RANGE = "A1:B26";
export const REVIEW_BINDING_ROW_RANGE_START = "A28:J28";
export const REVIEW_BINDING_ROW_START = 28;

export function startConfig(callback: Function) {
  clearReviewConfig();
  checkSheetName("submissions:");
  getSelectedSubmissionsSheetUrl();
  callback();
}

export function clearReviewConfig() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty("reviewSheetName");
}

export function checkSheetName(sheetNamePrefix: string | null) {
  const sheet = SpreadsheetApp.getActiveSheet();
  if (
    sheetNamePrefix != null &&
    !sheet.getSheetName().startsWith(sheetNamePrefix)
  ) {
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

export function getSelectedSubmissionsSheetUrl() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getSheetName().startsWith("submissions:")) {
    return createSpreadsheetUrl(ss, sheet);
  } else {
    return null;
  }
}

export function storeFormSrcTypeAndUrl(url: string) {
  const userProperties = PropertiesService.getUserProperties();
  if (url.indexOf("/forms/d/") > 0) {
    const form = FormApp.openByUrl(url);
    userProperties.setProperty("formSrcType", "form");
    userProperties.setProperty("formSrcUrl", url);
    userProperties.setProperty("formSrcTitle", form.getTitle());
  } else if (isSpreadsheetUrl(url)) {
    const formTitle = getConfigPropertyValueFromSpreadsheetUrl(url, "title");
    userProperties.setProperty("formSrcType", "spreadsheet");
    userProperties.setProperty("formSrcUrl", url);
    userProperties.setProperty("formSrcTitle", formTitle);
  } else {
    Logger.log("ERROR: setFormSrcPropertiesWithUrlParams: " + url);
    throw new Error("invalid url:" + url);
  }
}

export function setPropertiesWithSheet(sheet: Sheet) {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty("reviewSheetName", sheet.getSheetName());
}

export function storeGroupSheetUrl(url: string) {
  const userProperties = PropertiesService.getUserProperties();
  if (isSpreadsheetUrl(url)) {
    userProperties.setProperty("groupSrcUrl", url);
  } else {
    throw new Error("invalid url:" + url);
  }
}

export function storeSubmissionsSheetUrl(url: string) {
  const userProperties = PropertiesService.getUserProperties();
  if (isSpreadsheetUrl(url)) {
    userProperties.setProperty("submissionsUrl", url);
  } else {
    throw new Error("invalid url:" + url);
  }
}

export function startReviewConfig() {
  const title = "評価を準備...";
  const html = HtmlService.createTemplateFromFile("reviewConfig");
  SpreadsheetApp.getUi().showSidebar(html.evaluate().setTitle(title));
}

export function getReviewConfigFromSheet(sheet: Sheet) {
  const ret: { [key: string]: string | number | boolean | null } = {};
  const values = sheet.getRange(CONFIG_METADATA_RANGE).getValues() as Array<
    Array<string | number | boolean | null>
  >;
  values.forEach((value) => {
    ret[value[0] as string] = value[1];
  });
  return ret;
}

export function initializeReviewConfig() {
  const userProperties = PropertiesService.getUserProperties();
  const reviewSheetName = userProperties.getProperty("reviewSheetName");

  const configValuesFromSpreadsheet = (() => {
    if (reviewSheetName) {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
        reviewSheetName
      );
      return getReviewConfigFromSheet(sheet);
    } else {
      return {
        nonce: createNonce(),
      };
    }
  })();

  const configValuesFromUserProperties = (() => {
    if (reviewSheetName) {
      return {};
    } else {
      const {
        courseId,
        courseName,
        courseWorkId,
        courseWorkTitle,
      } = getSelectedCourseWorks();
      const userProperties = PropertiesService.getUserProperties();
      const formSrcType = userProperties.getProperty("formSrcType");
      const formSrcUrl = userProperties.getProperty("formSrcUrl");
      const formSrcTitle = userProperties.getProperty("formSrcTitle");
      const groupSrcUrl = userProperties.getProperty("groupSrcUrl");
      const submissionsUrl = userProperties.getProperty("submissionsUrl");
      const resultUrl = userProperties.getProperty("resultUrl");
      const summaryUrl = userProperties.getProperty("summaryUrl");
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
        resultUrl,
        summaryUrl,
      };
    }
  })();

  return {
    ...configValuesFromSpreadsheet,
    ...configValuesFromUserProperties,
  };
}

const getConfigPropertyValueFromSpreadsheetUrl = (
  url: string,
  command: string
) => {
  const sheet = openSheetByUrl(url);
  return getConfigPropertyValueFromSheet(sheet, command);
};
const getConfigPropertyValueFromSheet = (sheet: Sheet, command: string) => {
  const row = sheet
    .getDataRange()
    .getValues()
    .find((row) => row[0] === command);
  return row && row.length > 0 ? row[1] : null;
};

export function configJsonToValues(
  config: ReviewConfig
): Array<Array<number | string | boolean | null>> {
  return [
    ["courseId", config.courseId],
    ["courseName", config.courseName],
    ["courseWorkId", config.courseWorkId],
    ["courseWorkTitle", config.courseWorkTitle],
    ["submissionsUrl", config.submissionsUrl],

    ["groupSrcUrl", config.groupSrcUrl],
    ["formSrcType", config.formSrcType],
    ["formSrcUrl", config.formSrcUrl],
    ["formSrcTitle", config.formSrcTitle],
    ["reviewerSrcType", config.reviewerSrcType],

    ["reviewerSrcSpreadsheetUrl", config.reviewerSrcSpreadsheetUrl],
    ["revieweeSrcType", config.revieweeSrcType],

    ["anonymousReviewee", config.anonymousReviewee],
    ["anonymousReviewer", config.anonymousReviewer],

    ["binding", config.binding],
    ["numReviewRequired", config.numReviewRequired],
    ["reviewThemselves", config.reviewThemselves],

    ["overwriteBindings", config.overwriteBindings],

    ["allowResponseEdits", config.allowResponseEdits],
    ["shuffleReviewForms", config.shuffleReviewForms],
    ["acceptingResponses", config.acceptingResponses],

    ["nonce", config.nonce],
    ["actionUrl", config.actionUrl],
    ["resultUrl", config.resultUrl],
    ["summaryUrl", config.summaryUrl],

    ["", ""], // separator
  ];
}

function selectConfigSheet(config: ReviewConfig): Sheet {
  const userProperties = PropertiesService.getUserProperties();
  const configSheetUrl = userProperties.getProperty("configSheetUrl");
  const sheetTitle =
    "config:" + config.courseName + " " + config.courseWorkTitle;
  if (configSheetUrl) {
    return openSheetByUrl(configSheetUrl);
  } else {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetTitle);
    if (!sheet) {
      sheet = ss.insertSheet(sheetTitle);
      sheet.setTabColor("blue");
    }
    return sheet;
  }
}

const initializeResultSheet = (config: ReviewConfig) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSrc = getFormSrc(config.formSrcType, config.formSrcUrl);
  const columnNames = jsonToFormColumnNames(formSrc);
  let resultSheet =
    config.resultUrl &&
    config.resultUrl.length > 0 &&
    openSheetByUrl(config.resultUrl);
  if (!resultSheet) {
    const resultSheetName =
      "result:" + config.courseName + " " + config.courseWorkTitle;
    resultSheet = ss.getSheetByName(resultSheetName);
    if (!resultSheet) {
      resultSheet = ss.insertSheet(resultSheetName).setTabColor("magenta");
      resultSheet.appendRow([
        "タイムスタンプ",
        "評価者通し番号",
        "評価者メールアドレス",
        "評価者氏名",
        "評価者写真URL",
        "評価者ハッシュ値",
        "被評価者通し番号",
        "被評価者メールアドレス",
        "被評価者氏名",
        "被評価者写真URL",
        "被評価者ハッシュ値",
        ...columnNames,
      ]);
    }
    config.resultUrl = ss.getUrl() + "#gid=" + resultSheet.getSheetId();
  }
  return config.resultUrl;
};

const initializeSummarySheet = (config: ReviewConfig) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let summarySheet =
    config.summaryUrl &&
    config.summaryUrl.length > 0 &&
    openSheetByUrl(config.summaryUrl);
  if (!summarySheet) {

    const formSrc = getFormSrc(config.formSrcType, config.formSrcUrl);

    const revieweeColumns = [] as string[]; // FIXME : サマリーの表のカラムを設計

    const summarySheetName = "summary:" + config.courseName + " " + config.courseWorkTitle;
    summarySheet = ss.getSheetByName(summarySheetName);

    if (!summarySheet) {
      summarySheet = ss.insertSheet(summarySheetName);
      summarySheet.setTabColor("#8888ff");
      summarySheet.appendRow([
        "評価者通し番号",
        "評価者メールアドレス",
        "評価者名",
        "評価者ハッシュ値",
        "スコア",
        "平均点",
        "順位"
      ]);
    }
    config.summaryUrl = ss.getUrl() + "#gid=" + summarySheet.getSheetId();
  }
  return config.summaryUrl;
};

export function submitReviewConfig(config: ReviewConfig) {
  const resultUrl = initializeResultSheet(config);
  const summaryUrl = initializeSummarySheet(config);

  const configValues = configJsonToValues(config);

  const sheet = selectConfigSheet(config);
  const gid = sheet.getSheetId().toString();
  const actionUrl = process.env.DEPLOYED_URL + "?gid=" + gid;

  submitPropertyValue(config, "actionUrl", actionUrl);
  submitPropertyValue(config, "resultUrl", resultUrl);
  submitPropertyValue(config, "summaryUrl", summaryUrl);

  const reviewers: Array<Reviewer> = createReviewers(config);
  const startRow = configValues.length + 1;

  const firstBindingValues = sheet
    .getRange(REVIEW_BINDING_ROW_RANGE_START)
    .getValues();
  const hasDefinedBindings =
    firstBindingValues[0][0] && firstBindingValues[0][0].length > 0;

  if (!hasDefinedBindings || config.overwriteBindings) {
    const reviews = createAssignedReviews(
      config,
      reviewers,
      createReviewees(config)
    );
    storeReviewAssignmentsToSheet(config, reviews, sheet, startRow);
  } else {
    importReviewAssignmentsFromSheet(config, reviewers, sheet, startRow);
  }

  // ['評価者通し番号','評価者メールアドレス','評価者氏名','被評価者の通し番号','被評価者メールアドレス','被評価者氏名','評価者のハッシュ値', '評価者のハッシュ値']
  return actionUrl;
}

export function submitPropertyValue(
  config: ReviewConfig,
  key: string,
  value: string
) {
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
    openUrl("Please wait to open the reviewConfig page...", actionUrl);
  } else {
    SpreadsheetApp.getUi().alert("Invalid URL: " + actionUrl);
  }
}

export function openResultSheet(resultUrl: string | undefined) {
  if (!resultUrl) {
    const sheet = SpreadsheetApp.getActiveSheet();
    resultUrl = getConfigPropertyValueFromSheet(sheet, "resultUrl");
  }
  openUrl("Please wait to open the resultSheet...", resultUrl);
}

export function openSummarySheet(summaryUrl: string | undefined) {
  if (!summaryUrl) {
    const sheet = SpreadsheetApp.getActiveSheet();
    summaryUrl = getConfigPropertyValueFromSheet(sheet, "summaryUrl");
  }
  openUrl("Please wait to open the resultSheet...", summaryUrl);
}

export function initializeFormPreviewPage(gid: string) {
  const formSrc = getFormSrc(
    "spreadsheet",
    SpreadsheetApp.getActiveSpreadsheet().getUrl() + "?gid=" + gid
  );
  const surveyJs = jsonToSurveyJs(formSrc);
  return {
    surveyJs,
    gid,
  };
}
