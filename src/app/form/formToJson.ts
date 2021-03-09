import Form = GoogleAppsScript.Forms.Form;
import Blob = GoogleAppsScript.Base.Blob;
import QuizFeedback = GoogleAppsScript.Forms.QuizFeedback;
import Alignment = GoogleAppsScript.Forms.Alignment;
// import PageNavigationType = GoogleAppsScript.Forms.PageNavigationType;
import Choice = GoogleAppsScript.Forms.Choice;
import PageBreakItem = GoogleAppsScript.Forms.PageBreakItem;
import Item = GoogleAppsScript.Forms.Item;
import CheckboxItem = GoogleAppsScript.Forms.CheckboxItem;
import CheckboxGridItem = GoogleAppsScript.Forms.CheckboxGridItem;
import DateItem = GoogleAppsScript.Forms.DateItem;
import DateTimeItem = GoogleAppsScript.Forms.DateTimeItem;
import DurationItem = GoogleAppsScript.Forms.DurationItem;
import GridItem = GoogleAppsScript.Forms.GridItem;
import MultipleChoiceItem = GoogleAppsScript.Forms.MultipleChoiceItem;
import ParagraphTextItem = GoogleAppsScript.Forms.ParagraphTextItem;
import ScaleItem = GoogleAppsScript.Forms.ScaleItem;
import TextItem = GoogleAppsScript.Forms.TextItem;
import ImageItem = GoogleAppsScript.Forms.ImageItem;
import VideoItem = GoogleAppsScript.Forms.VideoItem;
const DestinationType = FormApp.DestinationType;
import {
  BlobObject,
  ChoiceObject,
  CorrectnessFeedbackObject,
  FormMetadataObject,
  FormObject,
  GeneralFeedbackObject,
  OtherItemObjects,
  QItemObjects,
  QuizFeedbackObject, TYPE_NAMES,
} from "./types";
import ListItem = GoogleAppsScript.Forms.ListItem;
import TimeItem = GoogleAppsScript.Forms.TimeItem;

/**
 * Convert a Google Form object into JSON Object.
 * @returns JSON object of form data
 * @param form {Form} a Google Form Object
 * */

const getFormMetadata = (form: Form): FormMetadataObject => {
  const metadata: FormMetadataObject = {
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
    editors: form.getEditors().map((user) => user.getEmail()),
    id: form.getId(),
    publishedUrl: form.getPublishedUrl(),
    shuffleQuestions: form.getShuffleQuestions(),
    summaryUrl: form.getSummaryUrl(),
    title: form.getTitle(),
  };

  try {
    const destinationId = form.getDestinationId();
    const destinationType = getDestinationTypeString(form.getDestinationType());
    metadata.destinationId = destinationId;
    metadata.destinationType = destinationType;
  } catch (ignore) {}

  return metadata;
};

export default function formToJson(form: Form): FormObject {
  return {
    metadata: getFormMetadata(form),
    items: form.getItems().map(itemToObject),
  };
}

function blobToJson(blob: Blob): BlobObject {
  return {
    name: blob.getName(),
    contentType: blob.getContentType(),
    dataAsString: blob.getDataAsString(),
  };
}

function choiceToJson(choice: Choice): ChoiceObject {
  const navigation = (choice.getGotoPage())? {
      gotoPageTitle: choice.getGotoPage().getTitle(),
      pageNavigationType: getPageNavigationTypeString(choice.getPageNavigationType())
  }: {};

  return {
    value: choice.getValue(),
    isCorrectAnswer: choice.isCorrectAnswer(),
    ...navigation
  };
}

function feedbackToJson(
  type: string,
  feedback: QuizFeedback
): QuizFeedbackObject | null {
  if (feedback) {
    return {
      type,
      text: feedback.getText(),
      linkUrls: feedback.getLinkUrls(),
    };
  } else {
    return null;
  }
}

function getDestinationTypeString(type: number) {
  switch (type) {
    case DestinationType.SPREADSHEET:
      return "SPREADSHEET";
    default:
      throw new Error("INVALID_DESTINATION");
  }
}

