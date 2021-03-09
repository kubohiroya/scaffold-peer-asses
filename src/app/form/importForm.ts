import formToJson from "./formToJson";
import jsonToSheet from "./jsonToSheet";
import getMessages from "./messages";
import Form = GoogleAppsScript.Forms.Form;
const uiMessages = getMessages(Session.getActiveUserLocale())["ui"];

export function importFormWithDialog(): void {
  const inputBoxTitle = uiMessages["import form"];

  function importFormDialog(): Form {
    const input = Browser.inputBox(
      inputBoxTitle,
      "input source form URL",
      Browser.Buttons.OK_CANCEL
    );
    if (input === "cancel") {
      throw uiMessages["form import canceled"];
    }
    let form = null;
    if (input === "") {
      form = FormApp.getActiveForm();
    } else if (input.endsWith("/edit")) {
      form = FormApp.openByUrl(input);
    }else{
      // FIXME
    }
    if (!form) {
      Browser.msgBox(uiMessages["invalid form URL"] + ": " + input);
      return importFormDialog();
    }
    return form;
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  try {
    const form = importFormDialog();
    const sheet = spreadsheet.insertSheet();
    const json = formToJson(form);
    // Logger.log(JSON.stringify(json, null, "  "));
    jsonToSheet(json, sheet);
  } catch (exception) {
    Logger.log(exception);
    if (exception.stack) {
      Logger.log(exception.stack);
    }
    Browser.msgBox(
      uiMessages["form import failed."] +
        "\\n" +
        JSON.stringify(exception, null, " ")
    );
  }
}

export function importForm(): void {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();

    const idRows = sheet
      .getRange(1, 1, sheet.getLastRow(), 2)
      .getValues()
      .filter(function (row) {
        return row[0] === "id" && row[1] !== "";
      });
    if (idRows.length === 0) {
      throw "`form id` row is not defined.";
    }
    const id = idRows[0][1];
    const form = FormApp.openById(id);
    const json = formToJson(form);

    sheet.setName("form:"+json.metadata.title);
    sheet.setTabColor("purple");

    jsonToSheet(json, sheet);
  } catch (exception) {
    Logger.log(exception);
    if (exception.stack) {
      Logger.log(exception.stack);
    }
    Browser.msgBox(
      uiMessages["form import failed."] +
        "\\n" +
        JSON.stringify(exception, null, " ")
    );
  }
}
