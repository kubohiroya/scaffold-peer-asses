const messages = {
  en: {
    ui: {
      sheet2form: "sheet2form",
      "update form": "Update form",
      "initialize sheet": "initialize sheet",
      "validate sheet": "validate sheet",
      "update form from sheet": "Update form from sheet",
      "form title": "form title",
      "form update canceled": "form update canceled",
      "new form": "new form",
      "input source spreadsheet ID or URL (blank to use active spreadsheet)":
        "input source spreadsheet ID or URL (blank to use active spreadsheet)",
      "invalid spreadsheet ID or URL": "invalid spreadsheet ID or URL",
      "input sheet index": "input sheet index",
      "(blank to use active sheet)": "(blank to use active sheet)",
      "invalid sheet index": "invalid sheet index",
      "form update succeed.": "form update succeed.",
      "form update failed.": "form update failed.",
      "import form": "Import form",
      "input source form URL": "input source form URL",
      "input target spreadsheet URL (blank to use active spreadsheet)":
        "input target spreadsheet URL (blank to use active spreadsheet)",
      "form import canceled": "form import canceled",
      "invalid form ID or URL": "invalid form ID or URL",
      "form import failed.": "form import failed.",
      "form import succeed.": "form import succeed.",
    },
  },
  ja: {
    ui: {
      sheet2form: "sheet2form",
      "update form": "フォームの書き出し",
      "initialize sheet": "シートの初期化・読み込み",
      "validate sheet": "シートの構造を検証する",
      "update form from sheet": "シート内容からフォームを生成する",
      "form title": "フォームのタイトル",
      "form update canceled": "フォーム生成をキャンセルしました。",
      "new form": "新しいフォーム",
      "input source spreadsheet ID or URL (blank to use active spreadsheet)":
        "スプレッドシートのIDまたはURLを入力\\n(空欄の入力でアクティブなスプレッドシートを指定)",
      "invalid spreadsheet ID or URL": "不正なIDまたはURLです",
      "input sheet index": "利用するシートのインデックスを数値で指定",
      "(blank to use active sheet)": "または空欄でアクティブなシートを指定",
      "invalid sheet index": "不正なインデックスです",
      "form update succeed.": "フォーム生成に成功しました。",
      "form update failed.": "フォーム生成に失敗しました。",
      "import form": "フォームの読み込み",
      "input source form URL": "フォームIDまたはURLを入力",
      "input target spreadsheet URL (blank to use active spreadsheet)":
        "スプレッドシートのはURLを入力\\n(空欄の入力でアクティブなスプレッドシートを指定)",
      "form import canceled": "フォームの読み込みをキャンセルしました。",
      "invalid form ID or URL": "不正なIDまたはURLです",
      "form import failed.": "フォーム読み込みに失敗しました.",
      "form import succeed.": "フォーム読み込みに成功しました.",
    },
  }
}

export default function getMessages(lang: string): {ui: {[key: string]:string}}{
  return (messages as {[key: string]: any})['ja'];
}