function getAlignmentString(alignment: Alignment) {
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

function getPageNavigationTypeString(type: number) {
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

function getTypedItem(item: Item) {
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

function createItemObject(item: Item, func?: Function) {
  const params = {
    type: TYPE_NAMES[item.getType()],
    id: item.getId(),
    index: item.getIndex(),
    title: item.getTitle(),
    helpText: item.getHelpText(),
  };
  if (func) {
    const typedItem = getTypedItem(item);
    return { ...params, ...func(typedItem) };
  } else {
    return params;
  }
}

// isRequired: item.isRequired(),

function createQuestionnaireItemWithCorrectnessFeedback(
  item: Item,
  func?: Function
): CorrectnessFeedbackObject {
  //CheckboxGridItem|DateItem|DateTimeItem|DurationItem|GridItem|
  //   //ParagraphTextItem|ScaleItem|TextItem|TimeItem
  return createItemObject(
    item,
    function (typedItem: CheckboxItem | MultipleChoiceItem) {
      const params = {
        required: typedItem.isRequired(),
        points: typedItem.getPoints(),
        feedbackForCorrect: feedbackToJson(
          "correctnessFeedback",
          typedItem.getFeedbackForCorrect()
        ),
        feedbackForIncorrect: feedbackToJson(
          "correctnessFeedback",
          typedItem.getFeedbackForIncorrect()
        ),
      };
      if (func) {
        return { ...params, ...func(typedItem) };
      } else {
        return params;
      }
    }
  );
}

function createQuestionnaireItemWithGeneralFeedback(
  item: Item,
  func?: Function
): QItemObjects | GeneralFeedbackObject {
  return createItemObject(
    item,
    function (
      typedItem:
        | DateItem
        | DateTimeItem
        | ScaleItem
        | DurationItem
        | TextItem
        | ParagraphTextItem
    ) {
      const params = {
        required: typedItem.isRequired(),
        points: typedItem.getPoints(),
        generalFeedback: feedbackToJson(
          "generalFeedback",
          typedItem.getGeneralFeedback()
        ),
      };
      if (func) {
        return { ...params, ...func(typedItem) };
      } else {
        return params;
      }
    }
  );
}

function itemToObject(
  item: Item
):
  | QItemObjects
  | GeneralFeedbackObject
  | CorrectnessFeedbackObject
  | OtherItemObjects {

  switch (item.getType()) {
    case FormApp.ItemType.CHECKBOX:
    case FormApp.ItemType.MULTIPLE_CHOICE:
      return createQuestionnaireItemWithCorrectnessFeedback(
        item,
        function (typedItem: CheckboxItem | MultipleChoiceItem) {
          return {
            required: typedItem.isRequired(),
            hasOtherOption: typedItem.hasOtherOption(),
            choices: typedItem.getChoices().map(choiceToJson),
          };
        }
      );

    case FormApp.ItemType.LIST:
      return createQuestionnaireItemWithCorrectnessFeedback(
        item,
        function (typedItem: ListItem) {
          return {
            required: typedItem.isRequired(),
            choices: typedItem.getChoices().map(choiceToJson),
          };
        }
      );

    case FormApp.ItemType.DATE:
    case FormApp.ItemType.DATETIME:
      return createQuestionnaireItemWithGeneralFeedback(
        item,
        function (typedItem: DateItem | DateTimeItem) {
          return {
            required: typedItem.isRequired(),
            includesYear: typedItem.includesYear(),
          };
        }
      );
    case FormApp.ItemType.TIME:
      return createQuestionnaireItemWithGeneralFeedback(
        item,
        function(typedItem: TimeItem) {
          return {
            required: typedItem.isRequired(),
          };
        }
      );

    case FormApp.ItemType.DURATION:
      return createQuestionnaireItemWithGeneralFeedback(
        item,
        function(typedItem: DurationItem) {
          return {
            required: typedItem.isRequired(),
          };
        }
      );

    case FormApp.ItemType.CHECKBOX_GRID:
    case FormApp.ItemType.GRID:
      return createItemObject(
        item,
        function (typedItem: CheckboxGridItem | GridItem) {
          return {
            required: typedItem.isRequired(),
            rows: typedItem.getRows(),
            columns: typedItem.getColumns(),
          };
        }
      );


    case FormApp.ItemType.PARAGRAPH_TEXT:
      return createQuestionnaireItemWithGeneralFeedback(
        item,
        function (typedItem: ParagraphTextItem) {
          return {
            required: typedItem.isRequired(),
            // validation: undefined
          };
        }
      );

    case FormApp.ItemType.SCALE:
      return createQuestionnaireItemWithGeneralFeedback(
        item,
        function (typedItem: ScaleItem) {
          return {
            required: typedItem.isRequired(),
            leftLabel: typedItem.getLeftLabel(),
            lowerBound: typedItem.getLowerBound(),
            rightLabel: typedItem.getRightLabel(),
            upperBound: typedItem.getUpperBound(),
          };
        }
      );

    case FormApp.ItemType.TEXT:
      return createQuestionnaireItemWithGeneralFeedback(
        item,
        function (typedItem: TextItem) {
          return {
            required: typedItem.isRequired(),
            // validation: undefined
          };
        }
      );

    case FormApp.ItemType.IMAGE:
      return createItemObject(item, function (typedItem: ImageItem) {
        return {
          image: blobToJson(typedItem.getImage()),
          alignment: getAlignmentString(typedItem.getAlignment()),
          width: typedItem.getWidth(),
        };
      });

    case FormApp.ItemType.VIDEO:
      return createItemObject(item, function (typedItem: VideoItem) {
        return {
          videoUrl: undefined, //typedItem.getVideoUrl(),
          alignment: getAlignmentString(typedItem.getAlignment()),
          width: typedItem.getWidth(),
        };
      });

    case FormApp.ItemType.PAGE_BREAK:
      return createItemObject(item, function (typedItem: PageBreakItem) {
        if(typedItem.getGoToPage()){
          return {
            pageNavigationType: getPageNavigationTypeString(
              typedItem.getPageNavigationType()
            ),
            goToPageTitle: typedItem.getGoToPage().getTitle(),
          }
        }else{
          return {
            pageNavigationType: getPageNavigationTypeString(
              typedItem.getPageNavigationType()
            ),
          };
        }
      });

    case FormApp.ItemType.SECTION_HEADER:
      return createItemObject(item);

    default:
      throw new Error("InvalidItem:" + item.getType());
  }
}
