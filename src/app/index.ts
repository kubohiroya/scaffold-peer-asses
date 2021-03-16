import { onOpen } from "./onOpen";
import {
  importCourseStudents,
  importCourseTeachers,
  importCourseWorks,
  importCourses,
  importStudentSubmissions,
} from "./classroom/importClassroom";
import {updateForm, exportFormWithDialog, previewForm} from "./form/updateForm";
import {formToSheet, importForm, importFormWithDialog, importFormWithPicker} from "./form/importForm";
import {
  updateCourses,
  updateCourseStudents,
  updateCourseTeachers,
  updateCourseWorks
} from './classroom/updateClassroom';
import {doGet, initializeReviewPage} from './review/doGet';
import {getOAuthToken, showAlert} from './picker/picker';
import {getCreatedAtUpdatedAtValues} from './driveFileUtil';
import {
  continueConfig,
  initializeReviewConfig,
  initializeFormPreviewPage,
  openReviewPage,
  setFormSrcPropertiesWithUrlParams,
  setGroupSrcPropertiesWithUrlParams,
  startReviewConfig,
  startConfigWithGroupSubmissionsWithInputBox, startConfigWithGroupSubmissionsWithPicker,
  startConfigWithSubmissionsWithInputBox,
  startConfigWithSubmissionsWithPicker, startFormPicker,
  submitReviewConfig, submitPropertyValue, openResultSheet
} from './reviewConfig/reviewConfig';

declare const global: {
  [x: string]: unknown;
};

export function withDriveItemPickHandler(ev: any): void {
  try {
    const {command, url} = ev;
    if (command === 'onFormItemImported') {
      const form = FormApp.openByUrl(url);
      const {createdAt, updatedAt} = getCreatedAtUpdatedAtValues(form.getId());
      formToSheet(form, createdAt, updatedAt, null);
    } else if (command === 'startFormPicker') {
      setGroupSrcPropertiesWithUrlParams(url);
      startFormPicker();
    } else if (command === 'startReviewConfig') {
      setFormSrcPropertiesWithUrlParams(url);
      startReviewConfig();
    } else {
      throw new Error("InvalidCommand:" + command);
    }
  } catch (error) {
    throw new Error("InvalidParam:" + JSON.stringify(ev));
  }
}

global.onOpen = onOpen;

global.importCourses = importCourses;
global.importCourseTeachers = importCourseTeachers;
global.importCourseStudents = importCourseStudents;
global.importCourseWorks = importCourseWorks;
global.importStudentSubmissions = importStudentSubmissions;

global.updateCourses = updateCourses;
global.updateCourseTeachers = updateCourseTeachers;
global.updateCourseStudents = updateCourseStudents;
global.updateCourseWorks = updateCourseWorks;

global.importForm = importForm;
global.importFormWithDialog = importFormWithDialog;
global.importFormWithPicker = importFormWithPicker;

global.exportFormWithDialog = exportFormWithDialog;
global.updateForm = updateForm;
global.previewForm = previewForm;

global.withDriveItemPickHandler = withDriveItemPickHandler;
global.getOAuthToken = getOAuthToken;
global.showAlert = showAlert;

global.startConfigWithSubmissionsWithPicker = startConfigWithSubmissionsWithPicker;
global.startConfigWithSubmissionsWithInputBox = startConfigWithSubmissionsWithInputBox;
global.startConfigWithGroupSubmissionsWithPicker = startConfigWithGroupSubmissionsWithPicker;
global.startConfigWithGroupSubmissionsWithInputBox = startConfigWithGroupSubmissionsWithInputBox;

global.continueConfig = continueConfig;
global.openReviewPage = openReviewPage;
global.openResultSheet = openResultSheet;

global.startReviewConfig = startReviewConfig;
global.initializeReviewConfig = initializeReviewConfig;
global.submitReviewConfig = submitReviewConfig;
global.submitPropertyValue = submitPropertyValue;

global.doGet = doGet;
global.initializeReviewPage = initializeReviewPage;
global.initializeFormPreviewPage = initializeFormPreviewPage;
