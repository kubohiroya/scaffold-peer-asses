import formToJson from "./formToJson";
import jsonToSheet from "./jsonToSheet";
import getMessages from "./messages";
import Form = GoogleAppsScript.Forms.Form;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import {getCreatedAtUpdatedAtValues} from '../driveFileUtil';
import {startFormPicker} from '../execute';
const uiMessages = getMessages(Session.getActiveUserLocale())["ui"];

export function importFormWithPicker(): void {
  startFormPicker();
}

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
    if (input.endsWith("/edit")) {
      form = FormApp.openByUrl(input);
    }
    if (!form) {
      Browser.msgBox(uiMessages["invalid form URL"] + ": " + input);
      return importFormDialog();
    }
    return form;
  }

  const form = importFormDialog();
  const {createdAt, updatedAt} = getCreatedAtUpdatedAtValues(form.getId());
  formToSheet(form, createdAt, updatedAt, null);
}

export function importForm(): void {
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
  const {createdAt, updatedAt} = getCreatedAtUpdatedAtValues(id);
  formToSheet(form, createdAt, updatedAt, sheet);
}

export function formToSheet(form: Form, createdAt:number, updatedAt: number, sheet: Sheet): void {
  try {
    const json = formToJson(form, createdAt, updatedAt);

    if(! sheet){
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const title = "form:"+json.metadata.title;
      sheet = spreadsheet.getSheetByName(title);
      if(! sheet){
        sheet = spreadsheet.insertSheet();
        sheet.setName(title);
      }else{
        sheet.clear();
      }
      sheet.setTabColor("purple");
      spreadsheet.setActiveSheet(sheet);
    }

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
