/**
 * Create a sheet of Google Spreadsheet by JSON object containing values representing Google Form contents.
 * @param json {Object} JSON object containing values representing Google Form contents
 * @param sheet {Object} output target sheet of Google Spreadsheet
 * */
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;

const METADATA_REQUIRED = {
  background: "#ffeeee",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const METADATA_OPTIONAL = {
  background: "#ffeeee",
  fontColor: "#888888",
  range: ["A1:A999"],
}

const SECTION_HEADER_ITEM = {
  background: "#eedddd",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const PAGE_BREAK_ITEM = {
  background: "#ccaaaa",
  fontColor: "#000000",
  range: ["A1:A999"],
}

const GRID_ITEM = {
  background: "#eeffee",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const CHECKBOX_GRID_ITEM = {
  background: "#bbddbb",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const GRID_ROW = {
  background: "#eeffee",
  fontColor: "#888888",
  range: ["A1:A999"],
}
const CHECKBOX_GRID_ROW = {
  background: "#bbddbb",
  fontColor: "#888888",
  range: ["A1:A999"],
}
const GRID_COLUMN = {
  background: "#eeffee",
  fontColor: "#888888",
  range: ["A1:A999"],
}
const CHECKBOX_GRID_COLUMN = {
  background: "#bbddbb",
  fontColor: "#000000",
  range: ["A1:A999"],
}

const DATE_ITEM = {
  background: "#ddffff",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const TIME_ITEM = {
  background: "#ddffee",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const DATETIME_ITEM = {
  background: "#ddeeff",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const DURATION_ITEM = {
  background: "#ddeeee",
  fontColor: "#000000",
  range: ["A1:A999"],
}

const MULTIPLE_CHOICE_ITEM = {
  background: "#eeeeff",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const LIST_ITEM = {
  background: "#ddddee",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const CHECKBOX_ITEM = {
  background: "#ccccdd",
  fontColor: "#000000",
  range: ["A1:A999"],
}

const MULTIPLE_CHOICE_CHOICE = {
  background: "#eeeeff",
  fontColor: "#666666",
  range: ["A1:A999"],
}
const LIST_CHOICE = {
  background: "#ddddee",
  fontColor: "#666666",
  range: ["A1:A999"],
}
const CHECKBOX_CHOICE = {
  background: "#ccccdd",
  fontColor: "#666666",
  range: ["A1:A999"],
}

const TEXT_ITEM = {
  background: "#ffffcc",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const PARAGRAPH_TEXT_ITEM = {
  background: "#eeeebb",
  fontColor: "#000000",
  range: ["A1:A999"],
}

const SCALE_ITEM = {
  background: "#aaccaa",
  fontColor: "#000000",
  range: ["A1:A999"],
}
const MEDIA_ITEM = {
  background: "#cccccc",
  fontColor: "#000000",
  range: ["A1:A999"],
}

const BOOLEAN_STYLE = {
  background: "#ffffff",
  fontColor: "#ff0000",
  range: ["B1:B999", "C1:C999", "D1:D999", "E1:E999"],
}

const PAGE_BREAK_STYLE = {
  background: "#ffffff",
  fontColor: "#ff0000",
  range: ["D1:D999"],
}

const DESTINATION_TYPE_STYLE = {
  background: "#ffffff",
  fontColor: "#ff0000",
  range: ["B1:B999"],
}
const ALIGNMENT_STYLE = {
  background: "#ffffff",
  fontColor: "#ff0000",
  range: ["G1:G999"],
}

const METADATA_KEYS = [
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

const typeStyles = {
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

  "checkbox":CHECKBOX_ITEM,
  "list":LIST_ITEM,
  "multipleChoice":MULTIPLE_CHOICE_ITEM,

  "checkbox:choice":CHECKBOX_CHOICE,
  "list:choice":LIST_CHOICE,
  "multipleChoice:choice":MULTIPLE_CHOICE_CHOICE,


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
}

export default function jsonToSheet(json: any, sheet: Sheet) {
  valuesToSheet(jsonToValues(json), sheet);
}

function itemToRows(item: any) {
  const rows = [];
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
      const row = [
        item.type,
        item.title,
        item.helpText,
        item.isRequired,
        item.hasOtherOption,
      ];
      if (item.points || item.feedbackForCorrect || item.feedbackForIncorrect) {
        if (item.points) {
          row.push(item.points);
        } else {
          row.push("");
        }
        if (item.feedbackForCorrect) {
          if (item.feedbackForCorrect.text) {
            row.push(item.feedbackForCorrect.text);
          } else {
            row.push("#"); // FIXME
          }
        } else {
          row.push("");
        }
        if (item.feedbackForCorrect) {
          if (item.feedbackForCorrect.text) {
            row.push(item.feedbackForCorrect.text);
          } else {
            row.push("#"); // FIXME
          }
        } else {
          row.push("");
        }
      }
      rows.push(row);
      item.choices
        .map(function (choice: any) {
          const isCorrectAnswer = choice.isCorrectAnswer
            ? choice.isCorrectAnswer
            : "";
          const pageNavigationType = choice.pageNavigationType
            ? choice.pageNavigationType
            : "";
          const gotoPageTitle = choice.gotoPageTitle
            ? choice.gotoPageTitle
            : "";
          return [item.type+":choice", choice.value, isCorrectAnswer, pageNavigationType, gotoPageTitle];
        })
        .forEach(function (row: any) {
          rows.push(row);
        });
      break;
    case "checkboxGrid":
    case "grid":
      rows.push([item.type, item.title, item.helpText, item.isRequired]);
      item.rows.forEach((row: string)=>{
        rows.push([item.type+":row", row]);
      })
      item.columns.forEach((column: string)=>{
        rows.push([item.type+":column", column]);
      })
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
function jsonToValues(json: any) {
  const rows: Array<Array<string|number|boolean|null>> = [];
  METADATA_KEYS.forEach(function (key) {
    if (key === "editors") {
      rows.push([key, json.metadata[key].join(",")]);
    } else {
      rows.push([key, json.metadata[key]]);
    }
  });
  json.items.forEach(function (item: Array<string|number|boolean|null>) {
    itemToRows(item).forEach(function (row) {
      rows.push(row);
    });
  });

  // Logger.log(JSON.stringify(json, null, "  "));
  return rows;
}

const setConditionalRules = (sheet: Sheet)=>{

  sheet.setConditionalFormatRules(
    Object.entries(typeStyles).map(([key, style])=>
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo(key)
        .setBackground(style.background)
        .setFontColor(style.fontColor)
        .setRanges(style.range.map(range=>sheet.getRange(range)))
        .build()
    ));

}

/**
   与えられた2次元配列の値をもとに、指定されたシートに対して、所与の文法でセルに値を設定していく
   */
function valuesToSheet(values: Array<Array<string|number|boolean|null>>, sheet: Sheet) {
  sheet.clear();
  setConditionalRules(sheet);
  values.forEach(function (value) {
    sheet.appendRow(value);
  });
}
