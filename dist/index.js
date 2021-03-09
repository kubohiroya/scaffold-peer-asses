function onOpen() {
}
function importCourses() {
}
function importCourseTeachers() {
}
function importCourseStudents() {
}
function importCourseWorks() {
}
function importStudentSubmissions() {
}
function importForm() {
}
function importFormWithDialog() {
}
function exportForm() {
}
function exportFormWithDialo() {
}/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app/classroom/classroomToSheet.ts":
/*!***********************************************!*\
  !*** ./src/app/classroom/classroomToSheet.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.importStudentSubmissions = exports.importCourseWorks = exports.importCourseStudents = exports.importCourseTeachers = exports.importCourses = void 0;
var selectors_1 = __webpack_require__(/*! ./selectors */ "./src/app/classroom/selectors.ts");
var sheetUtil_1 = __webpack_require__(/*! ../sheetUtil */ "./src/app/sheetUtil.ts");
var teacherProfiles = new Map();
var studentProfiles = new Map();
//const CourseMap = new Map<number, Course>();
//const CourseWorkMap = new Map<number, CourseWork>();
var timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
function formatDateTime(datetime) {
    if (datetime) {
        return Utilities.formatDate(new Date(datetime), timezone, "yyyy/MM/dd HH:mm:ss");
    }
    else {
        return "(invalid date)";
    }
}
function listCourses(teacherId) {
    if (!Classroom.Courses) {
        throw new Error("Classroom.Courses is null");
    }
    var nextPageToken = "";
    var courses = [];
    do {
        var optionalArgs = {
            pageSize: 100,
            teacherId: teacherId,
            courseStates: "ACTIVE",
            pageToken: "",
        };
        if (nextPageToken) {
            optionalArgs.pageToken = nextPageToken;
        }
        var coursesResponse = Classroom.Courses.list(optionalArgs);
        nextPageToken = coursesResponse.nextPageToken;
        if (coursesResponse.courses) {
            coursesResponse.courses.forEach(function (course) {
                courses.push(course);
                // course.id && CourseMap.set(course.id, course);
            });
        }
    } while (nextPageToken != undefined);
    return courses;
}
function listStudentProfiles(courseId) {
    if (!Classroom.Courses || !Classroom.Courses.Students) {
        throw new Error("Classroom.Courses is null");
    }
    var students = [];
    var nextPageToken = null;
    do {
        var optionalArgs = {
            pageSize: 64,
            pageToken: "",
        };
        if (nextPageToken) {
            optionalArgs.pageToken = nextPageToken;
        }
        var listStudentsResponse = Classroom.Courses.Students.list(courseId, optionalArgs);
        nextPageToken = listStudentsResponse.nextPageToken;
        if (listStudentsResponse.students) {
            students = students.concat(listStudentsResponse.students);
        }
    } while (nextPageToken != undefined);
    return students;
}
function getTeacherProfile(courseId, teacherId) {
    if (!Classroom.Courses || !Classroom.Courses.Teachers) {
        throw new Error("Classroom.Courses is null");
    }
    var profile = teacherProfiles.get(teacherId);
    if (!profile) {
        var teacher = Classroom.Courses.Teachers.get(courseId, teacherId);
        if (teacher.profile) {
            teacherProfiles.set(teacherId, teacher.profile);
            return teacher.profile;
        }
        else {
            return {
                name: { fullName: "(" + teacherId + ")" },
                emailAddress: teacherId,
            };
        }
    }
    else {
        return profile;
    }
}
function listTeacherProfiles(courseId) {
    if (!Classroom.Courses || !Classroom.Courses.Teachers) {
        throw new Error("Classroom.Courses is null");
    }
    var teachers = [];
    var nextPageToken = null;
    do {
        var optionalArgs = {
            pageSize: 64,
            pageToken: "",
        };
        if (nextPageToken) {
            optionalArgs.pageToken = nextPageToken;
        }
        var teacherList = Classroom.Courses.Teachers.list(courseId, optionalArgs);
        nextPageToken = teacherList.nextPageToken;
        if (teacherList.teachers) {
            teachers = teachers.concat(teacherList.teachers);
        }
    } while (nextPageToken != undefined);
    return teachers;
}
function getStudentProfile(courseId, studentId) {
    if (!Classroom.Courses || !Classroom.Courses.Students) {
        throw new Error("Classroom.Courses is null");
    }
    var profile = studentProfiles.get(studentId);
    if (!profile) {
        var student = Classroom.Courses.Students.get(courseId, studentId);
        if (student.profile) {
            studentProfiles.set(studentId, student.profile);
            return student.profile;
        }
        else {
            return {
                name: { fullName: "(" + studentId + ")" },
                emailAddress: studentId,
            };
        }
    }
    else {
        return profile;
    }
}
function getNumStudents(courseId) {
    if (!Classroom.Courses || !Classroom.Courses.Students) {
        throw new Error("Classroom.Courses is null");
    }
    var students = Classroom.Courses.Students.list(courseId);
    if (students.students) {
        return students.students.length;
    }
    else {
        return 0;
    }
}
function listCourseWorks(courseId, courseName) {
    if (!Classroom.Courses || !Classroom.Courses.CourseWork) {
        throw new Error("Classroom.Courses is null");
    }
    var nextPageToken = undefined;
    var courseWorks = [];
    do {
        var optionalArgs = {
            pageSize: 32,
            pageToken: "",
        };
        if (nextPageToken) {
            optionalArgs.pageToken = nextPageToken;
        }
        var courseWorksResponse = Classroom.Courses.CourseWork.list(courseId, optionalArgs);
        nextPageToken = courseWorksResponse.nextPageToken;
        if (!courseWorksResponse.courseWork) {
            throw new Error("NoCourseWorks");
        }
        courseWorksResponse.courseWork.forEach(function (courseWork) {
            if (courseWork && courseWork.id && courseWork.courseId) {
                // CourseMap.set(courseWork.courseId, { name: courseName });
                courseWorks.push(courseWork);
                // CourseWorkMap.set(courseWork.id, courseWork);
            }
        });
    } while (nextPageToken != undefined);
    return courseWorks;
}
function listStudentSubmissions(courseId, courseName, courseWorkId) {
    if (!Classroom.Courses ||
        !Classroom.Courses.CourseWork ||
        !Classroom.Courses.CourseWork.StudentSubmissions) {
        throw new Error("Classroom.Courses is null");
    }
    var nextPageToken = "";
    var submissions = [];
    do {
        var optionalArgs = {
            pageSize: 64,
            pageToken: "",
        };
        if (nextPageToken) {
            optionalArgs.pageToken = nextPageToken;
        }
        var studentSubmissions = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId, optionalArgs);
        nextPageToken = studentSubmissions.nextPageToken;
        if (studentSubmissions.studentSubmissions) {
            studentSubmissions.studentSubmissions.forEach(function (submission) {
                submissions.push(submission);
            });
        }
    } while (nextPageToken != undefined);
    return submissions;
}
var exportCourseMemberSheet = function (sheet, courseId, courseName, data) {
    sheet.clear();
    sheet.appendRow([
        "courseID",
        "コース名",
        "メールアドレス",
        "氏名",
        "写真URL",
    ]);
    data.forEach(function (item) {
        if (item.profile && item.profile.name && item.profile.photoUrl) {
            sheet.appendRow([
                courseId,
                courseName,
                item.profile.emailAddress,
                item.profile.name.fullName,
                (item.profile.photoUrl.startsWith("//") ? "https:" : "") +
                    item.profile.photoUrl,
            ]);
        }
    });
};
function exportCoursesSheet(sheet, data) {
    sheet.clear();
    sheet.appendRow([
        "courseId",
        "コース名",
        "セクション",
        "説明",
        "部屋",
        "オーナー教員名",
        "オーナー教員Email",
        "作成日",
        "更新日",
        "クラスコード",
        "状態",
        "代替リンク",
        "教師グループEmail",
        "コースグループEmail",
        "教師フォルダId",
        "教師フォルダ代替リンク",
        "保護者機能有効化",
        "カレンダーID",
        "生徒数",
    ]);
    data.forEach(function (course) {
        var _a, _b, _c;
        if (course.id && course.ownerId) {
            var user = getTeacherProfile(course.id, course.ownerId);
            var row = [
                course.id,
                course.name,
                course.section || "",
                course.descriptionHeading || "",
                course.room || "",
                ((_a = user.name) === null || _a === void 0 ? void 0 : _a.fullName) || user.emailAddress,
                user.emailAddress,
                formatDateTime(course.creationTime),
                formatDateTime(course.updateTime),
                course.enrollmentCode,
                course.courseState,
                course.alternateLink,
                course.teacherGroupEmail,
                course.courseGroupEmail,
                (_b = course.teacherFolder) === null || _b === void 0 ? void 0 : _b.id,
                (_c = course.teacherFolder) === null || _c === void 0 ? void 0 : _c.alternateLink,
                course.guardiansEnabled,
                course.calendarId,
                getNumStudents(course.id),
            ];
            sheet.appendRow(row);
        }
    });
}
function exportCourseWorksSheet(sheet, courseName, data) {
    var courseWorkToRow = function (courseWork) {
        if (!courseWork.courseId) {
            throw new Error("CourseWork.courseId is not defined");
        }
        return [
            courseWork.courseId,
            courseName,
            courseWork.id,
            courseWork.title,
            courseWork.description,
            courseWork.state,
            formatDateTime(courseWork.creationTime),
            formatDateTime(courseWork.updateTime),
        ];
    };
    sheet.clear();
    sheet.appendRow([
        "courseId",
        "コース名",
        "courseWorkId",
        "課題タイトル",
        "説明",
        "状態",
        "作成日",
        "更新日",
    ]);
    data.forEach(function (courseWork) {
        if (courseWork.courseId) {
            var row = courseWorkToRow(courseWork);
            sheet.appendRow(row);
        }
    });
}
function exportStudentSubmissionsSheet(sheet, courseName, courseWorkTitle, data) {
    var submissionToRow = function (studentSubmission) {
        var _a;
        if (!studentSubmission.userId ||
            !studentSubmission.courseId ||
            !studentSubmission.courseWorkId) {
            throw new Error("studentSubmission is invalid:" + JSON.stringify(studentSubmission));
        }
        var courseId = studentSubmission.courseId;
        var courseWorkId = studentSubmission.courseWorkId;
        var userProfile = getStudentProfile(courseId, studentSubmission.userId);
        var row = [
            courseId,
            courseName,
            courseWorkId,
            courseWorkTitle,
            ((_a = userProfile.name) === null || _a === void 0 ? void 0 : _a.fullName) || userProfile.emailAddress,
            userProfile.emailAddress,
            studentSubmission.state,
            formatDateTime(studentSubmission.creationTime),
            formatDateTime(studentSubmission.updateTime),
        ];
        if (studentSubmission.shortAnswerSubmission &&
            studentSubmission.shortAnswerSubmission.answer) {
            row.push(studentSubmission.shortAnswerSubmission.answer);
        }
        if (studentSubmission.assignmentSubmission &&
            studentSubmission.assignmentSubmission.attachments) {
            studentSubmission.assignmentSubmission.attachments.forEach(function (attachment) {
                if (attachment.youTubeVideo) {
                    var youTubeVideo = attachment.youTubeVideo;
                    row.push(youTubeVideo.title);
                    row.push(youTubeVideo.alternateLink);
                }
                if (attachment.driveFile) {
                    row.push(attachment.driveFile.title);
                    row.push(attachment.driveFile.alternateLink);
                    row.push(attachment.driveFile.thumbnailUrl);
                }
                if (attachment.form) {
                    row.push(attachment.form.title);
                    row.push(attachment.form.responseUrl);
                }
            });
        }
        return row;
    };
    sheet.clear();
    sheet.appendRow([
        "courseId",
        "コース名",
        "courseWorkId",
        "課題タイトル",
        "氏名",
        "メールアドレス",
        "状態",
        "作成日",
        "更新日",
    ]);
    data.forEach(function (submission) {
        sheet.appendRow(submissionToRow(submission));
    });
}
function importCourses() {
    var email = Session.getActiveUser().getEmail();
    var sheet = sheetUtil_1.createOrSelectSheetBySheetName("courses", "black");
    exportCoursesSheet(sheet, listCourses(email));
}
exports.importCourses = importCourses;
function importCourseTeachers() {
    try {
        var _a = selectors_1.getSelectedCourse(), courseId = _a.courseId, courseName = _a.courseName;
        var teacherSheet = sheetUtil_1.createOrSelectSheetBySheetName("teachers:" + courseName, "yellow");
        var teachers = listTeacherProfiles(courseId);
        if (teachers.length === 0) {
            throw new Error("エラー：選択されたコース「" +
                courseName +
                "」には、教員が登録されていません。");
        }
        exportCourseMemberSheet(teacherSheet, courseId, courseName, teachers);
    }
    catch (err) {
        Browser.msgBox(err);
    }
}
exports.importCourseTeachers = importCourseTeachers;
function importCourseStudents() {
    try {
        var _a = selectors_1.getSelectedCourse(), courseId = _a.courseId, courseName = _a.courseName;
        var studentSheet = sheetUtil_1.createOrSelectSheetBySheetName("students:" + courseName, "yellow");
        var students = listStudentProfiles(courseId);
        if (students.length === 0) {
            throw new Error("エラー：選択されたコース「" +
                courseName +
                "」には、生徒が登録されていません。");
        }
        exportCourseMemberSheet(studentSheet, courseId, courseName, students);
    }
    catch (err) {
        Browser.msgBox(err);
    }
}
exports.importCourseStudents = importCourseStudents;
function importCourseWorks() {
    try {
        var _a = selectors_1.getSelectedCourse(), courseId = _a.courseId, courseName = _a.courseName;
        var targetSheet = sheetUtil_1.createOrSelectSheetBySheetName("courseworks:" + courseName, "yellow");
        var courseWorks = listCourseWorks(courseId, courseName);
        exportCourseWorksSheet(targetSheet, courseName, courseWorks);
    }
    catch (error) {
        Browser.msgBox(error);
    }
}
exports.importCourseWorks = importCourseWorks;
function importStudentSubmissions() {
    try {
        var _a = selectors_1.getSelectedCourseWorks(), courseId = _a.courseId, courseName = _a.courseName, courseWorkId = _a.courseWorkId, courseWorkTitle = _a.courseWorkTitle;
        var studentSubmissions = listStudentSubmissions(courseId, courseName, courseWorkId);
        var targetSheetName = courseName + " " + courseWorkTitle;
        var targetSheet = sheetUtil_1.createOrSelectSheetBySheetName("submissions:" + targetSheetName, "orange");
        exportStudentSubmissionsSheet(targetSheet, courseName, courseWorkTitle, studentSubmissions);
    }
    catch (error) {
        Browser.msgBox(error);
    }
}
exports.importStudentSubmissions = importStudentSubmissions;


