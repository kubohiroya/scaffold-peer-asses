export function openURL(title: string, url: string){
  const html = HtmlService.createTemplateFromFile('openURL');
  html.url = url;
  SpreadsheetApp.getUi()
    .showModalDialog(
      html.evaluate().setHeight(50),
      title
    )
}
