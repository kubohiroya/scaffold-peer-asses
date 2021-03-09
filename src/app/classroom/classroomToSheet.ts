import { getSelectedCourse, getSelectedCourseWorks } from "./selectors";
import { createOrSelectSheetBySheetName } from "../sheetUtil";
import ListStudentsResponse = GoogleAppsScript.Classroom.Schema.ListStudentsResponse;
import Student = GoogleAppsScript.Classroom.Schema.Student;
import Teacher = GoogleAppsScript.Classroom.Schema.Teacher;
import UserProfile = GoogleAppsScript.Classroom.Schema.UserProfile;
import ListTeachersResponse = GoogleAppsScript.Classroom.Schema.ListTeachersResponse;
import ListCourseWorkResponse = GoogleAppsScript.Classroom.Schema.ListCourseWorkResponse;
import ListStudentSubmissionsResponse = GoogleAppsScript.Classroom.Schema.ListStudentSubmissionsResponse;
import StudentSubmission = GoogleAppsScript.Classroom.Schema.StudentSubmission;
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import Course = GoogleAppsScript.Classroom.Schema.Course;
import CourseWork = GoogleAppsScript.Classroom.Schema.CourseWork;

const teacherProfiles = new Map<string, UserProfile>();
const studentProfiles = new Map<string, UserProfile>();
//const CourseMap = new Map<number, Course>();
//const CourseWorkMap = new Map<number, CourseWork>();

const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();

function formatDateTime(datetime: string | undefined): string {
  if (datetime) {
    return Utilities.formatDate(
      new Date(datetime),
      timezone,
      "yyyy/MM/dd HH:mm:ss"
    );
  } else {
    return "(invalid date)";
  }
}