/***/ }),

/***/ "./src/app/classroom/selectors.ts":
/*!****************************************!*\
  !*** ./src/app/classroom/selectors.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSelectedCourseWorks = exports.getSelectedCourse = void 0;
var sheetUtil_1 = __webpack_require__(/*! ../sheetUtil */ "./src/app/sheetUtil.ts");
var getSelectedCourse = function () {
    var getSelectedCourseOnCoursesSheet = function (sheet) {
        var activeRange = sheet.getActiveRange();
        var values = sheet.getName() === "courses" && activeRange != null
            ? activeRange.getValues()
            : sheet.getRange(2, 1, 1, 2).getValues();
        if (values.length != 1 && values[0].length < 2) {
            throw new Error("エラー：「courses」シートで、対象コースの行を、いずれか1行だけ選択状態にしてから、再実行してください。");
        }
        var courseId = values[0][0];
        var courseName = values[0][1];
        if (courseId && courseName) {
            return { courseId: courseId, courseName: courseName };
        }
        else {
            throw new Error("エラー：「courses」シートで、対象コースの行を、いずれか1行だけ選択状態にしてから、再実行してください。");
        }
    };
    var getSelectedCourseOnSheet = function (sheet, schema, caption) {
        var values = sheet.getRange(2, 1, 1, 2).getValues();
        Logger.log("getSelectedCourseOnSheet:" + JSON.stringify(values));
        var courseId = values[0][0];
        var courseName = values[0][1];
        if (courseId === null ||
            courseName === null ||
            courseId === "" ||
            courseName === "") {
            throw new Error("\u30A8\u30E9\u30FC\uFF1A\u300C" + schema + "\u300D\u30B7\u30FC\u30C8\u5185\u5BB9\u304C\u4E0D\u6B63\u3067\u3059\u3002\u300C" + caption + "\u300D\u3092\u5B9F\u884C\u3057\u3066\u304B\u3089\u3001\u3053\u3061\u3089\u3092\u518D\u5B9F\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
        }
        return { courseId: courseId, courseName: courseName };
    };
    var getSelectedCourseOnTeachersSheet = function (sheet) {
        return getSelectedCourseOnSheet(sheet, "teachers", "2.教師一覧(シート名：teachers:コース名)を抽出");
    };
    var getSelectedCourseOnStudentsSheet = function (sheet) {
        return getSelectedCourseOnSheet(sheet, "students", "3.生徒一覧(シート名：students:コース名)を抽出");
    };
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeSheet = spreadsheet.getActiveSheet();
    switch (sheetUtil_1.getSchema(activeSheet.getName())) {
        case "courses":
            return getSelectedCourseOnCoursesSheet(activeSheet);
        case "teachers":
            return getSelectedCourseOnTeachersSheet(activeSheet);
        case "students":
            return getSelectedCourseOnStudentsSheet(activeSheet);
        case "courseworks":
            Logger.log("courseworks");
            return getSelectedCourseOnCoursesSheet(activeSheet);
        default:
            var sheet = spreadsheet.getSheetByName("courses");
            if (!sheet) {
                throw new Error("エラー：「courses」シートがありません。「1.コース一覧(シート名：courses)を抽出」を実行してから、こちらを再実行してください。");
            }
            else {
                throw new Error("* エラー：「courses」シートで、対象コースの行を、いずれか1行だけ選択状態にしてから、再実行してください。");
            }
    }
};
exports.getSelectedCourse = getSelectedCourse;
var getSelectedCourseWorks = function () {
    var getSelectedCourseWorkOfSelectedRow = function (activeRange) {
        var values = activeRange.getValues();
        var courseId = values[0][0];
        var courseName = values[0][1];
        var courseWorkId = values[0][2];
        var courseWorkTitle = values[0][3];
        return { courseId: courseId, courseName: courseName, courseWorkId: courseWorkId, courseWorkTitle: courseWorkTitle };
    };
    var getSelectedCourseWorkOfSelectedSheet = function (sheet) {
        var values = sheet.getRange(2, 1, 1, 4).getValues();
        var courseId = values[0][0];
        var courseName = values[0][1];
        var courseWorkId = values[0][2];
        var courseWorkTitle = values[0][3];
        return { courseId: courseId, courseName: courseName, courseWorkId: courseWorkId, courseWorkTitle: courseWorkTitle };
    };
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeSheet = spreadsheet.getActiveSheet();
    switch (sheetUtil_1.getSchema(activeSheet.getName())) {
        case "courseworks":
            var activeRange = activeSheet.getActiveRange();
            if (!activeRange || activeRange.getRowIndex() == 0) {
                throw new Error("エラー：選択中のシート「課題一覧(courseworks:コース名)」において、課題の行を、いずれか1行だけ選択状態にしてから、再実行してください。");
            }
            return getSelectedCourseWorkOfSelectedRow(activeRange);
        case "submissions":
            return getSelectedCourseWorkOfSelectedSheet(activeSheet);
        case "courses":
        case "teachers":
        case "students":
        default:
            throw new Error("エラー：選択中のシート「課題一覧(courseworks:コース名)」において、課題の行を、いずれか1行だけ選択状態にしてから、再実行してください。");
    }
};
exports.getSelectedCourseWorks = getSelectedCourseWorks;


/***/ }),

/***/ "./src/app/form/exportForm.ts":
/*!************************************!*\
  !*** ./src/app/form/exportForm.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.exportForm = exports.exportFormWithDialog = void 0;
var messages_1 = __importDefault(__webpack_require__(/*! ./messages */ "./src/app/form/messages.ts"));
var sheetToJson_1 = __importDefault(__webpack_require__(/*! ./sheetToJson */ "./src/app/form/sheetToJson.ts"));
var jsonToForm_1 = __webpack_require__(/*! ./jsonToForm */ "./src/app/form/jsonToForm.ts");
var uiMessages = messages_1.default(Session.getActiveUserLocale())["ui"];
function exportFormWithDialog() {
    var inputBoxTitle = uiMessages["export form"];
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
    function getFormTitle() {
        var input = Browser.inputBox(inputBoxTitle, uiMessages["form title"], Browser.Buttons.OK_CANCEL);
        if (input === "cancel") {
            throw uiMessages["form export canceled"];
        }
        if (input === "") {
            return getFormTitle();
        }
        return input;
    }
    try {
        var title = getFormTitle();
        var sheet = SpreadsheetApp.getActiveSheet();
        var idRows = sheet
            .getRange(1, 1, sheet.getLastRow(), 2)
            .getValues()
            .filter(function (row) {
            return row[0] === "id" && row[1] !== "";
        });
        var id = idRows[0][1];
        var json = sheetToJson_1.default(sheet);
        var form = FormApp.openById(id);
        for (var index = form.getItems().length - 1; index >= 0; index--) {
            form.deleteItem(index);
        }
        jsonToForm_1.jsonToForm(json, form);
        var file = DriveApp.getFileById(form.getId());
        form.setTitle(title);
        file.setName(title);
    }
    catch (exception) {
        Logger.log(exception);
        if (exception.stack) {
            Logger.log(exception.stack);
        }
        Browser.msgBox(uiMessages["form export failed."] +
            "\\n" +
            JSON.stringify(exception, null, " "));
    }
}
exports.exportFormWithDialog = exportFormWithDialog;
function exportForm() {
    try {
        var sheet = SpreadsheetApp.getActiveSheet();
        var json = sheetToJson_1.default(sheet);
        var form = jsonToForm_1.jsonToForm(json, null);
        var file = DriveApp.getFileById(form.getId());
        file.setName(form.getTitle());
        Browser.msgBox(uiMessages["form export succeed."] +
            "\\n" +
            "URL: \\n" +
            form.shortenFormUrl(form.getPublishedUrl()));
    }
    catch (exception) {
        Logger.log(exception);
        if (exception.stack) {
            Logger.log(exception.stack);
        }
        Browser.msgBox(uiMessages["form export failed."] +
            "\\n" +
            JSON.stringify(exception, null, " "));
    }
}
exports.exportForm = exportForm;


