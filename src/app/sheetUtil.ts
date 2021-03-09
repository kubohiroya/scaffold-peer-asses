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
