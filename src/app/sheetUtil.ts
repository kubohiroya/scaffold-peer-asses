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

export const getSheetByUrl = (url: string)=>{
  const ss = SpreadsheetApp.openByUrl(url);
  const gid = parseInt(url.split(/\#gid=/)[1]);
  return ss.getSheets().find(sheet=>sheet.getSheetId() === gid);
}