/***/ }),

/***/ "./src/app/form/formToJson.ts":
/*!************************************!*\
  !*** ./src/app/form/formToJson.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var DestinationType = FormApp.DestinationType;
var types_1 = __webpack_require__(/*! ./types */ "./src/app/form/types.ts");
/**
 * Convert a Google Form object into JSON Object.
 * @returns JSON object of form data
 * @param form {Form} a Google Form Object
 * */
var getFormMetadata = function (form) {
    var metadata = {
        quiz: form.isQuiz(),
        collectEmail: form.collectsEmail(),
        progressBar: form.hasProgressBar(),
        linkToRespondAgain: form.hasRespondAgainLink(),
        limitOneResponsePerUser: form.hasLimitOneResponsePerUser(),
        requiresLogin: form.requiresLogin(),
        allowResponseEdits: form.canEditResponse(),
        acceptingResponses: form.isAcceptingResponses(),
        publishingSummary: form.isPublishingSummary(),
        confirmationMessage: form.getConfirmationMessage(),
        customClosedFormMessage: form.getCustomClosedFormMessage(),
        description: form.getDescription(),
        editUrl: form.getEditUrl(),
        editors: form.getEditors().map(function (user) { return user.getEmail(); }),
        id: form.getId(),
        publishedUrl: form.getPublishedUrl(),
        shuffleQuestions: form.getShuffleQuestions(),
        summaryUrl: form.getSummaryUrl(),
        title: form.getTitle(),
    };
    try {
        var destinationId = form.getDestinationId();
        var destinationType = getDestinationTypeString(form.getDestinationType());
        metadata.destinationId = destinationId;
        metadata.destinationType = destinationType;
    }
    catch (ignore) { }
    return metadata;
};
function formToJson(form) {
    return {
        metadata: getFormMetadata(form),
        items: form.getItems().map(itemToObject),
    };
}
exports.default = formToJson;
function blobToJson(blob) {
    return {
        name: blob.getName(),
        contentType: blob.getContentType(),
        dataAsString: blob.getDataAsString(),
    };
}
function choiceToJson(choice) {
    var navigation = (choice.getGotoPage()) ? {
        gotoPageTitle: choice.getGotoPage().getTitle(),
        pageNavigationType: getPageNavigationTypeString(choice.getPageNavigationType())
    } : {};
    return __assign({ value: choice.getValue(), isCorrectAnswer: choice.isCorrectAnswer() }, navigation);
}
function feedbackToJson(type, feedback) {
    if (feedback) {
        return {
            type: type,
            text: feedback.getText(),
            linkUrls: feedback.getLinkUrls(),
        };
    }
    else {
        return null;
    }
}
function getDestinationTypeString(type) {
    switch (type) {
        case DestinationType.SPREADSHEET:
            return "SPREADSHEET";
        default:
            throw new Error("INVALID_DESTINATION");
    }
}
function getAlignmentString(alignment) {
    switch (alignment) {
        case FormApp.Alignment.LEFT:
            return "LEFT"; // FormApp.Alignment.LEFT.toString(); //;
        case FormApp.Alignment.RIGHT:
            return "RIGHT";
        case FormApp.Alignment.CENTER:
            return "CENTER";
        default:
            throw new Error("INVALID_ALIGNMENT");
    }
}
function getPageNavigationTypeString(type) {
    switch (type) {
        case FormApp.PageNavigationType.CONTINUE:
            return "CONTINUE";
        case FormApp.PageNavigationType.GO_TO_PAGE:
            return "GO_TO_PAGE";
        case FormApp.PageNavigationType.RESTART:
            return "RESTART";
        case FormApp.PageNavigationType.SUBMIT:
            return "SUBMIT";
        default:
            throw new Error("INVALID_NAVIGATION");
    }
}
function getTypedItem(item) {
    switch (item.getType()) {
        case FormApp.ItemType.CHECKBOX:
            return item.asCheckboxItem();
        case FormApp.ItemType.CHECKBOX_GRID:
            return item.asCheckboxGridItem();
        case FormApp.ItemType.DATE:
            return item.asDateItem();
        case FormApp.ItemType.DATETIME:
            return item.asDateTimeItem();
        case FormApp.ItemType.TIME:
            return item.asTimeItem();
        case FormApp.ItemType.DURATION:
            return item.asDurationItem();
        case FormApp.ItemType.GRID:
            return item.asGridItem();
        case FormApp.ItemType.IMAGE:
            return item.asImageItem();
        case FormApp.ItemType.LIST:
            return item.asListItem();
        case FormApp.ItemType.MULTIPLE_CHOICE:
            return item.asMultipleChoiceItem();
        case FormApp.ItemType.PAGE_BREAK:
            return item.asPageBreakItem();
        case FormApp.ItemType.PARAGRAPH_TEXT:
            return item.asParagraphTextItem();
        case FormApp.ItemType.SCALE:
            return item.asScaleItem();
        case FormApp.ItemType.SECTION_HEADER:
            return item.asSectionHeaderItem();
        case FormApp.ItemType.TEXT:
            return item.asTextItem();
        default:
            throw new Error("TypeError=" + item.getType());
    }
}
function createItemObject(item, func) {
    var params = {
        type: types_1.TYPE_NAMES[item.getType()],
        id: item.getId(),
        index: item.getIndex(),
        title: item.getTitle(),
        helpText: item.getHelpText(),
    };
    if (func) {
        var typedItem = getTypedItem(item);
        return __assign(__assign({}, params), func(typedItem));
    }
    else {
        return params;
    }
}
// isRequired: item.isRequired(),
function createQuestionnaireItemWithCorrectnessFeedback(item, func) {
    //CheckboxGridItem|DateItem|DateTimeItem|DurationItem|GridItem|
    //   //ParagraphTextItem|ScaleItem|TextItem|TimeItem
    return createItemObject(item, function (typedItem) {
        var params = {
            required: typedItem.isRequired(),
            points: typedItem.getPoints(),
            feedbackForCorrect: feedbackToJson("correctnessFeedback", typedItem.getFeedbackForCorrect()),
            feedbackForIncorrect: feedbackToJson("correctnessFeedback", typedItem.getFeedbackForIncorrect()),
        };
        if (func) {
            return __assign(__assign({}, params), func(typedItem));
        }
        else {
            return params;
        }
    });
}
function createQuestionnaireItemWithGeneralFeedback(item, func) {
    return createItemObject(item, function (typedItem) {
        var params = {
            required: typedItem.isRequired(),
            points: typedItem.getPoints(),
            generalFeedback: feedbackToJson("generalFeedback", typedItem.getGeneralFeedback()),
        };
        if (func) {
            return __assign(__assign({}, params), func(typedItem));
        }
        else {
            return params;
        }
    });
}
function itemToObject(item) {
    switch (item.getType()) {
        case FormApp.ItemType.CHECKBOX:
        case FormApp.ItemType.MULTIPLE_CHOICE:
            return createQuestionnaireItemWithCorrectnessFeedback(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                    hasOtherOption: typedItem.hasOtherOption(),
                    choices: typedItem.getChoices().map(choiceToJson),
                };
            });
        case FormApp.ItemType.LIST:
            return createQuestionnaireItemWithCorrectnessFeedback(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                    choices: typedItem.getChoices().map(choiceToJson),
                };
            });
        case FormApp.ItemType.DATE:
        case FormApp.ItemType.DATETIME:
            return createQuestionnaireItemWithGeneralFeedback(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                    includesYear: typedItem.includesYear(),
                };
            });
        case FormApp.ItemType.TIME:
            return createQuestionnaireItemWithGeneralFeedback(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                };
            });
        case FormApp.ItemType.DURATION:
            return createQuestionnaireItemWithGeneralFeedback(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                };
            });
        case FormApp.ItemType.CHECKBOX_GRID:
        case FormApp.ItemType.GRID:
            return createItemObject(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                    rows: typedItem.getRows(),
                    columns: typedItem.getColumns(),
                };
            });
        case FormApp.ItemType.PARAGRAPH_TEXT:
            return createQuestionnaireItemWithGeneralFeedback(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                    // validation: undefined
                };
            });
        case FormApp.ItemType.SCALE:
            return createQuestionnaireItemWithGeneralFeedback(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                    leftLabel: typedItem.getLeftLabel(),
                    lowerBound: typedItem.getLowerBound(),
                    rightLabel: typedItem.getRightLabel(),
                    upperBound: typedItem.getUpperBound(),
                };
            });
        case FormApp.ItemType.TEXT:
            return createQuestionnaireItemWithGeneralFeedback(item, function (typedItem) {
                return {
                    required: typedItem.isRequired(),
                    // validation: undefined
                };
            });
        case FormApp.ItemType.IMAGE:
            return createItemObject(item, function (typedItem) {
                return {
                    image: blobToJson(typedItem.getImage()),
                    alignment: getAlignmentString(typedItem.getAlignment()),
                    width: typedItem.getWidth(),
                };
            });
        case FormApp.ItemType.VIDEO:
            return createItemObject(item, function (typedItem) {
                return {
                    videoUrl: undefined,
                    alignment: getAlignmentString(typedItem.getAlignment()),
                    width: typedItem.getWidth(),
                };
            });
        case FormApp.ItemType.PAGE_BREAK:
            return createItemObject(item, function (typedItem) {
                if (typedItem.getGoToPage()) {
                    return {
                        pageNavigationType: getPageNavigationTypeString(typedItem.getPageNavigationType()),
                        goToPageTitle: typedItem.getGoToPage().getTitle(),
                    };
                }
                else {
                    return {
                        pageNavigationType: getPageNavigationTypeString(typedItem.getPageNavigationType()),
                    };
                }
            });
        case FormApp.ItemType.SECTION_HEADER:
            return createItemObject(item);
        default:
            throw new Error("InvalidItem:" + item.getType());
    }
}


/***/ }),

