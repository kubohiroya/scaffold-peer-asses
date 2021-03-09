/**
 * Create a Google Form by a sheet of Google Spreadsheet containing values representing Google Form contents.
 * @param sheet {Object} sheet of Google Spreadsheet containing values representing Google Form contents
 * @param [formTitle] {string} form title (optional)
 * */
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import {
  CheckboxGridItemObject,
  CheckboxItemObject,
  ChoiceObject,
  CorrectnessFeedbackObject,
  FormMetadataObject,
  FormObject,
  GeneralFeedbackObject,
  GridItemObject,
  ItemObject,
  ListItemObject,
  MultipleChoiceItemObject,
  QItemObject,
  QuizFeedbackObject,
} from "./types";

const COL_INDEX = {
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
        SHOW_OTHER: -1, // DO NOT USE
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

const types: Record<string, string> = {
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

const createFormMetadata = (
  values: Array<Array<string | number | boolean | Date | null>>
): FormMetadataObject => {
  const metadataSrc: Record<
    string,
    string | boolean | number | Date | Array<string> | null
  > = {};
  values.map((row) => {
    if (row.length >= 2) {
      const key = row[COL_INDEX.TYPE] as string;
      const value = row[1];
      if (key === "editors" && typeof value === "string") {
        metadataSrc[key] = value.split(",");
      } else if (typeof value === types[key]) {
        metadataSrc[key] = value;
      }
    }
  });
  return (metadataSrc as unknown) as FormMetadataObject;
};

function createFormItemObjects(
  values: Array<Array<string | number | boolean | Date | null>>
): Array<ItemObject> {
  const itemObjects = Array<ItemObject>();
  for (let index = 0; index < values.length; ) {
    const command = values[index][COL_INDEX.TYPE] as string;
    if (command.charAt(0) === "#" || command === "comment") {
      continue;
    }
    index += createFormItemObject(values, index, itemObjects);
  }
  return itemObjects;
}

const createFormItemObject = (
  values: Array<Array<string | number | boolean | Date | null>>,
  base: number,
  itemObjects: Array<ItemObject>
): number => {
  let index = base;
  for (; index < values.length; index++) {
    const type = values[index][COL_INDEX.TYPE] as string;
    if (type.charAt(0) === "#" || type === "comment") {
      continue;
    } else if (itemObjects.length > 0) {
      const isQItem =
        type === "multipleChoice" ||
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
      const isOtherItem =
        type === "image" ||
        type === "video" ||
        type === "pageBreak" ||
        type === "sectionHeader";
      const isFeedback =
        type === "generalFeedback" ||
        type === "correctnessFeedback" ||
        type === "incorrectnessFeedback";
      const isFeedbackLink =
        type === "generalFeedback.link" ||
        type === "correctnessFeedback.link" ||
        type === "incorrectnessFeedback.link";
      const isChoice =
        type === "multipleChoice.choice" ||
        type === "checkbox.choice" ||
        type === "list.choice";

      if (isQItem || isOtherItem) {
        const itemObject = {
          type: type,
          title: values[index][COL_INDEX.ITEM.TITLE],
          helpText: values[index][COL_INDEX.ITEM.HELP_TEXT],
        } as ItemObject;

        if (isOtherItem) {
          if (type === "image") {
            const url = values[index][COL_INDEX.ITEM.IMAGE.URL];
            const width = values[index][COL_INDEX.ITEM.IMAGE.WIDTH];
            const alignment = values[index][COL_INDEX.ITEM.IMAGE.ALIGNMENT];
            const imageItemObject = {
              url,
              width,
              alignment,
              ...itemObject,
            };
            itemObjects.push(imageItemObject);
          } else if (type === "video") {
            const url = values[index][COL_INDEX.ITEM.VIDEO.URL];
            const width = values[index][COL_INDEX.ITEM.VIDEO.WIDTH];
            const alignment = values[index][COL_INDEX.ITEM.IMAGE.ALIGNMENT];
            const videoItemObject = {
              url,
              width,
              alignment,
              ...itemObject,
            };
            itemObjects.push(videoItemObject);
          } else if (type === "sectionHeader") {
            itemObjects.push({ ...itemObject });
          } else if (type === "pageBreak") {
            const gotoPageTitle = values[index][
              COL_INDEX.ITEM.PAGE_BREAK.GO_TO_PAGE_TITLE
            ] as string | null;
            const pageNavigationType = values[index][
              COL_INDEX.ITEM.PAGE_BREAK.PAGE_NAVIGATION_TYPE
            ] as string | null;
            if (gotoPageTitle) {
              const pageBreakObject = { gotoPageTitle, ...itemObject };
              itemObjects.push(pageBreakObject);
            } else if (pageNavigationType) {
              const pageBreakObject = { pageNavigationType, ...itemObject };
              itemObjects.push(pageBreakObject);
            } else {
              throw new Error();
            }
          }
        } else if (isQItem) {
          const qItemObject = itemObject as QItemObject;
          qItemObject.isRequired = values[index][
            COL_INDEX.ITEM.Q.REQUIRED
          ] as boolean;
          if (type === "multipleChoice") {
            const showOther = values[index][COL_INDEX.ITEM.Q.MULTIPLE_CHOICE.SHOW_OTHER];
            const points = values[index][COL_INDEX.ITEM.Q.MULTIPLE_CHOICE.POINTS];
            const multipleChoiceItemObject = {
              showOther,
              points,
              choices: new Array<ChoiceObject>(),
              ...qItemObject,
            };
            itemObjects.push(multipleChoiceItemObject);
          } else if (type === "checkbox") {
            const showOther =
              values[index][COL_INDEX.ITEM.Q.CHECKBOX.SHOW_OTHER];
            const points = values[index][COL_INDEX.ITEM.Q.CHECKBOX.POINTS];
            const checkboxItemObject = {
              showOther,
              points,
              choices: new Array<ChoiceObject>(),
              ...qItemObject,
            };
            itemObjects.push(checkboxItemObject);
          } else if (type === "list") {
            const points = values[index][COL_INDEX.ITEM.Q.LIST.POINTS];
            const listItemObject = {
              points,
              choices: new Array<ChoiceObject>(),
              ...qItemObject,
            };
            itemObjects.push(listItemObject);
          } else if (type === "date") {
            const includesYear =
              values[index][COL_INDEX.ITEM.Q.DATE.INCLUDES_YEAR];
            const points = values[index][COL_INDEX.ITEM.Q.DATE.POINTS];
            const dateItemObject = { includesYear, points, ...qItemObject };
            itemObjects.push(dateItemObject);
          } else if (type === "time") {
            const points = values[index][COL_INDEX.ITEM.Q.TIME.POINTS];
            const dateItemObject = { points, ...qItemObject };
            itemObjects.push(dateItemObject);
          } else if (type === "dateTime") {
            const includesYear =
              values[index][COL_INDEX.ITEM.Q.DATE_TIME.INCLUDES_YEAR];
            const points = values[index][COL_INDEX.ITEM.Q.DATE_TIME.POINTS];
            const dateTimeItemObject = { includesYear, points, ...qItemObject };
            itemObjects.push(dateTimeItemObject);
          } else if (type === "grid") {
            const gridItemObject = {
              rows: new Array<string>(),
              columns: new Array<string>(),
              ...qItemObject,
            };
            itemObjects.push(gridItemObject);
          } else if (type === "checkboxGrid") {
            const checkboxGridItemObject = {
              rows: new Array<string>(),
              columns: new Array<string>(),
              ...qItemObject,
            };
            itemObjects.push(checkboxGridItemObject);
          } else if (type === "scale") {
            const leftLabel = values[index][COL_INDEX.ITEM.Q.SCALE.LEFT_LABEL];
            const lowerBound =
              values[index][COL_INDEX.ITEM.Q.SCALE.LOWER_BOUND];
            const rightLabel =
              values[index][COL_INDEX.ITEM.Q.SCALE.RIGHT_LABEL];
            const upperBound =
              values[index][COL_INDEX.ITEM.Q.SCALE.UPPER_BOUND];
            if (leftLabel && lowerBound && rightLabel && upperBound) {
              const scaleItemObject = {
                leftLabel,
                lowerBound,
                rightLabel,
                upperBound,
                ...qItemObject,
              };
              itemObjects.push(scaleItemObject);
            }
          } else if (type === "text") {
            const points = values[index][COL_INDEX.ITEM.Q.TEXT.POINTS];
            const textItemObject = { points, ...qItemObject };
            itemObjects.push(textItemObject);
          } else if (type === "paragraphText") {
            const points =
              values[index][COL_INDEX.ITEM.Q.PARAGRAPH_TEXT.POINTS];
            const paragraphTextItemObject = { points, ...qItemObject };
            itemObjects.push(paragraphTextItemObject);
          } else {
            throw new Error();
          }
        } else if (isFeedback) {
          const feedbackObject: QuizFeedbackObject = {
            type: type,
            text: values[index][COL_INDEX.FEEDBACK.TEXT] as string,
            linkUrls: [],
          };
          if (type === "generalFeedback") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as GeneralFeedbackObject;
            quizItem.generalFeedback = feedbackObject;
          } else if (type === "correctnessFeedback") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as CorrectnessFeedbackObject;
            quizItem.feedbackForCorrect = feedbackObject;
          } else if (type === "incorrectnessFeedback") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as CorrectnessFeedbackObject;
            quizItem.feedbackForIncorrect = feedbackObject;
          }
        } else if (isFeedbackLink) {
          const url = values[index][COL_INDEX.FEEDBACK.URL] as string;
          if (type === "generalFeedback.link") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as GeneralFeedbackObject;
            if (quizItem.generalFeedback) {
              quizItem.generalFeedback.linkUrls.push(url);
            } else {
              throw new Error();
            }
          } else if (type === "correctnessFeedback.link") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as CorrectnessFeedbackObject;
            if (quizItem.feedbackForCorrect) {
              quizItem.feedbackForCorrect.linkUrls.push(url);
            } else {
              throw new Error();
            }
          } else if (type === "incorrectnessFeedback.link") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as CorrectnessFeedbackObject;
            if (quizItem.feedbackForIncorrect) {
              quizItem.feedbackForIncorrect.linkUrls.push(url);
            } else {
              throw new Error();
            }
          }
        } else if (isChoice) {
          const value = values[index][COL_INDEX.CHOICE.VALUE] as string;
          const choice =
            values[index][COL_INDEX.CHOICE.IS_CORRECT_ANSWER] === null
              ? ({
                  value,
                } as ChoiceObject)
              : ({
                  value,
                  isCorrectAnswer:
                    values[index][COL_INDEX.CHOICE.IS_CORRECT_ANSWER],
                } as ChoiceObject);
          if (type === "multipleChoice.choice") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as MultipleChoiceItemObject;
            const pageNavigationType =
              values[index][COL_INDEX.CHOICE.PAGE_NAVIGATION_TYPE];
            const gotoPageTitle =
              values[index][COL_INDEX.CHOICE.GOTO_PAGE_TITLE];
            if (typeof pageNavigationType === "string")
              choice.pageNavigationType = pageNavigationType as string;
            if (typeof gotoPageTitle === "string")
              choice.gotoPageTitle = gotoPageTitle as string;
            quizItem.choices.push(choice);
          } else if (type === "checkbox.choice") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as CheckboxItemObject;
            quizItem.choices.push(choice);
          } else if (type === "list.choice") {
            const quizItem = (itemObjects[
              itemObjects.length - 1
            ] as unknown) as ListItemObject;
            quizItem.choices.push(choice);
          }
        } else if (type === "grid.row" || type === "grid.column") {
          const quizItem = (itemObjects[
            itemObjects.length - 1
          ] as unknown) as GridItemObject;
          if (type === "grid.row") {
            quizItem.rows.push(
              values[index][COL_INDEX.GRID.ROW_LABEL] as string
            );
          } else if (type === "grid.column") {
            quizItem.columns.push(
              values[index][COL_INDEX.GRID.COL_LABEL] as string
            );
          }
        } else if (type === "checkboxGrid.row" || type === "checkboxGrid.column") {
          const quizItem = (itemObjects[
            itemObjects.length - 1
          ] as unknown) as CheckboxGridItemObject;
          if (type === "checkboxGrid.row") {
            quizItem.rows.push(
              values[index][COL_INDEX.CHECKBOX_GRID.ROW_LABEL] as string
            );
          } else if (type === "checkboxGrid.column") {
            quizItem.columns.push(
              values[index][COL_INDEX.CHECKBOX_GRID.COL_LABEL] as string
            );
          }
        }
      }
    }
    return index;
  }

  // itemObjects.push({})
  return 1;
};

export default function sheetToJson(sheet: Sheet): FormObject {
  const values = sheet
    .getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
    .getValues();

  return {
    metadata: createFormMetadata(values),
    items: createFormItemObjects(values),
  };
}
