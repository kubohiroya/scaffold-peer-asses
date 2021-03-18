import {FormObject} from './types';
import {getCreatedAtUpdatedAtValues} from '../driveFileUtil';
import formToJson from './formToJson';
import {openSheetByUrl} from '../sheetUtil';
import sheetToJson from './sheetToJson';

export function getFormSrc(formSrcType: string, formSrcUrl: string) {
  const props = PropertiesService.getScriptProperties();
  let formSrcString = props.getProperty(formSrcUrl);
  let formSrc = formSrcString && JSON.parse(formSrcString) as FormObject;

  if (formSrcType === 'form') {
    const form = FormApp.openByUrl(formSrcUrl);
    const {createdAt, updatedAt} = getCreatedAtUpdatedAtValues(form.getId());
    if (!formSrc || formSrc.metadata.updatedAt !== updatedAt) {
      formSrc = formToJson(form, createdAt, updatedAt);
      const formSrcString = JSON.stringify(formSrc)
      props.setProperty(formSrcUrl, formSrcString);
    }
  } else if (formSrcType === 'spreadsheet') {
    const ss = SpreadsheetApp.openByUrl(formSrcUrl);
    const sheet = openSheetByUrl(formSrcUrl) || SpreadsheetApp.getActiveSheet();
    const {createdAt, updatedAt} = getCreatedAtUpdatedAtValues(ss.getId());
    if (!formSrc || formSrc.metadata.updatedAt !== updatedAt) {
      formSrc = sheetToJson(sheet, createdAt, updatedAt)
      const formSrcString = JSON.stringify(formSrc)
      props.setProperty(formSrcUrl, formSrcString);
    }
  } else {
    throw new Error("Invalid formSrcType: " + formSrcType);
  }
  return formSrc;
}
