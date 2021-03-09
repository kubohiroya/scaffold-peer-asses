import getMessages from "./messages";
import sheetToJson from "./sheetToJson";
import { jsonToForm } from "./jsonToForm";
import Form = GoogleAppsScript.Forms.Form;
const uiMessages = getMessages(Session.getActiveUserLocale())["ui"];

export function exportFormWithDialog() {
  const inputBoxTitle = uiMessages["export form"];

  /*
  function inputFormTitleWithDialog() {
    const step = "(Step 1 of 3)";
    const formTitle = Browser.inputBox(
      inputBoxTitle + step,
      uiMessages["form title"],
      Browser.Buttons.OK_CANCEL
    );
    if (formTitle === "cancel") {
      throw uiMessages["form export canceled"];
    } else if (formTitle === "") {
      return uiMessages["new form"];
    }
    return formTitle;
  }


          const spreadsheet = SpreadsheetApp.openByUrl(input);
        const gid = parseInt(input.split("?gid=")[1]);
        sheet = spreadsheet
          .getSheets()
          .find((sheet) => sheet.getSheetId() === gid);
        if (!sheet) {
          throw new Error();
        }


*/


  function getFormTitle(): string {
    const input = Browser.inputBox(
      inputBoxTitle,
      uiMessages["form title"],
      Browser.Buttons.OK_CANCEL
    );
    if (input === "cancel") {
      throw uiMessages["form export canceled"];
    }
    if (input === "") {
      return getFormTitle();
    }
    return input;
  }


  try {
    const title = getFormTitle();

    const sheet = SpreadsheetApp.getActiveSheet();

    const idRows = sheet
      .getRange(1, 1, sheet.getLastRow(), 2)
      .getValues()
      .filter(function (row) {
        return row[0] === "id" && row[1] !== "";
      });
    const id = idRows[0][1];
    const json = sheetToJson(sheet);
    const form: Form = FormApp.openById(id)
    for(let index = form.getItems().length - 1; index >= 0; index--){
      form.deleteItem(index)
    }
    jsonToForm(json, form);
    const file = DriveApp.getFileById(form.getId());
    form.setTitle(title);
    file.setName(title);

  } catch (exception) {
    Logger.log(exception);
    if (exception.stack) {
      Logger.log(exception.stack);
    }
    Browser.msgBox(
      uiMessages["form export failed."] +
        "\\n" +
        JSON.stringify(exception, null, " ")
    );
  }
}

export function exportForm() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const json = sheetToJson(sheet);
    const form = jsonToForm(json, null);
    const file = DriveApp.getFileById(form.getId());
    file.setName(form.getTitle());
    Browser.msgBox(
      uiMessages["form export succeed."] +
        "\\n" +
        "URL: \\n" +
        form.shortenFormUrl(form.getPublishedUrl())
    );
  } catch (exception) {
    Logger.log(exception);
    if (exception.stack) {
      Logger.log(exception.stack);
    }
    Browser.msgBox(
      uiMessages["form export failed."] +
        "\\n" +
        JSON.stringify(exception, null, " ")
    );
  }
}
