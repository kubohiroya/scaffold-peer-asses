export function openUrl(title: string, url: string){
  const template = HtmlService.createTemplateFromFile('openURL');
  template.url = url;
  SpreadsheetApp.getUi()
    .showModalDialog(
      template.evaluate().setHeight(50),
      title
    )
}
