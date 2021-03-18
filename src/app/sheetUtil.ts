import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

export const createOrSelectSheetBySheetName = (name: string, tabColor: string) => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(name);
  }
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
  sheet.setTabColor(tabColor);
  return sheet;
};

export const getSchema = (sheetName: string) => {
  return sheetName.split(":")[0];
};

export const openSheetByUrl = (url: string)=>{
  const ss = SpreadsheetApp.openByUrl(url);
  const gid = parseInt(url.split(/\#gid=/)[1]);
  return ss.getSheets().find(sheet=>sheet.getSheetId() === gid);
}

export const isSpreadsheetUrl = (url: string) => {
  return url.indexOf("/spreadsheets/d/") > 0 && url.indexOf("#gid=") > 0;
}

export const createSpreadsheetUrl = (ss: Spreadsheet, sheet: Sheet) => {
  return "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/edit#gid=" + sheet.getSheetId();
}
