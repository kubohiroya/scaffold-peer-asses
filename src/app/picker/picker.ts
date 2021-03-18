export function showPicker(title: string, mimeTypes: string[], command: string[], cursor: number) {
  const picker = HtmlService.createTemplateFromFile('picker') as any;
  picker.apiKey = process.env.PICKER_API_KEY;
  picker.mimeType = mimeTypes.join(",");
  picker.command = command.join(",");
  picker.cursor = ""+cursor;
  SpreadsheetApp.getUi().showModelessDialog(picker.evaluate().setWidth(1055).setHeight(654).setTitle(title), title);
}

//Access Tokenを取得する
export function getOAuthToken() {
  //DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

//エラーメッセージの表示
export function showAlert(msg: string) {
  const ui = SpreadsheetApp.getUi();
  ui.alert(msg);
}