/***/ "./src/app/form/importForm.ts":
/*!************************************!*\
  !*** ./src/app/form/importForm.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.importForm = exports.importFormWithDialog = void 0;
var formToJson_1 = __importDefault(__webpack_require__(/*! ./formToJson */ "./src/app/form/formToJson.ts"));
var jsonToSheet_1 = __importDefault(__webpack_require__(/*! ./jsonToSheet */ "./src/app/form/jsonToSheet.ts"));
var messages_1 = __importDefault(__webpack_require__(/*! ./messages */ "./src/app/form/messages.ts"));
var uiMessages = messages_1.default(Session.getActiveUserLocale())["ui"];
function importFormWithDialog() {
    var inputBoxTitle = uiMessages["import form"];
    function importFormDialog() {
        var input = Browser.inputBox(inputBoxTitle, "input source form URL", Browser.Buttons.OK_CANCEL);
        if (input === "cancel") {
            throw uiMessages["form import canceled"];
        }
        var form = null;
        if (input === "") {
            form = FormApp.getActiveForm();
        }
        else if (input.endsWith("/edit")) {
            form = FormApp.openByUrl(input);
        }
        else {
            // FIXME
        }
        if (!form) {
            Browser.msgBox(uiMessages["invalid form URL"] + ": " + input);
            return importFormDialog();
        }
        return form;
    }
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    try {
        var form = importFormDialog();
        var sheet = spreadsheet.insertSheet();
        var json = formToJson_1.default(form);
        // Logger.log(JSON.stringify(json, null, "  "));
        jsonToSheet_1.default(json, sheet);
    }
    catch (exception) {
        Logger.log(exception);
        if (exception.stack) {
            Logger.log(exception.stack);
        }
        Browser.msgBox(uiMessages["form import failed."] +
            "\\n" +
            JSON.stringify(exception, null, " "));
    }
}
exports.importFormWithDialog = importFormWithDialog;
function importForm() {
    try {
        var sheet = SpreadsheetApp.getActiveSheet();
        var idRows = sheet
            .getRange(1, 1, sheet.getLastRow(), 2)
            .getValues()
            .filter(function (row) {
            return row[0] === "id" && row[1] !== "";
        });
        if (idRows.length === 0) {
            throw "`form id` row is not defined.";
        }
        var id = idRows[0][1];
        var form = FormApp.openById(id);
        var json = formToJson_1.default(form);
        sheet.setName("form:" + json.metadata.title);
        sheet.setTabColor("purple");
        jsonToSheet_1.default(json, sheet);
    }
    catch (exception) {
        Logger.log(exception);
        if (exception.stack) {
            Logger.log(exception.stack);
        }
        Browser.msgBox(uiMessages["form import failed."] +
            "\\n" +
            JSON.stringify(exception, null, " "));
    }
}
exports.importForm = importForm;


/***/ }),

/***/ "./src/app/form/jsonToForm.ts":
/*!************************************!*\
  !*** ./src/app/form/jsonToForm.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.jsonToForm = void 0;
var types_1 = __webpack_require__(/*! ./types */ "./src/app/form/types.ts");
/*
const formPropertiesHandlers = {
  title: function () {
    context.form.setTitle(context.metadata.title);
  },
  description: function (context: FormContext) {
    context.metadata.description != undefined &&
      context.form.setDescription(context.metadata.description);
  },
  isQuiz: function (context: FormContext) {
    context.metadata.quiz != undefined &&
      context.form.setIsQuiz(context.metadata.quiz);
  },
  shuffleQuestions: function (context: FormContext) {
    context.metadata.shuffleQuestions != undefined &&
      context.form.setShuffleQuestions(context.metadata.shuffleQuestions);
  },
  acceptingResponses: function (context: FormContext) {
    context.metadata.acceptingResponses != undefined &&
      context.form.setAcceptingResponses(context.metadata.acceptingResponses);
  },
  allowResponseEdits: function (context: FormContext) {
    context.metadata.allowResponseEdits != undefined &&
      context.form.setAllowResponseEdits(context.metadata.allowResponseEdits);
  },
  collectEmail: function (context: FormContext) {
    context.metadata.collectEmail != undefined &&
      context.form.setCollectEmail(context.metadata.collectEmail);
  },
  limitOneResponsePerUser: function (context: FormContext) {
    context.metadata.limitOneResponsePerUser != undefined &&
      context.form.setLimitOneResponsePerUser(
        context.metadata.limitOneResponsePerUser
      );
  },
  progressBar: function (context: FormContext) {
    context.metadata.progressBar != undefined &&
      context.form.setProgressBar(context.metadata.progressBar);
  },
  publishingSummary: function (context: FormContext) {
    context.metadata.publishingSummary != undefined &&
      context.form.setPublishingSummary(context.metadata.publishingSummary);
  },
  requireLogin: function (context: FormContext) {
    context.metadata.requiresLogin != undefined &&
      context.form.setRequireLogin(context.metadata.requiresLogin);
  },
  linkToRespondAgain: function (context: FormContext) {
    context.metadata.linkToRespondAgain != undefined &&
      context.form.setShowLinkToRespondAgain(
        context.metadata.linkToRespondAgain
      );
  },
  confirmationMessage: function (context: FormContext) {
    context.metadata.confirmationMessage != undefined &&
      context.form.setConfirmationMessage(context.metadata.confirmationMessage);
  },
  customClosedFormMessage: function (context: FormContext) {
    context.metadata.customClosedFormMessage != undefined &&
      context.form.setCustomClosedFormMessage(
        context.metadata.customClosedFormMessage
      );
  },
  editors: function (context: FormContext) {
    context.metadata.editors != undefined &&
      context.form.addEditors(context.metadata.editors);
  },
  id: function (context: FormContext) {
    // do nothing
  },
  editUrl: function (context: FormContext) {
    // do nothing
  },
  publishedUrl: function (context: FormContext) {
    // do nothing
  },
  summaryUrl: function (context: FormContext) {
    // do nothing
  },
};
 */
