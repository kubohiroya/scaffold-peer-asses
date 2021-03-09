/// <reference types="@types/google-apps-script" />
/**
 * Create a Google Form by a sheet of Google Spreadsheet containing values representing Google Form contents.
 * @param sheet {Object} sheet of Google Spreadsheet containing values representing Google Form contents
 * @param [formTitle] {string} form title (optional)
 * */
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import { FormObject } from "./types";
export default function sheetToJson(sheet: Sheet): FormObject;
