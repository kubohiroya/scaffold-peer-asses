/// <reference types="@types/google-apps-script" />
/**
 * Create a sheet of Google Spreadsheet by JSON object containing values representing Google Form contents.
 * @param json {Object} JSON object containing values representing Google Form contents
 * @param sheet {Object} output target sheet of Google Spreadsheet
 * */
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
export default function jsonToSheet(json: any, sheet: Sheet): void;