function booleanValue(value) {
    if (typeof value === "boolean") {
        return value;
    }
    else if (typeof value === "string") {
        return !(value.toLowerCase() === "false" || value === "0" || value === "");
    }
    else if (typeof value === "number") {
        return 0 < value;
    }
    return false;
}
function callWithBooleanValue(value, callback) {
    var b = booleanValue(value);
    if (b) {
        callback(b);
    }
}
function callWithIntegerValue(value, callback) {
    var intValue = parseInt(value, 10);
    if (!isNaN(intValue)) {
        callback(intValue);
    }
}
function isNotNullValue(value) {
    return value !== undefined && value !== null && value !== "";
}
function callWithNotNullValue(value, callback) {
    if (isNotNullValue(value)) {
        callback(value);
    }
}
function jsonToForm(json, form) {
    if (form === null) {
        if (json.metadata.id) {
            var form_1 = FormApp.openById(json.metadata.id);
            if (form_1) {
                var numItems = form_1.getItems().length;
                for (var index = numItems - 1; 0 <= index; index--) {
                    form_1.deleteItem(index);
                }
                form_1.getEditors().forEach(function (editor) {
                    form_1 === null || form_1 === void 0 ? void 0 : form_1.removeEditor(editor);
                });
            }
        }
        else {
            form = FormApp.create(json.metadata.title);
        }
    }
    if (!form) {
        throw new Error("invalid form title");
    }
    json.metadata.quiz && form.setIsQuiz(json.metadata.quiz);
    json.metadata.allowResponseEdits &&
        form.setAllowResponseEdits(json.metadata.allowResponseEdits);
    json.metadata.collectEmail &&
        form.setCollectEmail(json.metadata.collectEmail);
    json.metadata.description && form.setDescription(json.metadata.description);
    json.metadata.acceptingResponses &&
        form.setAcceptingResponses(json.metadata.acceptingResponses);
    json.metadata.publishingSummary &&
        form.setPublishingSummary(json.metadata.publishingSummary);
    json.metadata.confirmationMessage &&
        form.setConfirmationMessage(json.metadata.confirmationMessage);
    json.metadata.customClosedFormMessage &&
        form.setCustomClosedFormMessage(json.metadata.customClosedFormMessage);
    json.metadata.limitOneResponsePerUser &&
        form.setLimitOneResponsePerUser(json.metadata.limitOneResponsePerUser);
    json.metadata.progressBar && form.setProgressBar(json.metadata.progressBar);
    json.metadata.editors && form.addEditors(json.metadata.editors);
    json.metadata.shuffleQuestions &&
        form.setShuffleQuestions(json.metadata.shuffleQuestions);
    json.metadata.linkToRespondAgain &&
        form.setShowLinkToRespondAgain(json.metadata.linkToRespondAgain);
    form.setTitle(json.metadata.title);
    if (json.metadata.destinationType == FormApp.DestinationType.SPREADSHEET.toString() &&
        json.metadata.destinationId) {
        form.setDestination(FormApp.DestinationType.SPREADSHEET, json.metadata.destinationId);
    }
    var pageBreakItems = new Map();
    json.items
        .filter(function (item) { return item.type === "pageBreakItem"; })
        .forEach(function (item) {
        var pageBreakItemObject = item;
        if (!form) {
            throw new Error("invalid form title");
        }
        var title = pageBreakItemObject.title;
        var pageBreakItem = form.addPageBreakItem().setTitle(title);
        pageBreakItems.set(title, pageBreakItem);
        return pageBreakItem;
    });
    function createFeedback(value, displayText) {
        var feedbackBuilder = FormApp.createFeedback();
        if (0 === value.indexOf("http")) {
            var url = value;
            if (displayText) {
                feedbackBuilder.addLink(url, displayText);
            }
            else {
                feedbackBuilder.addLink(url);
            }
        }
        else {
            feedbackBuilder.setText(value);
        }
        return feedbackBuilder.build();
    }
    var itemModifiers = {
        itemProperties: function (itemObject, item) {
            callWithNotNullValue(itemObject.title, function (value) {
                item.setTitle(value);
            });
            callWithNotNullValue(itemObject.helpText, function (value) {
                item.setHelpText(value);
            });
        },
        questionProperties: function (itemObject, item) {
            callWithBooleanValue(item.isRequired, function (value) {
                item.setRequired(value);
            });
        },
        choices: function (choiceObjectList, item) {
            var choiceObjects = choiceObjectList.map(function (choiceObject) {
                if (!form) {
                    throw new Error("invalid form title");
                }
                if (!choiceObject.gotoPageTitle) {
                    throw new Error("invalid value of gotoPageTitle");
                }
                var goToPage = pageBreakItems.get(choiceObject.gotoPageTitle);
                var pageNavigationType = choiceObject.pageNavigationType === "CONTINUE"
                    ? FormApp.PageNavigationType.CONTINUE
                    : choiceObject.pageNavigationType === "GO_TO_PAGE"
                        ? FormApp.PageNavigationType.GO_TO_PAGE
                        : choiceObject.pageNavigationType === "RESTART"
                            ? FormApp.PageNavigationType.RESTART
                            : FormApp.PageNavigationType.SUBMIT;
                if (!goToPage && !choiceObject.isCorrectAnswer) {
                    return item.createChoice(choiceObject.value);
                }
                else if (!goToPage && choiceObject.isCorrectAnswer) {
                    return item.createChoice(choiceObject.value, choiceObject.isCorrectAnswer);
                }
                else if (goToPage) {
                    return item.createChoice(choiceObject.value, pageNavigationType);
                }
                throw new Error("invalid choiceObject:" + choiceObject);
            });
            item.setChoices(choiceObjects);
        },
        showOtherOption: function (itemObject, item) {
            callWithBooleanValue(itemObject.hasOtherOption, function (value) {
                item.showOtherOption(value);
            });
        },
        quizProperties: function (itemObject, item) {
            callWithIntegerValue(itemObject.points, function (value) {
                item.setPoints(value);
            });
            callWithNotNullValue(itemObject.feedbackForCorrect, function (value) {
                item.setFeedbackForCorrect(createFeedback(value));
            });
            callWithNotNullValue(itemObject.feedbackForIncorrect, function (value) {
                item.setFeedbackForIncorrect(createFeedback(value));
            });
        },
        includesYear: function (itemObject, item) {
            callWithBooleanValue(itemObject.includesYear, function (value) {
                item.setIncludesYear(value);
            });
        },
    };
    function multipleChoiceHandler(itemObject, form) {
        var item = form.addMultipleChoiceItem();
        itemModifiers.choices(itemObject.choices, item);
        itemModifiers.itemProperties(itemObject, item);
        itemModifiers.questionProperties(itemObject, item);
        itemModifiers.showOtherOption(itemObject, item);
        if (form.isQuiz()) {
            itemModifiers.quizProperties(itemObject, item);
        }
    }
    function gridHandler(itemObject, item) {
        item.setRows(itemObject.rows).setColumns(itemObject.columns);
        itemModifiers.itemProperties(itemObject, item);
        itemModifiers.questionProperties(itemObject, item);
    }
    var itemHandlers = {
        multipleChoice: multipleChoiceHandler,
        checkbox: function (itemObject, form) {
            var item = form.addCheckboxItem();
            itemModifiers.choices(itemObject.choices, item);
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
            itemModifiers.showOtherOption(itemObject, item);
            if (form.isQuiz()) {
                itemModifiers.quizProperties(itemObject, item);
            }
        },
        list: function (itemObject, form) {
            var item = form.addListItem();
            itemModifiers.choices(itemObject.choices, item);
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
        },
        checkboxGrid: function (itemObject, form) {
            var item = form.addCheckboxGridItem();
            gridHandler(itemObject, item);
        },
        grid: function (itemObject, form) {
            var item = form.addGridItem();
            gridHandler(itemObject, item);
        },
        time: function (itemObject, form) {
            var item = form.addTimeItem();
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
        },
        date: function (itemObject, form) {
            var item = form.addDateItem();
            itemModifiers.includesYear(itemObject, item);
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
        },
        datetime: function (itemObject, form) {
            var item = form.addDateTimeItem();
            itemModifiers.includesYear(itemObject, item);
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
        },
        text: function (itemObject, form) {
            var item = form.addTextItem();
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
        },
        paragraphText: function (itemObject, form) {
            var item = form.addParagraphTextItem();
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
        },
        duration: function (itemObject, form) {
            var item = form.addDurationItem();
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
        },
        scale: function (itemObject, form) {
            var item = form.addScaleItem();
            callWithNotNullValue(itemObject.leftLabel, function (left) {
                callWithNotNullValue(itemObject.rightLabel, function (right) {
                    item.setLabels(left, right);
                });
            });
            callWithIntegerValue(itemObject.lowerBound, function (lower) {
                callWithIntegerValue(itemObject.upperBound, function (upper) {
                    item.setBounds(lower, upper);
                });
            });
            itemModifiers.itemProperties(itemObject, item);
            itemModifiers.questionProperties(itemObject, item);
        },
        sectionHeader: function (itemObject, form) {
            var item = form.addSectionHeaderItem();
            itemModifiers.itemProperties(itemObject, item);
        },
        video: function (itemObject, form) {
            var item = form.addVideoItem();
            var videoUrl = itemObject.videoUrl;
            item.setVideoUrl(videoUrl);
            callWithIntegerValue(itemObject.width, function (value) {
                item.setWidth(value);
            });
            callWithNotNullValue(itemObject.alignment, function (value) {
                var alignment = types_1.getAlignment(value);
                if (alignment) {
                    item.setAlignment(alignment);
                }
            });
            itemModifiers.itemProperties(itemObject, item);
        },
        image: function (itemObject, form) {
            var item = form.addImageItem();
            var image = UrlFetchApp.fetch(itemObject.url);
            item.setImage(image);
            callWithIntegerValue(itemObject.width, function (value) {
                item.setWidth(value);
            });
            callWithNotNullValue(itemObject.alignment, function (value) {
                var alignment = types_1.getAlignment(value);
                if (alignment) {
                    item.setAlignment(alignment);
                }
            });
            itemModifiers.itemProperties(itemObject, item);
        },
        pageBreak: function (itemObject, form) {
            var title = itemObject.title;
            var pageNavigationType = itemObject.pageNavigationType;
            var pageBreakItem = pageBreakItems.get(title);
            if (!pageBreakItem) {
                return;
            }
            var lastItemIndex = form.getItems().length - 1;
            form.moveItem(pageBreakItem.getIndex(), lastItemIndex);
            if (pageNavigationType === "CONTINUE") {
                pageBreakItem.setGoToPage(FormApp.PageNavigationType.CONTINUE);
            }
            else if (pageNavigationType === "RESTART") {
                pageBreakItem.setGoToPage(FormApp.PageNavigationType.RESTART);
            }
            else if (pageNavigationType === "SUBMIT") {
                pageBreakItem.setGoToPage(FormApp.PageNavigationType.SUBMIT);
            }
            else if (itemObject.gotoPageTitle) {
                var gotoPage = pageBreakItems.get(itemObject.gotoPageTitle);
                if (gotoPage) {
                    pageBreakItem.setGoToPage(gotoPage);
                }
            }
            itemModifiers.itemProperties(itemObject, pageBreakItem);
        },
        /*
        feedback: function (itemObject: ItemObject, form: Form) {
          const feedback = FormApp.createFeedback();
          for (
            let rowIndex = context.rowIndex;
            rowIndex < context.lastRow;
            rowIndex++
          ) {
            const command = context.values[rowIndex][COL_INDEX.COMMAND];
            const feedbackDisplayTextOrUrl =
              context.values[rowIndex][COL_INDEX.FEEDBACK.TEXT_OR_URL];
            const feedbackDisplayText =
              context.values[rowIndex][COL_INDEX.FEEDBACK.DISPLAY_TEXT];
            if (command.charAt(0) === "#" || command === "comment") {
              continue;
            } else if (
              (command === "feedback" && rowIndex === context.rowIndex) ||
              !isNotNullValue(command)
            ) {
              callWithNotNullValue(feedbackDisplayTextOrUrl, function (value: any) {
                createFeedback(feedback, value, feedbackDisplayText);
              });
            } else {
              context.rowIndex = rowIndex - 1;
              break;
            }
          }
          const builtFeedback = feedback.build();
          callWithNotNullValue(
            context.row[COL_INDEX.FEEDBACK.ID],
            function (value: any) {
              if (context.feedbackForCorrect[value]) {
                context.feedbackForCorrect[value].setFeedbackForCorrect(
                  builtFeedback
                );
              }
              if (context.feedbackForIncorrect[value]) {
                context.feedbackForIncorrect[value].setFeedbackForIncorrect(
                  builtFeedback
                );
              }
            }
          );
        },
     */
    };
    json.items.forEach(function (itemObject) {
        itemHandlers[itemObject.type](itemObject, form);
    });
    return form;
}
exports.jsonToForm = jsonToForm;


/***/ }),

