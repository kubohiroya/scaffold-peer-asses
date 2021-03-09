export function onOpen() {
  const ui = SpreadsheetApp.getUi();

  const importClassroomSubMenu = ui
    .createMenu("A. Classroomからの抽出")
    .addItem("1.コース一覧（courses）を抽出", "importCourses")
    .addSeparator()
    .addItem("2.生徒一覧（students:コース名）を抽出", "importCourseStudents")
    .addItem("3.教員一覧（teachers:コース名）を抽出", "importCourseTeachers")
    .addItem("4.課題一覧（courseworks:コース名）を抽出", "importCourseWorks")
    .addSeparator()
    .addItem(
      "5.提出物一覧（submissions:コース名 課題名）を抽出",
      "importStudentSubmissions"
    );

  const exportClassroomSubMenu = ui
    .createMenu("B. Classroomの反映")
    .addItem("1.コース（courses）の反映", "exportCourses")
    .addSeparator()
    .addItem("2.生徒（students:コース名）の反映", "exportCourseStudents")
    .addItem("3.教員（teachers:コース名）の反映", "exportCourseTeachers")
    .addItem("4.課題（courseworks:コース名）の反映", "exportCourseWorks");

  const importFormSubMenu = ui
    .createMenu("C. フォームからの抽出")
    .addItem(
      "1.フォーム定義（form:フォーム名）を抽出...",
      "importFormWithDialog"
    )
    .addSeparator()
    .addItem("2.フォーム定義（form:フォーム名）の抽出内容を更新", "importForm")


  const exportFormSubMenu = ui
    .createMenu("D. フォームの反映")
    .addItem(
      "1.フォーム定義（form:フォーム名）をもとに新規作成...",
      "exportFormWithDialog"
    )
    .addSeparator()
    .addItem("2.フォーム定義（form:フォーム名）をもとに更新", "exportForm")
   ;

  const templateSubMenu = ui
    .createMenu("E. テンプレートの準備")
    .addItem(
      "1.相互評価フォーム（form:コース名 課題名）を準備",
      "createFormTemplate"
    )
    .addItem(
      "2.評価者-被評価者の対応表（map:コース名 課題名）を準備",
      "createMapTemplate"
    )
    .addItem(
      "3.相互評価設定シート（review:コース名 課題名）を準備",
      "createConfigTemplate"
    );

  const buildSubMenu = ui
    .createMenu("F. ビルド")
    .addItem("1.評価フォームのビルド", "buildForm")
    .addItem("2.評価サマリーのビルド", "buildSummary");

  const notifySubMenu = ui
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
