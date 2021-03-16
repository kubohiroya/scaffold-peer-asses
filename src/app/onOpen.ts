export function onOpen() {
  const ui = SpreadsheetApp.getUi();

  const importClassroomSubMenu = ui
    .createMenu("A. Classroomからの抽出")
    .addItem("1. コース一覧（courses:教員名）を抽出/抽出内容を更新", "importCourses")
    .addSeparator()
    .addItem("2. 生徒一覧（students:コース名）を抽出/抽出内容を更新", "importCourseStudents")
    .addItem("3. 教員一覧（teachers:コース名）を抽出/抽出内容を更新", "importCourseTeachers")
    .addItem("4. 課題一覧（courseworks:コース名）を抽出/抽出内容を更新", "importCourseWorks")
    .addSeparator()
    .addItem(
      "5. 提出物一覧（submissions:コース名 課題名）を抽出/抽出内容を更新",
      "importStudentSubmissions"
    );

  const exportClassroomSubMenu = ui
    .createMenu("B. Classroomの作成/更新")
    .addItem("1. コース一覧（courses:教員名）からの作成/更新", "updateCourses")
    .addSeparator()
    .addItem("2. 生徒一覧（students:コース名）からの追加/削除", "updateCourseStudents")
    .addItem("3. 教員一覧（teachers:コース名）からの追加/削除", "updateCourseTeachers")
    .addItem("4. 課題一覧（courseworks:コース名）からの追加/削除/更新", "updateCourseWorks");

  const importFormSubMenu = ui
    .createMenu("C. フォームからの抽出")
    .addItem(
      "1. フォーム定義（form:フォーム名）を抽出....",
      "importFormWithPicker"
    )
    .addItem("2. フォーム定義（form:フォーム名）の抽出内容を更新", "importForm");

  const exportFormSubMenu = ui
    .createMenu("D. フォームの作成/更新")
    .addItem(
      "1. フォーム定義（form:フォーム名）をもとに新規作成",
      "exportFormWithDialog"
    )
    .addItem(
      "2. フォーム定義（form:フォーム名）をもとに更新",
      "updateForm"
    )
    .addSeparator()
    .addItem(
      "3. フォーム定義（form:フォーム名）をもとにプレビュー",
      "previewForm"
    )

  const templateSubMenu = ui
    .createMenu("E. 評価")
    .addSubMenu(ui.createMenu("1-a.「提出物一覧(submissions:)」からの個人評価")
      .addItem(
        "1.評価フォーム雛形を選択・新規スプレッドシート(config:)作成・評価を準備",
        "startConfigWithSubmissionsWithPicker")
      .addItem(
        "2.評価フォーム雛形をURL指定・新規スプレッドシート(config:)を作成・評価を準備",
        "startConfigWithSubmissionsWithInputBox")
    )
    .addSubMenu(ui.createMenu("1-b.「提出物一覧(submissions:)」からのグループ評価")
      .addItem("1.「グループ一覧(groups:)」と評価フォーム雛形を選択・新規スプレッドシート(config:)を作成・評価を準備",
        "startConfigWithCustomSheetWithPicker")
      .addItem("2.「グループ一覧(groups:)」と評価フォーム雛形URLを指定・新規スプレッドシート(config:)を作成・評価を準備",
        "startConfigWithDialogWithCustomSheetWithInputBox"))
    .addSeparator()
    .addItem(
      "2. 現在のスプレッドシート(config:)を開いて評価の準備を再開",
      "continueConfig"
    )
    .addSeparator()
    .addItem(
      "3. 現在のスプレッドシート(config:)を用いて評価フォームを開く",
      "openReviewPage"
    )
    .addItem(
      "4. 現在のスプレッドシート(config:)を用いて評価結果シートを開く",
      "openResultSheet"
    );

  const notifySubMenu = ui
    .createMenu("F. 通知")
    .addItem("1-a. 評価者への通知", "notifyToReviewers")
    .addItem("1-b. 評価者へのリマインド", "remindToReviewers")
    .addItem("2. 被評価者への通知", "notifyToReviewees");

  ui.createMenu("相互評価")
    .addSubMenu(importClassroomSubMenu)
    .addSubMenu(exportClassroomSubMenu)
    .addSeparator()
    .addSubMenu(importFormSubMenu)
    .addSubMenu(exportFormSubMenu)
    .addSeparator()
    .addSubMenu(templateSubMenu)
    .addSeparator()
    .addSubMenu(notifySubMenu)
    .addToUi();
}