/***/ "./src/app/form/jsonToSheet.ts":
/*!*************************************!*\
  !*** ./src/app/form/jsonToSheet.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var METADATA_REQUIRED = {
    background: "#ffeeee",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var METADATA_OPTIONAL = {
    background: "#ffeeee",
    fontColor: "#888888",
    range: ["A1:A999"],
};
var SECTION_HEADER_ITEM = {
    background: "#eedddd",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var PAGE_BREAK_ITEM = {
    background: "#ccaaaa",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var GRID_ITEM = {
    background: "#eeffee",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var CHECKBOX_GRID_ITEM = {
    background: "#bbddbb",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var GRID_ROW = {
    background: "#eeffee",
    fontColor: "#888888",
    range: ["A1:A999"],
};
var CHECKBOX_GRID_ROW = {
    background: "#bbddbb",
    fontColor: "#888888",
    range: ["A1:A999"],
};
var GRID_COLUMN = {
    background: "#eeffee",
    fontColor: "#888888",
    range: ["A1:A999"],
};
var CHECKBOX_GRID_COLUMN = {
    background: "#bbddbb",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var DATE_ITEM = {
    background: "#ddffff",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var TIME_ITEM = {
    background: "#ddffee",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var DATETIME_ITEM = {
    background: "#ddeeff",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var DURATION_ITEM = {
    background: "#ddeeee",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var MULTIPLE_CHOICE_ITEM = {
    background: "#eeeeff",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var LIST_ITEM = {
    background: "#ddddee",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var CHECKBOX_ITEM = {
    background: "#ccccdd",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var MULTIPLE_CHOICE_CHOICE = {
    background: "#eeeeff",
    fontColor: "#666666",
    range: ["A1:A999"],
};
var LIST_CHOICE = {
    background: "#ddddee",
    fontColor: "#666666",
    range: ["A1:A999"],
};
var CHECKBOX_CHOICE = {
    background: "#ccccdd",
    fontColor: "#666666",
    range: ["A1:A999"],
};
var TEXT_ITEM = {
    background: "#ffffcc",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var PARAGRAPH_TEXT_ITEM = {
    background: "#eeeebb",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var SCALE_ITEM = {
    background: "#aaccaa",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var MEDIA_ITEM = {
    background: "#cccccc",
    fontColor: "#000000",
    range: ["A1:A999"],
};
var BOOLEAN_STYLE = {
    background: "#ffffff",
    fontColor: "#ff0000",
    range: ["B1:B999", "C1:C999", "D1:D999", "E1:E999"],
};
var PAGE_BREAK_STYLE = {
    background: "#ffffff",
    fontColor: "#ff0000",
    range: ["D1:D999"],
};
var DESTINATION_TYPE_STYLE = {
    background: "#ffffff",
    fontColor: "#ff0000",
    range: ["B1:B999"],
};
var ALIGNMENT_STYLE = {
    background: "#ffffff",
    fontColor: "#ff0000",
    range: ["G1:G999"],
};
var METADATA_KEYS = [
    "id",
    "editUrl",
    "publishedUrl",
    "summaryUrl",
    "editors",
    "title",
    "description",
    "confirmationMessage",
    "customClosedFormMessage",
    "progressBar",
    "acceptingResponses",
    "requiresLogin",
    "collectEmail",
    "allowResponseEdits",
    "limitOneResponsePerUser",
    "linkToRespondAgain",
    "publishingSummary",
    "quiz",
    "shuffleQuestions",
    "destinationId",
    "destinationType",
];
var typeStyles = {
    "quiz": METADATA_OPTIONAL,
    "allowResponseEdits": METADATA_OPTIONAL,
    "collectEmail": METADATA_OPTIONAL,
    "description": METADATA_OPTIONAL,
    "acceptingResponses": METADATA_OPTIONAL,
    "publishingSummary": METADATA_OPTIONAL,
    "confirmationMessage": METADATA_OPTIONAL,
    "customClosedFormMessage": METADATA_OPTIONAL,
    "limitOneResponsePerUser": METADATA_OPTIONAL,
    "progressBar": METADATA_OPTIONAL,
    "editUrl": METADATA_REQUIRED,
    "editors": METADATA_REQUIRED,
    "id": METADATA_REQUIRED,
    "publishedUrl": METADATA_REQUIRED,
    "shuffleQuestions": METADATA_OPTIONAL,
    "summaryUrl": METADATA_REQUIRED,
    "title": METADATA_REQUIRED,
    "requiresLogin": METADATA_OPTIONAL,
    "linkToRespondAgain": METADATA_OPTIONAL,
    "destinationId": METADATA_OPTIONAL,
    "destinationType": METADATA_OPTIONAL,
    "checkboxGrid": CHECKBOX_GRID_ITEM,
    "checkboxGrid:row": CHECKBOX_GRID_ROW,
    "checkboxGrid:column": CHECKBOX_GRID_COLUMN,
    "grid": GRID_ITEM,
    "grid:row": GRID_ROW,
    "grid:column": GRID_COLUMN,
    "time": TIME_ITEM,
    "date": DATE_ITEM,
    "dateTime": DATETIME_ITEM,
    "duration": DURATION_ITEM,
    "scale": SCALE_ITEM,
    "checkbox": CHECKBOX_ITEM,
    "list": LIST_ITEM,
    "multipleChoice": MULTIPLE_CHOICE_ITEM,
    "checkbox:choice": CHECKBOX_CHOICE,
    "list:choice": LIST_CHOICE,
    "multipleChoice:choice": MULTIPLE_CHOICE_CHOICE,
    "pageBreak": PAGE_BREAK_ITEM,
    "sectionHeader": SECTION_HEADER_ITEM,
    "paragraphText": PARAGRAPH_TEXT_ITEM,
    "text": TEXT_ITEM,
    "image": MEDIA_ITEM,
    "video": MEDIA_ITEM,
    "TRUE": BOOLEAN_STYLE,
    "FALSE": BOOLEAN_STYLE,
    "SPREADSHEET": DESTINATION_TYPE_STYLE,
    "CONTINUE": PAGE_BREAK_STYLE,
    "SUBMIT": PAGE_BREAK_STYLE,
    "GO_TO_PAGE": PAGE_BREAK_STYLE,
    "RESTART": PAGE_BREAK_STYLE,
    "LEFT": ALIGNMENT_STYLE,
    "CENTER": ALIGNMENT_STYLE,
    "RIGHT": ALIGNMENT_STYLE,
};
function jsonToSheet(json, sheet) {
    valuesToSheet(jsonToValues(json), sheet);
}
exports.default = jsonToSheet;
function itemToRows(item) {
    var rows = [];
    switch (item.type) {
        case "text":
        case "paragraphText":
        case "time":
        case "duration":
            rows.push([item.type, item.title, item.helpText, item.isRequired]);
            break;
        case "multipleChoice":
        case "checkbox":
        case "list":
            var row = [
                item.type,
                item.title,
                item.helpText,
                item.isRequired,
                item.hasOtherOption,
            ];
            if (item.points || item.feedbackForCorrect || item.feedbackForIncorrect) {
                if (item.points) {
                    row.push(item.points);
                }
                else {
                    row.push("");
                }
                if (item.feedbackForCorrect) {
                    if (item.feedbackForCorrect.text) {
                        row.push(item.feedbackForCorrect.text);
                    }
                    else {
                        row.push("#"); // FIXME
                    }
                }
                else {
                    row.push("");
                }
                if (item.feedbackForCorrect) {
                    if (item.feedbackForCorrect.text) {
                        row.push(item.feedbackForCorrect.text);
                    }
                    else {
                        row.push("#"); // FIXME
                    }
                }
                else {
                    row.push("");
                }
            }
            rows.push(row);
            item.choices
                .map(function (choice) {
                var isCorrectAnswer = choice.isCorrectAnswer
                    ? choice.isCorrectAnswer
                    : "";
                var pageNavigationType = choice.pageNavigationType
                    ? choice.pageNavigationType
                    : "";
                var gotoPageTitle = choice.gotoPageTitle
                    ? choice.gotoPageTitle
                    : "";
                return [item.type + ":choice", choice.value, isCorrectAnswer, pageNavigationType, gotoPageTitle];
            })
                .forEach(function (row) {
                rows.push(row);
            });
            break;
        case "checkboxGrid":
        case "grid":
            rows.push([item.type, item.title, item.helpText, item.isRequired]);
            item.rows.forEach(function (row) {
                rows.push([item.type + ":row", row]);
            });
            item.columns.forEach(function (column) {
                rows.push([item.type + ":column", column]);
            });
            break;
        case "scale":
            rows.push([
                item.type,
                item.title,
                item.helpText,
                item.isRequired,
                item.leftLabel,
                item.rightLabel,
                item.lowerBound,
                item.upperBound,
            ]);
            break;
        case "date":
        case "datetime":
            rows.push([
                item.type,
                item.title,
                item.helpText,
                item.isRequired,
                item.includesYear,
            ]);
            break;
        case "sectionHeader":
            rows.push([item.type, item.title, item.helpText]);
            break;
        case "pageBreak":
            rows.push([
                item.type,
                item.title,
                item.helpText,
                item.pageNavigationType,
                item.gotoPageTitle,
            ]);
            break;
        case "image":
            rows.push([
                item.type,
                item.title,
                item.helpText,
                "",
                item.image,
                item.width,
                item.alignment,
            ]);
            break;
        case "video":
            rows.push([
                item.type,
                item.title,
                item.helpText,
                "",
                item.videoURL,
                item.width,
                item.alignment,
            ]);
            break;
    }
    return rows;
}
/**
   与えられたitemsのJSONをもとに、スプレッドシートに書き込む2次元配列での値を生成する
   */
function jsonToValues(json) {
    var rows = [];
    METADATA_KEYS.forEach(function (key) {
        if (key === "editors") {
            rows.push([key, json.metadata[key].join(",")]);
        }
        else {
            rows.push([key, json.metadata[key]]);
        }
    });
    json.items.forEach(function (item) {
        itemToRows(item).forEach(function (row) {
            rows.push(row);
        });
    });
    // Logger.log(JSON.stringify(json, null, "  "));
    return rows;
}
var setConditionalRules = function (sheet) {
    sheet.setConditionalFormatRules(Object.entries(typeStyles).map(function (_a) {
        var _b = __read(_a, 2), key = _b[0], style = _b[1];
        return SpreadsheetApp.newConditionalFormatRule()
            .whenTextEqualTo(key)
            .setBackground(style.background)
            .setFontColor(style.fontColor)
            .setRanges(style.range.map(function (range) { return sheet.getRange(range); }))
            .build();
    }));
};
/**
   与えられた2次元配列の値をもとに、指定されたシートに対して、所与の文法でセルに値を設定していく
   */
function valuesToSheet(values, sheet) {
    sheet.clear();
    setConditionalRules(sheet);
    values.forEach(function (value) {
        sheet.appendRow(value);
    });
}


/***/ }),

/***/ "./src/app/form/messages.ts":
/*!**********************************!*\
  !*** ./src/app/form/messages.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
var messages = {
    en: {
        ui: {
            sheet2form: "sheet2form",
            "export form": "Export form",
            "initialize sheet": "initialize sheet",
            "validate sheet": "validate sheet",
            "export form from sheet": "export form from sheet",
            "form title": "form title",
            "form export canceled": "form export canceled",
            "new form": "new form",
            "input source spreadsheet ID or URL (blank to use active spreadsheet)": "input source spreadsheet ID or URL (blank to use active spreadsheet)",
            "invalid spreadsheet ID or URL": "invalid spreadsheet ID or URL",
            "input sheet index": "input sheet index",
            "(blank to use active sheet)": "(blank to use active sheet)",
            "invalid sheet index": "invalid sheet index",
            "form export succeed.": "form export succeed.",
            "form export failed.": "form export failed.",
            "import form": "Import form",
            "input source form URL": "input source form URL",
            "input target spreadsheet URL (blank to use active spreadsheet)": "input target spreadsheet URL (blank to use active spreadsheet)",
            "form import canceled": "form import canceled",
            "invalid form ID or URL": "invalid form ID or URL",
            "form import failed.": "form import failed.",
            "form import succeed.": "form import succeed.",
        },
    },
    ja: {
        ui: {
            sheet2form: "sheet2form",
            "export form": "フォームの書き出し",
            "initialize sheet": "シートの初期化・読み込み",
            "validate sheet": "シートの構造を検証する",
            "export form from sheet": "シート内容からフォームを生成する",
            "form title": "フォームのタイトル",
            "form export canceled": "フォーム生成をキャンセルしました。",
            "new form": "新しいフォーム",
            "input source spreadsheet ID or URL (blank to use active spreadsheet)": "スプレッドシートのIDまたはURLを入力\\n(空欄の入力でアクティブなスプレッドシートを指定)",
            "invalid spreadsheet ID or URL": "不正なIDまたはURLです",
            "input sheet index": "利用するシートのインデックスを数値で指定",
            "(blank to use active sheet)": "または空欄でアクティブなシートを指定",
            "invalid sheet index": "不正なインデックスです",
            "form export succeed.": "フォーム生成に成功しました。",
            "form export failed.": "フォーム生成に失敗しました。",
            "import form": "フォームの読み込み",
            "input source form URL": "フォームIDまたはURLを入力",
            "input target spreadsheet URL (blank to use active spreadsheet)": "スプレッドシートのはURLを入力\\n(空欄の入力でアクティブなスプレッドシートを指定)",
            "form import canceled": "フォームの読み込みをキャンセルしました。",
            "invalid form ID or URL": "不正なIDまたはURLです",
            "form import failed.": "フォーム読み込みに失敗しました.",
            "form import succeed.": "フォーム読み込みに成功しました.",
        },
    }
};
function getMessages(lang) {
    return messages['ja'];
}
exports.default = getMessages;


/***/ }),

