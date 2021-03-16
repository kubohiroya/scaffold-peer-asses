import getMessages from "./messages";
import sheetToJson from "./sheetToJson";
import { jsonToForm } from "./jsonToForm";
import {getCreatedAtUpdatedAtValues} from '../driveFileUtil';
import {openURL} from '../openURL';
const uiMessages = getMessages(Session.getActiveUserLocale())["ui"];


export function exportFormWithDialog() {

  const inputBoxTitle = uiMessages["update form"];

  function getFormTitle(): string {
    const input = Browser.inputBox(
      inputBoxTitle,
      uiMessages["form title"],
      Browser.Buttons.OK_CANCEL
    );
    if (input === "cancel") {
      throw uiMessages["form update canceled"];
    }
    if (input === "") {
      return getFormTitle();
    }
    return input;
  }

  const title = getFormTitle();

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const {createdAt, updatedAt} = getCreatedAtUpdatedAtValues(ss.getId());
    const sheet = ss.getActiveSheet();

    const json = sheetToJson(sheet, createdAt, updatedAt);
    const form = FormApp.create(json.metadata.title);
    jsonToForm(json, form);

    const file = DriveApp.getFileById(form.getId());
    form.setTitle(title);
    file.setName(title);

    openURL('Please wait to open the form page...', form.getPublishedUrl());

  } catch (exception) {
    Logger.log(exception);
    if (exception.stack) {
      Logger.log(exception.stack);
    }
    Browser.msgBox(
      uiMessages["form update failed."] +
        "\\n" +
        JSON.stringify(exception, null, " ")
    );
  }
}

export function updateForm() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const {createdAt, updatedAt} = getCreatedAtUpdatedAtValues(ss.getId());
    const sheet = ss.getActiveSheet();
    const json = sheetToJson(sheet, createdAt, updatedAt);

    const form = FormApp.openById(json.metadata.id);
    for(let index = form.getItems().length - 1; index >= 0; index--){
      form.deleteItem(index)
    }
    jsonToForm(json, form);

    const file = DriveApp.getFileById(form.getId());
    file.setName(form.getTitle());

    Browser.msgBox(
      uiMessages["form update succeed."] +
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
      uiMessages["form update failed."] +
      "\\n" +
      JSON.stringify(exception, null, " ")
    );
  }
}

export function previewForm(){
  const title = "フォームをプレビュー...";
  const html = HtmlService.createTemplateFromFile('form');
  html.gid = SpreadsheetApp.getActiveSheet().getSheetId();
  SpreadsheetApp.getUi().showModelessDialog(html.evaluate().setWidth(1055).setHeight(654).setTitle(title), title);
}
