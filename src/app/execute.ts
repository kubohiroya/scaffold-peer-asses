import {
  checkSheetName,
  clearReviewConfig,
  getSelectedSubmissionsSheetUrl,
  startReviewConfig,
  storeFormSrcTypeAndUrl,
  storeGroupSheetUrl,
  storeSubmissionsSheetUrl
} from './reviewConfig/reviewConfig';
import {showPicker} from './picker/picker';
import {getCreatedAtUpdatedAtValues} from './driveFileUtil';
import {formToSheet} from './form/importForm';

const INPUT_FORM_OR_FORM_SHEET_URL_PROMPT = "★「フォーム」の場合：「docs.google.com/form」で始まるもの　" +
  "★「フォーム定義シート」の場合：「docs.google.com/spreadsheet」で始まるもの";
const INPUT_GROUP_SHEET_URL_TITLE = "「グループ一覧(groups:)」を含むスプレッドシートのURLを入力...";
const INPUT_GROUP_SHEET_URL_PROMPT = "★「docs.google.com/spreadsheet」で始まるもの";
const INPUT_SUBMISSIONS_SHEET_URL_TITLE = "「提出物一覧(submissions:)」を含むスプレッドシートのURLを入力...";
const INPUT_SUBMISSIONS_SHEET_URL_PROMPT = "★「docs.google.com/spreadsheet」で始まるもの";

const PICK_FORM_TITLE = 'フォームを選択...';
const PICK_FORM_OR_FORM_SHEET_TITLE = "「フォーム」または「フォーム定義シート」を選択...";
const PICK_GROUP_SHEET_TITLE = '「グループ一覧(groups:)」を含むスプレッドシートを選択...';
const INPUT_FORM_OR_FORM_SHEE_URL_TITLE = "「フォーム」または「フォーム定義シート」のURLを入力してください";


const COMMAND = {
  PICK_FORM: 'PICK_FORM',
  CONVERT_FORM_TO_FORM_SHEET: 'CONVERT_FORM_TO_FORM_SHEET',
  SELECT_SUBMISSIONS_SHEET_URL: 'SELECT_SUBMISSION_SHEET',
  CLEAR_REVIEW_CONFIG: 'CLEAR_REVIEW_CONFIG',
  PICK_FORM_OR_FORM_SHEET: 'PICK_FORM_OR_FORM_SHEET',
  PICK_SUBMISSION_SHEET: 'PICK_SUBMISSION_SHEET',
  PICK_GROUP_SHEET: 'PICK_GROUP_SHEET',
  INPUT_FORM_OR_FORM_SHEET_URL: 'INPUT_FORM_OR_FORM_SHEET_URL',
  INPUT_SUBMISSION_SHEET_URL: 'INPUT_SUBMISSION_SHEET_URL',
  INPUT_GROUP_SHEET_URL: 'INPUT_GROUP_SHEET_URL',
  STORE_FORM_SRC_URL: 'STORE_FORM_SRC_URL',
  STORE_GROUP_SHEET_URL: 'STORE_GROUP_SHEET_URL',
  STORE_SUBMISSIONS_SHEET_URL: 'STORE_SUBMISSION_SHEET_URL',
  START_REVIEW_CONFIG: 'START_REVIEW_CONFIG',
}

export function startFormPicker() {
  execute([
    COMMAND.PICK_FORM_OR_FORM_SHEET,
    COMMAND.CONVERT_FORM_TO_FORM_SHEET
  ], 0, {});
}

export function startConfigWithSubmissionsWithPicker() {
  execute([
    COMMAND.CLEAR_REVIEW_CONFIG,
    COMMAND.SELECT_SUBMISSIONS_SHEET_URL,
    COMMAND.STORE_SUBMISSIONS_SHEET_URL,
    COMMAND.PICK_FORM_OR_FORM_SHEET,
    COMMAND.STORE_FORM_SRC_URL,
    COMMAND.START_REVIEW_CONFIG
  ], 0, {});
}

export function startConfigWithGroupSubmissionsWithPicker() {
  execute([
    COMMAND.CLEAR_REVIEW_CONFIG,
    COMMAND.SELECT_SUBMISSIONS_SHEET_URL,
    COMMAND.STORE_SUBMISSIONS_SHEET_URL,
    COMMAND.PICK_GROUP_SHEET,
    COMMAND.STORE_GROUP_SHEET_URL,
    COMMAND.PICK_FORM_OR_FORM_SHEET,
    COMMAND.STORE_FORM_SRC_URL,
    COMMAND.START_REVIEW_CONFIG
  ], 0, {});
}