/***/ "./src/app/form/sheetToJson.ts":
/*!*************************************!*\
  !*** ./src/app/form/sheetToJson.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var COL_INDEX = {
    TYPE: 0,
    META: {
        ID: 1,
        VERSION: 1,
        TITLE: 1,
        DESCRIPTION: 1,
        MESSAGE: 1,
        BOOLEAN: 1,
        URL: 1,
    },
    CHOICE: {
        VALUE: 1,
        IS_CORRECT_ANSWER: 2,
        PAGE_NAVIGATION_TYPE: 3,
        GOTO_PAGE_TITLE: 4,
    },
    GRID: {
        ROW_LABEL: 2,
        COL_LABEL: 2,
    },
    CHECKBOX_GRID: {
        ROW_LABEL: 2,
        COL_LABEL: 2,
    },
    ITEM: {
        TITLE: 1,
        HELP_TEXT: 2,
        Q: {
            REQUIRED: 3,
            SCALE: {
                LEFT_LABEL: 4,
                RIGHT_LABEL: 5,
                LOWER_BOUND: 6,
                UPPER_BOUND: 7,
            },
            DATE: {
                INCLUDES_YEAR: 4,
                POINTS: 5,
            },
            DATE_TIME: {
                INCLUDES_YEAR: 4,
                POINTS: 5,
            },
            TIME: {
                INCLUDES_YEAR: -1,
                POINTS: 5,
            },
            MULTIPLE_CHOICE: {
                SHOW_OTHER: 4,
                POINTS: 5,
            },
            CHECKBOX: {
                SHOW_OTHER: 4,
                POINTS: 5,
            },
            LIST: {
                SHOW_OTHER: -1,
                POINTS: 5,
            },
            TEXT: {
                POINTS: 5,
            },
            PARAGRAPH_TEXT: {
                POINTS: 5,
            },
        },
        VIDEO: {
            NA: 3,
            URL: 4,
            WIDTH: 5,
            ALIGNMENT: 6,
        },
        IMAGE: {
            NA: 3,
            URL: 4,
            WIDTH: 5,
            ALIGNMENT: 6,
        },
        PAGE_BREAK: {
            PAGE_NAVIGATION_TYPE: 3,
            GO_TO_PAGE_TITLE: 4,
        },
    },
    FEEDBACK: {
        TEXT: 1,
        URL: 1,
    },
};
//const EMPTY_STRING = "";
var types = {
    quiz: "boolean",
    allowResponseEdits: "boolean",
    collectEmail: "boolean",
    description: "string",
    acceptingResponses: "boolean",
    publishingSummary: "boolean",
    confirmationMessage: "string",
    customClosedFormMessage: "string",
    limitOneResponsePerUser: "boolean",
    progressBar: "boolean",
    editUrl: "string",
    editors: "Array<string>",
    id: "string",
    publishedUrl: "string",
    shuffleQuestions: "boolean",
    summaryUrl: "string",
    title: "String",
    requiresLogin: "boolean",
    linkToRespondAgain: "boolean",
    destinationId: "string",
    destinationType: "string",
};
var createFormMetadata = function (values) {
    var metadataSrc = {};
    values.map(function (row) {
        if (row.length >= 2) {
            var key = row[COL_INDEX.TYPE];
            var value = row[1];
            if (key === "editors" && typeof value === "string") {
                metadataSrc[key] = value.split(",");
            }
            else if (typeof value === types[key]) {
                metadataSrc[key] = value;
            }
        }
    });
    return metadataSrc;
};
function createFormItemObjects(values) {
    var itemObjects = Array();
    for (var index = 0; index < values.length;) {
        var command = values[index][COL_INDEX.TYPE];
        if (command.charAt(0) === "#" || command === "comment") {
            continue;
        }
        index += createFormItemObject(values, index, itemObjects);
    }
    return itemObjects;
}
var createFormItemObject = function (values, base, itemObjects) {
    var index = base;
    for (; index < values.length; index++) {
        var type = values[index][COL_INDEX.TYPE];
        if (type.charAt(0) === "#" || type === "comment") {
            continue;
        }
        else if (itemObjects.length > 0) {
            var isQItem = type === "multipleChoice" ||
                type === "checkbox" ||
                type === "list" ||
                type === "date" ||
                type === "time" ||
                type === "dateTime" ||
                type === "duration" ||
                type === "grid" ||
                type === "checkboxGrid" ||
                type === "scale" ||
                type === "text" ||
                type === "paragraphText";
            var isOtherItem = type === "image" ||
                type === "video" ||
                type === "pageBreak" ||
                type === "sectionHeader";
            var isFeedback = type === "generalFeedback" ||
                type === "correctnessFeedback" ||
                type === "incorrectnessFeedback";
            var isFeedbackLink = type === "generalFeedback.link" ||
                type === "correctnessFeedback.link" ||
                type === "incorrectnessFeedback.link";
            var isChoice = type === "multipleChoice.choice" ||
                type === "checkbox.choice" ||
                type === "list.choice";
            if (isQItem || isOtherItem) {
                var itemObject = {
                    type: type,
                    title: values[index][COL_INDEX.ITEM.TITLE],
                    helpText: values[index][COL_INDEX.ITEM.HELP_TEXT],
                };
                if (isOtherItem) {
                    if (type === "image") {
                        var url = values[index][COL_INDEX.ITEM.IMAGE.URL];
                        var width = values[index][COL_INDEX.ITEM.IMAGE.WIDTH];
                        var alignment = values[index][COL_INDEX.ITEM.IMAGE.ALIGNMENT];
                        var imageItemObject = __assign({ url: url,
                            width: width,
                            alignment: alignment }, itemObject);
                        itemObjects.push(imageItemObject);
                    }
                    else if (type === "video") {
                        var url = values[index][COL_INDEX.ITEM.VIDEO.URL];
                        var width = values[index][COL_INDEX.ITEM.VIDEO.WIDTH];
                        var alignment = values[index][COL_INDEX.ITEM.IMAGE.ALIGNMENT];
                        var videoItemObject = __assign({ url: url,
                            width: width,
                            alignment: alignment }, itemObject);
                        itemObjects.push(videoItemObject);
                    }
                    else if (type === "sectionHeader") {
                        itemObjects.push(__assign({}, itemObject));
                    }
                    else if (type === "pageBreak") {
                        var gotoPageTitle = values[index][COL_INDEX.ITEM.PAGE_BREAK.GO_TO_PAGE_TITLE];
                        var pageNavigationType = values[index][COL_INDEX.ITEM.PAGE_BREAK.PAGE_NAVIGATION_TYPE];
                        if (gotoPageTitle) {
                            var pageBreakObject = __assign({ gotoPageTitle: gotoPageTitle }, itemObject);
                            itemObjects.push(pageBreakObject);
                        }
                        else if (pageNavigationType) {
                            var pageBreakObject = __assign({ pageNavigationType: pageNavigationType }, itemObject);
                            itemObjects.push(pageBreakObject);
                        }
                        else {
                            throw new Error();
                        }
                    }
                }
                else if (isQItem) {
                    var qItemObject = itemObject;
                    qItemObject.isRequired = values[index][COL_INDEX.ITEM.Q.REQUIRED];
                    if (type === "multipleChoice") {
                        var showOther = values[index][COL_INDEX.ITEM.Q.MULTIPLE_CHOICE.SHOW_OTHER];
                        var points = values[index][COL_INDEX.ITEM.Q.MULTIPLE_CHOICE.POINTS];
                        var multipleChoiceItemObject = __assign({ showOther: showOther,
                            points: points, choices: new Array() }, qItemObject);
                        itemObjects.push(multipleChoiceItemObject);
                    }
                    else if (type === "checkbox") {
                        var showOther = values[index][COL_INDEX.ITEM.Q.CHECKBOX.SHOW_OTHER];
                        var points = values[index][COL_INDEX.ITEM.Q.CHECKBOX.POINTS];
                        var checkboxItemObject = __assign({ showOther: showOther,
                            points: points, choices: new Array() }, qItemObject);
                        itemObjects.push(checkboxItemObject);
                    }
                    else if (type === "list") {
                        var points = values[index][COL_INDEX.ITEM.Q.LIST.POINTS];
                        var listItemObject = __assign({ points: points, choices: new Array() }, qItemObject);
                        itemObjects.push(listItemObject);
                    }
                    else if (type === "date") {
                        var includesYear = values[index][COL_INDEX.ITEM.Q.DATE.INCLUDES_YEAR];
                        var points = values[index][COL_INDEX.ITEM.Q.DATE.POINTS];
                        var dateItemObject = __assign({ includesYear: includesYear, points: points }, qItemObject);
                        itemObjects.push(dateItemObject);
                    }
                    else if (type === "time") {
                        var points = values[index][COL_INDEX.ITEM.Q.TIME.POINTS];
                        var dateItemObject = __assign({ points: points }, qItemObject);
                        itemObjects.push(dateItemObject);
                    }
                    else if (type === "dateTime") {
                        var includesYear = values[index][COL_INDEX.ITEM.Q.DATE_TIME.INCLUDES_YEAR];
                        var points = values[index][COL_INDEX.ITEM.Q.DATE_TIME.POINTS];
                        var dateTimeItemObject = __assign({ includesYear: includesYear, points: points }, qItemObject);
                        itemObjects.push(dateTimeItemObject);
                    }
                    else if (type === "grid") {
                        var gridItemObject = __assign({ rows: new Array(), columns: new Array() }, qItemObject);
                        itemObjects.push(gridItemObject);
                    }
                    else if (type === "checkboxGrid") {
                        var checkboxGridItemObject = __assign({ rows: new Array(), columns: new Array() }, qItemObject);
                        itemObjects.push(checkboxGridItemObject);
                    }
                    else if (type === "scale") {
                        var leftLabel = values[index][COL_INDEX.ITEM.Q.SCALE.LEFT_LABEL];
                        var lowerBound = values[index][COL_INDEX.ITEM.Q.SCALE.LOWER_BOUND];
                        var rightLabel = values[index][COL_INDEX.ITEM.Q.SCALE.RIGHT_LABEL];
                        var upperBound = values[index][COL_INDEX.ITEM.Q.SCALE.UPPER_BOUND];
                        if (leftLabel && lowerBound && rightLabel && upperBound) {
                            var scaleItemObject = __assign({ leftLabel: leftLabel,
                                lowerBound: lowerBound,
                                rightLabel: rightLabel,
                                upperBound: upperBound }, qItemObject);
                            itemObjects.push(scaleItemObject);
                        }
                    }
                    else if (type === "text") {
                        var points = values[index][COL_INDEX.ITEM.Q.TEXT.POINTS];
                        var textItemObject = __assign({ points: points }, qItemObject);
                        itemObjects.push(textItemObject);
                    }
                    else if (type === "paragraphText") {
                        var points = values[index][COL_INDEX.ITEM.Q.PARAGRAPH_TEXT.POINTS];
                        var paragraphTextItemObject = __assign({ points: points }, qItemObject);
                        itemObjects.push(paragraphTextItemObject);
                    }
                    else {
                        throw new Error();
                    }
                }
                else if (isFeedback) {
                    var feedbackObject = {
                        type: type,
                        text: values[index][COL_INDEX.FEEDBACK.TEXT],
                        linkUrls: [],
                    };
                    if (type === "generalFeedback") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        quizItem.generalFeedback = feedbackObject;
                    }
                    else if (type === "correctnessFeedback") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        quizItem.feedbackForCorrect = feedbackObject;
                    }
                    else if (type === "incorrectnessFeedback") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        quizItem.feedbackForIncorrect = feedbackObject;
                    }
                }
                else if (isFeedbackLink) {
                    var url = values[index][COL_INDEX.FEEDBACK.URL];
                    if (type === "generalFeedback.link") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        if (quizItem.generalFeedback) {
                            quizItem.generalFeedback.linkUrls.push(url);
                        }
                        else {
                            throw new Error();
                        }
                    }
                    else if (type === "correctnessFeedback.link") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        if (quizItem.feedbackForCorrect) {
                            quizItem.feedbackForCorrect.linkUrls.push(url);
                        }
                        else {
                            throw new Error();
                        }
                    }
                    else if (type === "incorrectnessFeedback.link") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        if (quizItem.feedbackForIncorrect) {
                            quizItem.feedbackForIncorrect.linkUrls.push(url);
                        }
                        else {
                            throw new Error();
                        }
                    }
                }
                else if (isChoice) {
                    var value = values[index][COL_INDEX.CHOICE.VALUE];
                    var choice = values[index][COL_INDEX.CHOICE.IS_CORRECT_ANSWER] === null
                        ? {
                            value: value,
                        }
                        : {
                            value: value,
                            isCorrectAnswer: values[index][COL_INDEX.CHOICE.IS_CORRECT_ANSWER],
                        };
                    if (type === "multipleChoice.choice") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        var pageNavigationType = values[index][COL_INDEX.CHOICE.PAGE_NAVIGATION_TYPE];
                        var gotoPageTitle = values[index][COL_INDEX.CHOICE.GOTO_PAGE_TITLE];
                        if (typeof pageNavigationType === "string")
                            choice.pageNavigationType = pageNavigationType;
                        if (typeof gotoPageTitle === "string")
                            choice.gotoPageTitle = gotoPageTitle;
                        quizItem.choices.push(choice);
                    }
                    else if (type === "checkbox.choice") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        quizItem.choices.push(choice);
                    }
                    else if (type === "list.choice") {
                        var quizItem = itemObjects[itemObjects.length - 1];
                        quizItem.choices.push(choice);
                    }
                }
                else if (type === "grid.row" || type === "grid.column") {
                    var quizItem = itemObjects[itemObjects.length - 1];
                    if (type === "grid.row") {
                        quizItem.rows.push(values[index][COL_INDEX.GRID.ROW_LABEL]);
                    }
                    else if (type === "grid.column") {
                        quizItem.columns.push(values[index][COL_INDEX.GRID.COL_LABEL]);
                    }
                }
                else if (type === "checkboxGrid.row" || type === "checkboxGrid.column") {
                    var quizItem = itemObjects[itemObjects.length - 1];
                    if (type === "checkboxGrid.row") {
                        quizItem.rows.push(values[index][COL_INDEX.CHECKBOX_GRID.ROW_LABEL]);
                    }
                    else if (type === "checkboxGrid.column") {
                        quizItem.columns.push(values[index][COL_INDEX.CHECKBOX_GRID.COL_LABEL]);
                    }
                }
            }
        }
        return index;
    }
    // itemObjects.push({})
    return 1;
};
function sheetToJson(sheet) {
    var values = sheet
        .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
        .getValues();
    return {
        metadata: createFormMetadata(values),
        items: createFormItemObjects(values),
    };
}
exports.default = sheetToJson;


/***/ }),