function listCourses(teacherId: string): Course[] {
  if (!Classroom.Courses) {
    throw new Error("Classroom.Courses is null");
  }
  let nextPageToken: string | undefined = "";
  const courses: Course[] = [];
  do {
    const optionalArgs = {
      pageSize: 100,
      teacherId: teacherId,
      courseStates: "ACTIVE",
      pageToken: "",
    };
    if (nextPageToken) {
      optionalArgs.pageToken = nextPageToken;
    }
    const coursesResponse = Classroom.Courses.list(optionalArgs);
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

function listStudentProfiles(courseId: string): Student[] {
  if (!Classroom.Courses || !Classroom.Courses.Students) {
    throw new Error("Classroom.Courses is null");
  }

  let students: Student[] = [];
  let nextPageToken = null;
  do {
    const optionalArgs = {
      pageSize: 64,
      pageToken: "",
    };
    if (nextPageToken) {
      optionalArgs.pageToken = nextPageToken;
    }
    const listStudentsResponse: ListStudentsResponse = Classroom.Courses.Students.list(
      courseId,
      optionalArgs
    );
    nextPageToken = listStudentsResponse.nextPageToken;
    if (listStudentsResponse.students) {
      students = students.concat(listStudentsResponse.students);
    }
  } while (nextPageToken != undefined);
  return students;
}

function getTeacherProfile(courseId: string, teacherId: string): UserProfile {
  if (!Classroom.Courses || !Classroom.Courses.Teachers) {
    throw new Error("Classroom.Courses is null");
  }
  const profile = teacherProfiles.get(teacherId);
  if (!profile) {
    const teacher = Classroom.Courses.Teachers.get(courseId, teacherId);
    if (teacher.profile) {
      teacherProfiles.set(teacherId, teacher.profile);
      return teacher.profile;
    } else {
      return {
        name: { fullName: "(" + teacherId + ")" },
        emailAddress: teacherId,
      };
    }
  } else {
    return profile;
  }
}

function listTeacherProfiles(courseId: string): Teacher[] {
  if (!Classroom.Courses || !Classroom.Courses.Teachers) {
    throw new Error("Classroom.Courses is null");
  }
  let teachers: Teacher[] = [];
  let nextPageToken = null;
  do {
    const optionalArgs = {
      pageSize: 64,
      pageToken: "",
    };
    if (nextPageToken) {
      optionalArgs.pageToken = nextPageToken;
    }
    const teacherList: ListTeachersResponse = Classroom.Courses.Teachers.list(
      courseId,
      optionalArgs
    );
    nextPageToken = teacherList.nextPageToken;
    if (teacherList.teachers) {
      teachers = teachers.concat(teacherList.teachers);
    }
  } while (nextPageToken != undefined);
  return teachers;
}

function getStudentProfile(courseId: string, studentId: string): UserProfile {
  if (!Classroom.Courses || !Classroom.Courses.Students) {
    throw new Error("Classroom.Courses is null");
  }
  const profile = studentProfiles.get(studentId);
  if (!profile) {
    const student = Classroom.Courses.Students.get(courseId, studentId);
    if (student.profile) {
      studentProfiles.set(studentId, student.profile);
      return student.profile;
    } else {
      return {
        name: { fullName: "(" + studentId + ")" },
        emailAddress: studentId,
      };
    }
  } else {
    return profile;
  }
}

function getNumStudents(courseId: string): number {
  if (!Classroom.Courses || !Classroom.Courses.Students) {
    throw new Error("Classroom.Courses is null");
  }
  const students = Classroom.Courses.Students.list(courseId);
  if (students.students) {
    return students.students.length;
  } else {
    return 0;
  }
}

function listCourseWorks(courseId: string, courseName: string): CourseWork[] {
  if (!Classroom.Courses || !Classroom.Courses.CourseWork) {
    throw new Error("Classroom.Courses is null");
  }
  let nextPageToken: string | undefined = undefined;
  const courseWorks: CourseWork[] = [];
  do {
    const optionalArgs = {
      pageSize: 32,
      pageToken: "",
    };
    if (nextPageToken) {
      optionalArgs.pageToken = nextPageToken;
    }
    const courseWorksResponse: ListCourseWorkResponse = Classroom.Courses.CourseWork.list(
      courseId,
      optionalArgs
    );
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

function listStudentSubmissions(
  courseId: string,
  courseName: string,
  courseWorkId: string
): Array<any> {
  if (
    !Classroom.Courses ||
    !Classroom.Courses.CourseWork ||
    !Classroom.Courses.CourseWork.StudentSubmissions
  ) {
    throw new Error("Classroom.Courses is null");
  }
  let nextPageToken: string | undefined = "";
  const submissions: StudentSubmission[] = [];

  do {
    const optionalArgs = {
      pageSize: 64,
      pageToken: "",
    };
    if (nextPageToken) {
      optionalArgs.pageToken = nextPageToken;
    }
    let studentSubmissions: ListStudentSubmissionsResponse = Classroom.Courses.CourseWork.StudentSubmissions.list(
      courseId,
      courseWorkId,
      optionalArgs
    );
    nextPageToken = studentSubmissions.nextPageToken;
    if (studentSubmissions.studentSubmissions) {
      studentSubmissions.studentSubmissions.forEach(function (submission) {
        submissions.push(submission);
      });
    }
  } while (nextPageToken != undefined);

  return submissions;
}

const exportCourseMemberSheet = (
  sheet: Sheet,
  courseId: string,
  courseName: string,
  data: Teacher[] | Student[]
) => {
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

function exportCoursesSheet(sheet: Sheet, data: Course[]) {
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
  data.forEach(function (course: Course) {
    if (course.id && course.ownerId) {
      const user = getTeacherProfile(course.id, course.ownerId);
      const row = [
        course.id,
        course.name,
        course.section || "",
        course.descriptionHeading || "",
        course.room || "",
        user.name?.fullName || user.emailAddress,
        user.emailAddress,
        formatDateTime(course.creationTime),
        formatDateTime(course.updateTime),
        course.enrollmentCode,
        course.courseState,
        course.alternateLink,
        course.teacherGroupEmail,
        course.courseGroupEmail,
        course.teacherFolder?.id,
        course.teacherFolder?.alternateLink,
        course.guardiansEnabled,
        course.calendarId,
        getNumStudents(course.id),
      ];
      sheet.appendRow(row);
    }
  });
}

function exportCourseWorksSheet(
  sheet: Sheet,
  courseName: string,
  data: CourseWork[]
) {
  const courseWorkToRow = function (courseWork: CourseWork) {
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
      const row = courseWorkToRow(courseWork);
      sheet.appendRow(row);
    }
  });
}

function exportStudentSubmissionsSheet(
  sheet: Sheet,
  courseName: string,
  courseWorkTitle: string,
  data: StudentSubmission[]
) {
  const submissionToRow = function (studentSubmission: StudentSubmission) {
    if (
      !studentSubmission.userId ||
      !studentSubmission.courseId ||
      !studentSubmission.courseWorkId
    ) {
      throw new Error(
        "studentSubmission is invalid:" + JSON.stringify(studentSubmission)
      );
    }
    const courseId: string = studentSubmission.courseId;

    const courseWorkId: string = studentSubmission.courseWorkId;

    const userProfile = getStudentProfile(courseId, studentSubmission.userId);

    const row = [
      courseId,
      courseName,
      courseWorkId,
      courseWorkTitle,
      userProfile.name?.fullName || userProfile.emailAddress,
      userProfile.emailAddress,
      studentSubmission.state,
      formatDateTime(studentSubmission.creationTime),
      formatDateTime(studentSubmission.updateTime),
    ];

    if (
      studentSubmission.shortAnswerSubmission &&
      studentSubmission.shortAnswerSubmission.answer
    ) {
      row.push(studentSubmission.shortAnswerSubmission.answer);
    }

    if (
      studentSubmission.assignmentSubmission &&
      studentSubmission.assignmentSubmission.attachments
    ) {
      studentSubmission.assignmentSubmission.attachments.forEach(function (
        attachment
      ) {
        if (attachment.youTubeVideo) {
          const youTubeVideo = attachment.youTubeVideo;
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

export function importCourses() {
  const email = Session.getActiveUser().getEmail();
  let sheet = createOrSelectSheetBySheetName("courses", "black");
  exportCoursesSheet(sheet, listCourses(email));
}

export function importCourseTeachers() {
  try {
    const { courseId, courseName } = getSelectedCourse();
    const teacherSheet = createOrSelectSheetBySheetName(
      "teachers:" + courseName,
      "yellow"
    );
    const teachers = listTeacherProfiles(courseId);
    if (teachers.length === 0) {
      throw new Error(
        "エラー：選択されたコース「" +
          courseName +
          "」には、教員が登録されていません。"
      );
    }
    exportCourseMemberSheet(teacherSheet, courseId, courseName, teachers);
  } catch (err) {
    Browser.msgBox(err);
  }
}

export function importCourseStudents() {
  try {
    const { courseId, courseName } = getSelectedCourse();
    const studentSheet = createOrSelectSheetBySheetName(
      "students:" + courseName,
      "yellow"
    );
    const students = listStudentProfiles(courseId);
    if (students.length === 0) {
      throw new Error(
        "エラー：選択されたコース「" +
          courseName +
          "」には、生徒が登録されていません。"
      );
    }
    exportCourseMemberSheet(studentSheet, courseId, courseName, students);
  } catch (err) {
    Browser.msgBox(err);
  }
}

export function importCourseWorks() {
  try {
    const { courseId, courseName } = getSelectedCourse();
    const targetSheet = createOrSelectSheetBySheetName(
      "courseworks:" + courseName,
      "yellow"
    );
    const courseWorks = listCourseWorks(courseId, courseName);
    exportCourseWorksSheet(targetSheet, courseName, courseWorks);
  } catch (error) {
    Browser.msgBox(error);
  }
}

export function importStudentSubmissions() {
  try {
    const {
      courseId,
      courseName,
      courseWorkId,
      courseWorkTitle,
    } = getSelectedCourseWorks();

    const studentSubmissions = listStudentSubmissions(
      courseId,
      courseName,
      courseWorkId
    );

    const targetSheetName = courseName + " " + courseWorkTitle;
    let targetSheet = createOrSelectSheetBySheetName(
      "submissions:" + targetSheetName,
      "orange"
    );
    exportStudentSubmissionsSheet(
      targetSheet,
      courseName,
      courseWorkTitle,
      studentSubmissions
    );
  } catch (error) {
    Browser.msgBox(error);
  }
}