export function startConfigWithSubmissionsWithInputBox() {
  execute([
    COMMAND.CLEAR_REVIEW_CONFIG,
    COMMAND.SELECT_SUBMISSIONS_SHEET_URL,
    COMMAND.STORE_SUBMISSIONS_SHEET_URL,
    COMMAND.INPUT_FORM_OR_FORM_SHEET_URL,
    COMMAND.STORE_FORM_SRC_URL,
    COMMAND.START_REVIEW_CONFIG
  ], 0, {});
}

export function startConfigWithGroupSubmissionsWithInputBox() {
  execute([
    COMMAND.CLEAR_REVIEW_CONFIG,
    COMMAND.SELECT_SUBMISSIONS_SHEET_URL,
    COMMAND.STORE_SUBMISSIONS_SHEET_URL,
    COMMAND.INPUT_GROUP_SHEET_URL,
    COMMAND.STORE_GROUP_SHEET_URL,
    COMMAND.PICK_FORM_OR_FORM_SHEET,
    COMMAND.STORE_FORM_SRC_URL,
    COMMAND.START_REVIEW_CONFIG
  ], 0, {});
}

export function execute(command: string[], cursor: number, context: any) {
  try {
    for (let i = cursor; i < command.length; i++) {
      switch (command[i]) {
        case COMMAND.CLEAR_REVIEW_CONFIG:
          clearReviewConfig();
          break;

        case COMMAND.SELECT_SUBMISSIONS_SHEET_URL:
          (() => {
            checkSheetName("submissions:");
            const url = getSelectedSubmissionsSheetUrl();
            if (!url) {
              throw new Error("invalid sheet");
            }
            context.url = url;
          })();
          break;

        case COMMAND.PICK_FORM:
          showPicker(PICK_FORM_TITLE, [
              'application/vnd.google-apps.form'
            ],
            command, i);
          return;

        case COMMAND.PICK_FORM_OR_FORM_SHEET:
          showPicker(PICK_FORM_OR_FORM_SHEET_TITLE, [
              'application/vnd.google-apps.form',
              'application/vnd.google-apps.spreadsheet'
            ],
            command, i);
          return;

        case COMMAND.PICK_GROUP_SHEET:
          showPicker(PICK_GROUP_SHEET_TITLE, [
              'application/vnd.google-apps.sheet'
            ],
            command, i);
          return;

        case COMMAND.INPUT_FORM_OR_FORM_SHEET_URL:
          (() => {
            const url = promptWithInputBox(INPUT_FORM_OR_FORM_SHEE_URL_TITLE, INPUT_FORM_OR_FORM_SHEET_URL_PROMPT);
            if (!url) {
              throw new Error("cancel");
            }
            context.url = url;
          })();
          break;

        case COMMAND.INPUT_SUBMISSION_SHEET_URL:
          (() => {
            const url = promptWithInputBox(INPUT_SUBMISSIONS_SHEET_URL_TITLE, INPUT_SUBMISSIONS_SHEET_URL_PROMPT);
            if (!url) {
              throw new Error("cancel");
            }
            context.url = url;
          })();
          break;

        case COMMAND.INPUT_GROUP_SHEET_URL:
          (() => {
            const url = promptWithInputBox(INPUT_GROUP_SHEET_URL_TITLE, INPUT_GROUP_SHEET_URL_PROMPT);
            if (!url) {
              throw new Error("cancel");
            }
            context.url = url;
          })();
          break;

        case COMMAND.STORE_FORM_SRC_URL:
          storeFormSrcTypeAndUrl(context.url);
          break;

        case COMMAND.STORE_SUBMISSIONS_SHEET_URL:
          storeSubmissionsSheetUrl(context.url);
          break;

        case COMMAND.STORE_GROUP_SHEET_URL:
          storeGroupSheetUrl(context.url);
          break;

        case COMMAND.CONVERT_FORM_TO_FORM_SHEET:
          (() => {
            const form = FormApp.openByUrl(context.url);
            const {createdAt, updatedAt} = getCreatedAtUpdatedAtValues(form.getId());
            formToSheet(form, createdAt, updatedAt, null);
          })();
          break;

        case COMMAND.START_REVIEW_CONFIG:
          startReviewConfig();
          break;

        default:
          throw new Error("InvalidCommand: cursor=" + cursor+" command="+command.join(',')+" "+command[cursor]);
      }
    }
  } catch (error) {
    // Browser.msgBox(error);
    throw error;
  }
}

function promptWithInputBox(title: string, prompt: string): string {
  const input = Browser.inputBox(
    title, prompt,
    Browser.Buttons.OK_CANCEL
  );
  if (input === "cancel" || input === "") {
    return null;
  }
  return input;
}

export function pickerHandler(ev: {command: string, cursor: string, url: string}): void {
  Logger.log(JSON.stringify(ev, null, " "));
  const command = ev.command.split(',');
  const cursor = parseInt(ev.cursor);
  const url = ev.url;
  if (cursor < command.length - 1) {
    execute(command, cursor + 1, {url});
  }
}