/***/ "./src/app/form/types.ts":
/*!*******************************!*\
  !*** ./src/app/form/types.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


/*
import Item = GoogleAppsScript.Forms.Item;
import QuizFeedback = GoogleAppsScript.Forms.QuizFeedback;
import MultipleChoiceItem = GoogleAppsScript.Forms.MultipleChoiceItem;
import Alignment = GoogleAppsScript.Forms.Alignment;
*/
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getAlignment = exports.TYPE_NAMES = exports.TYPES = void 0;
exports.TYPES = {
    checkbox: FormApp.ItemType.CHECKBOX,
    checkboxGrid: FormApp.ItemType.CHECKBOX_GRID,
    date: FormApp.ItemType.DATE,
    dateTime: FormApp.ItemType.DATETIME,
    duration: FormApp.ItemType.DURATION,
    grid: FormApp.ItemType.GRID,
    image: FormApp.ItemType.IMAGE,
    list: FormApp.ItemType.LIST,
    multipleChoice: FormApp.ItemType.MULTIPLE_CHOICE,
    pageBreak: FormApp.ItemType.PAGE_BREAK,
    paragraphText: FormApp.ItemType.PARAGRAPH_TEXT,
    scale: FormApp.ItemType.SCALE,
    sectionHeader: FormApp.ItemType.SECTION_HEADER,
    text: FormApp.ItemType.TEXT,
    time: FormApp.ItemType.TIME,
};
exports.TYPE_NAMES = (_a = {},
    _a[FormApp.ItemType.CHECKBOX] = "checkbox",
    _a[FormApp.ItemType.CHECKBOX_GRID] = "checkboxGrid",
    _a[FormApp.ItemType.DATE] = "date",
    _a[FormApp.ItemType.DATETIME] = "dateTime",
    _a[FormApp.ItemType.DURATION] = "duration",
    _a[FormApp.ItemType.GRID] = "grid",
    _a[FormApp.ItemType.IMAGE] = "image",
    _a[FormApp.ItemType.LIST] = "list",
    _a[FormApp.ItemType.MULTIPLE_CHOICE] = "multipleChoice",
    _a[FormApp.ItemType.PAGE_BREAK] = "pageBreak",
    _a[FormApp.ItemType.PARAGRAPH_TEXT] = "paragraphText",
    _a[FormApp.ItemType.SCALE] = "scale",
    _a[FormApp.ItemType.SECTION_HEADER] = "sectionHeader",
    _a[FormApp.ItemType.TEXT] = "text",
    _a[FormApp.ItemType.TIME] = "time",
    _a);
function getAlignment(value) {
    return value === "LEFT" ? FormApp.Alignment.LEFT : value === "CENTER" ? FormApp.Alignment.CENTER : value === "RIGHT" ? FormApp.Alignment.RIGHT : FormApp.Alignment.RIGHT;
}
exports.getAlignment = getAlignment;


/***/ }),

/***/ "./src/app/onOpen.ts":
/*!***************************!*\
  !*** ./src/app/onOpen.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.onOpen = void 0;
function onOpen() {
    var ui = SpreadsheetApp.getUi();
    var importClassroomSubMenu = ui
        .createMenu("A. Classroomからの抽出")
        .addItem("1.コース一覧（courses）を抽出", "importCourses")
        .addSeparator()
        .addItem("2.生徒一覧（students:コース名）を抽出", "importCourseStudents")
        .addItem("3.教員一覧（teachers:コース名）を抽出", "importCourseTeachers")
        .addItem("4.課題一覧（courseworks:コース名）を抽出", "importCourseWorks")
        .addSeparator()
        .addItem("5.提出物一覧（submissions:コース名 課題名）を抽出", "importStudentSubmissions");
    var exportClassroomSubMenu = ui
        .createMenu("B. Classroomの反映")
        .addItem("1.コース（courses）の反映", "exportCourses")
        .addSeparator()
        .addItem("2.生徒（students:コース名）の反映", "exportCourseStudents")
        .addItem("3.教員（teachers:コース名）の反映", "exportCourseTeachers")
        .addItem("4.課題（courseworks:コース名）の反映", "exportCourseWorks");
    var importFormSubMenu = ui
        .createMenu("C. フォームからの抽出")
        .addItem("1.フォーム定義（form:フォーム名）を抽出...", "importFormWithDialog")
        .addSeparator()
        .addItem("2.フォーム定義（form:フォーム名）の抽出内容を更新", "importForm");
    var exportFormSubMenu = ui
        .createMenu("D. フォームの反映")
        .addItem("1.フォーム定義（form:フォーム名）をもとに新規作成...", "exportFormWithDialog")
        .addSeparator()
        .addItem("2.フォーム定義（form:フォーム名）をもとに更新", "exportForm");
    var templateSubMenu = ui
        .createMenu("E. テンプレートの準備")
        .addItem("1.相互評価フォーム（form:コース名 課題名）を準備", "createFormTemplate")
        .addItem("2.評価者-被評価者の対応表（map:コース名 課題名）を準備", "createMapTemplate")
        .addItem("3.相互評価設定シート（review:コース名 課題名）を準備", "createConfigTemplate");
    var buildSubMenu = ui
        .createMenu("F. ビルド")
        .addItem("1.評価フォームのビルド", "buildForm")
        .addItem("2.評価サマリーのビルド", "buildSummary");
    var notifySubMenu = ui
        .createMenu("G. 通知")
        .addItem("1-a.評価者への通知", "notifyToReviewers")
        .addItem("1-b.評価者へのリマインド", "remindToReviewers")
        .addItem("2.被評価者への通知", "notifyToReviewees");
    ui.createMenu("相互評価")
        .addSubMenu(importClassroomSubMenu)
        .addSubMenu(exportClassroomSubMenu)
        .addSeparator()
        .addSubMenu(importFormSubMenu)
        .addSubMenu(exportFormSubMenu)
        .addSeparator()
        .addSubMenu(templateSubMenu)
        .addSeparator()
        .addSubMenu(buildSubMenu)
        .addSeparator()
        .addSubMenu(notifySubMenu)
        .addToUi();
}
exports.onOpen = onOpen;


/***/ }),

/***/ "./src/app/sheetUtil.ts":
/*!******************************!*\
  !*** ./src/app/sheetUtil.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSchema = exports.createOrSelectSheetBySheetName = void 0;
var createOrSelectSheetBySheetName = function (name, tabColor) {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(name);
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(name);
    }
    SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
    sheet.setTabColor(tabColor);
    return sheet;
};
exports.createOrSelectSheetBySheetName = createOrSelectSheetBySheetName;
var getSchema = function (sheetName) {
    return sheetName.split(":")[0];
};
exports.getSchema = getSchema;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************!*\
  !*** ./src/app/index.ts ***!
  \**************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var onOpen_1 = __webpack_require__(/*! ./onOpen */ "./src/app/onOpen.ts");
var classroomToSheet_1 = __webpack_require__(/*! ./classroom/classroomToSheet */ "./src/app/classroom/classroomToSheet.ts");
var exportForm_1 = __webpack_require__(/*! ./form/exportForm */ "./src/app/form/exportForm.ts");
var importForm_1 = __webpack_require__(/*! ./form/importForm */ "./src/app/form/importForm.ts");
__webpack_require__.g.onOpen = onOpen_1.onOpen;
__webpack_require__.g.importCourses = classroomToSheet_1.importCourses;
__webpack_require__.g.importCourseTeachers = classroomToSheet_1.importCourseTeachers;
__webpack_require__.g.importCourseStudents = classroomToSheet_1.importCourseStudents;
__webpack_require__.g.importCourseWorks = classroomToSheet_1.importCourseWorks;
__webpack_require__.g.importStudentSubmissions = classroomToSheet_1.importStudentSubmissions;
__webpack_require__.g.importForm = importForm_1.importForm;
__webpack_require__.g.importFormWithDialog = importForm_1.importFormWithDialog;
__webpack_require__.g.exportForm = exportForm_1.exportForm;
__webpack_require__.g.exportFormWithDialo = exportForm_1.exportFormWithDialog;

})();

/******/ })()
;