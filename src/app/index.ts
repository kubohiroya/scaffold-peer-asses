import {onOpen} from "./onOpen";
import {
  importCourses,
  importCourseStudents,
  importCourseTeachers,
  importCourseWorks,
  importStudentSubmissions,
} from "./classroom/importClassroom";
import {exportFormWithDialog, previewForm, updateForm} from "./form/updateForm";
import {importForm, importFormWithDialog, importFormWithPicker} from "./form/importForm";
import {
  updateCourses,
  updateCourseStudents,
  updateCourseTeachers,
  updateCourseWorks
} from './classroom/updateClassroom';
import {doGet, initializeReviewPage, submitReviewArticle} from './review/doGet';
import {getOAuthToken, showAlert} from './picker/picker';
import {
  continueConfig,
  initializeFormPreviewPage,
  initializeReviewConfig,
  openResultSheet,
  openReviewPage,
  openSummarySheet,
  startReviewConfig,
  submitPropertyValue,
  submitReviewConfig
} from './reviewConfig/reviewConfig';
import {
  pickerHandler,
  startConfigWithGroupSubmissionsWithInputBox,
  startConfigWithGroupSubmissionsWithPicker,
  startConfigWithSubmissionsWithInputBox,
  startConfigWithSubmissionsWithPicker
} from './execute';

declare const global: {
  [x: string]: unknown;
};

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

global.pickerHandler = pickerHandler;
global.getOAuthToken = getOAuthToken;
global.showAlert = showAlert;

global.startConfigWithSubmissionsWithPicker = startConfigWithSubmissionsWithPicker;
global.startConfigWithSubmissionsWithInputBox = startConfigWithSubmissionsWithInputBox;
global.startConfigWithGroupSubmissionsWithPicker = startConfigWithGroupSubmissionsWithPicker;
global.startConfigWithGroupSubmissionsWithInputBox = startConfigWithGroupSubmissionsWithInputBox;

global.continueConfig = continueConfig;
global.openReviewPage = openReviewPage;
global.openResultSheet = openResultSheet;
global.openSummarySheet = openSummarySheet;

global.startReviewConfig = startReviewConfig;
global.initializeReviewConfig = initializeReviewConfig;
global.submitReviewConfig = submitReviewConfig;
global.submitPropertyValue = submitPropertyValue;

global.doGet = doGet;
global.initializeReviewPage = initializeReviewPage;
global.initializeFormPreviewPage = initializeFormPreviewPage;
global.submitReviewArticle = submitReviewArticle;
global.pickerHandler = pickerHandler;

