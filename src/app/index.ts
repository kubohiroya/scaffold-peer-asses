import { onOpen } from "./onOpen";
import {importCourseStudents,importCourseTeachers,importCourseWorks,importCourses,importStudentSubmissions,} from "./classroom/classroomToSheet";
import { exportForm, exportFormWithDialog } from "./form/exportForm";
import { importForm, importFormWithDialog } from "./form/importForm";

declare const global: {
  [x: string]: unknown;
};

global.onOpen = onOpen;
global.importCourses = importCourses;
global.importCourseTeachers = importCourseTeachers;
global.importCourseStudents = importCourseStudents;
global.importCourseWorks = importCourseWorks;
global.importStudentSubmissions = importStudentSubmissions;

global.importForm = importForm;
global.importFormWithDialog = importFormWithDialog;
global.exportForm = exportForm;
global.exportFormWithDialo = exportFormWithDialog;

