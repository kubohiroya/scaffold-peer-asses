export function showPicker(title: string, mimeTypes: string[], callbackCommand: string) {
  const html = HtmlService.createTemplateFromFile('picker');
  (html as any).apiKey = process.env.PICKER_API_KEY;
  (html as any).mimeType = mimeTypes.join(",");
  (html as any).command = callbackCommand;
  SpreadsheetApp.getUi().showModelessDialog(html.evaluate().setWidth(1055).setHeight(654).setTitle(title), title);
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
