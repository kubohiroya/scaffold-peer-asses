import {
  CheckboxItemObject,
  ChoiceObject,
  CorrectnessFeedbackObject,
  CorrectnessFeedbackItem,
  FormObject,
  HasOtherOption,
  ShowOtherOptionItem,
  IncludesYearItem,
  IncludesYearObject,
  PageBreakItemObject,
  QItem,
  QItemObject,
  MultipleChoiceItemObject,
  GridItemObject,
  ListItemObject,
  CheckboxGridItemObject,
  DateItemObject,
  DateTimeItemObject,
  TextItemObject,
  TimeItemObject,
  ParagraphTextItemObject,
  DurationItemObject,
  SectionHeaderItemObject,
  VideoItemObject,
  ImageItemObject,
  ScaleItemObject,
  // ALIGNMENTS,
  ItemObject, getAlignment,
} from "./types";
import PageBreakItem = GoogleAppsScript.Forms.PageBreakItem;
import MultipleChoiceItem = GoogleAppsScript.Forms.MultipleChoiceItem;
// import PageNavigationType = GoogleAppsScript.Forms.PageNavigationType;
import CheckboxItem = GoogleAppsScript.Forms.CheckboxItem;
import GridItem = GoogleAppsScript.Forms.GridItem;
import CheckboxGridItem = GoogleAppsScript.Forms.CheckboxGridItem;
import ListItem = GoogleAppsScript.Forms.ListItem;
import Form = GoogleAppsScript.Forms.Form;
// import DestinationType = GoogleAppsScript.Forms.DestinationType;
import Item = GoogleAppsScript.Forms.Item;

interface ItemHandlers {
  multipleChoice: (itemObject: MultipleChoiceItemObject, form: Form) => void;
  checkbox: (itemObject: CheckboxItemObject, form: Form) => void;
  list: (itemObject: ListItemObject, form: Form) => void;
  checkboxGrid: (itemObject: CheckboxGridItemObject, form: Form) => void;
  grid: (itemObject: GridItemObject, form: Form) => void;
  // item: (itemObject: ItemObject, form: Form) => void;
  date: (itemObject: DateItemObject, form: Form) => void;
  datetime: (itemObject: DateTimeItemObject, form: Form) => void;
  text: (itemObject: TextItemObject, form: Form) => void;
  time: (itemObject: TimeItemObject, form: Form) => void;
  paragraphText: (itemObject: ParagraphTextItemObject, form: Form) => void;
  duration: (itemObject: DurationItemObject, form: Form) => void;
  sectionHeader: (itemObject: SectionHeaderItemObject, form: Form) => void;
  video: (itemObject: VideoItemObject, form: Form) => void;
  image: (itemObject: ImageItemObject, form: Form) => void;
  scale: (itemObject: ScaleItemObject, form: Form) => void;
  pageBreak: (itemObject: PageBreakItemObject, form: Form) => void;
  // feedback: (itemObject: FeedbackItemObject, form: Form) => void;
}

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
function booleanValue(value: any) {
  if (typeof value === "boolean") {
    return value;
  } else if (typeof value === "string") {
    return !(value.toLowerCase() === "false" || value === "0" || value === "");
  } else if (typeof value === "number") {
    return 0 < value;
  }
  return false;
}

function callWithBooleanValue(value: any, callback: Function) {
  const b = booleanValue(value);
  if (b) {
    callback(b);
  }
}

function callWithIntegerValue(value: any, callback: Function) {
  const intValue = parseInt(value, 10);
  if (!isNaN(intValue)) {
    callback(intValue);
  }
}

function isNotNullValue(value: any) {
  return value !== undefined && value !== null && value !== "";
}

function callWithNotNullValue(value: any, callback: Function) {
  if (isNotNullValue(value)) {
    callback(value);
  }
}

export function jsonToForm(json: FormObject, form: Form | null): Form {
  if (form === null) {
    if (json.metadata.id) {
      const form = FormApp.openById(json.metadata.id);
      if (form) {
        const numItems = form.getItems().length;
        for (let index = numItems - 1; 0 <= index; index--) {
          form.deleteItem(index);
        }
        form.getEditors().forEach((editor) => {
          form?.removeEditor(editor);
        });
      }
    } else {
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
  if (
    json.metadata.destinationType == FormApp.DestinationType.SPREADSHEET.toString() &&
    json.metadata.destinationId
  ) {
    form.setDestination(
      FormApp.DestinationType.SPREADSHEET,
      json.metadata.destinationId
    );
  }

  const pageBreakItems = new Map<string, PageBreakItem>();
  json.items
    .filter((item) => item.type === "pageBreakItem")
    .forEach((item) => {
      const pageBreakItemObject = item as PageBreakItemObject;
      if (!form) {
        throw new Error("invalid form title");
      }
      const title = pageBreakItemObject.title;
      const pageBreakItem = form.addPageBreakItem().setTitle(title);
      pageBreakItems.set(title, pageBreakItem);
      return pageBreakItem;
    });

  function createFeedback(value: string, displayText?: string) {
    const feedbackBuilder = FormApp.createFeedback();
    if (0 === value.indexOf("http")) {
      const url = value;
      if (displayText) {
        feedbackBuilder.addLink(url, displayText);
      } else {
        feedbackBuilder.addLink(url);
      }
    } else {
      feedbackBuilder.setText(value);
    }
    return feedbackBuilder.build();
  }

  const itemModifiers = {
    itemProperties: function (itemObject: ItemObject, item: Item) {
      callWithNotNullValue(itemObject.title, function (value: string) {
        item.setTitle(value);
      });
      callWithNotNullValue(itemObject.helpText, function (value: string) {
        item.setHelpText(value);
      });
    },
    questionProperties: (itemObject: QItemObject, item: QItem) => {
      callWithBooleanValue(item.isRequired, function (value: boolean) {
        item.setRequired(value);
      });
    },
    choices: function (
      choiceObjectList: ChoiceObject[],
      item: MultipleChoiceItem | CheckboxItem | ListItem
    ) {
      const choiceObjects = choiceObjectList.map(function (
        choiceObject: ChoiceObject
      ) {
        if (!form) {
          throw new Error("invalid form title");
        }
        if (!choiceObject.gotoPageTitle) {
          throw new Error("invalid value of gotoPageTitle");
        }

        const goToPage = pageBreakItems.get(choiceObject.gotoPageTitle);
        const pageNavigationType =
          choiceObject.pageNavigationType === "CONTINUE"
            ? FormApp.PageNavigationType.CONTINUE
            : choiceObject.pageNavigationType === "GO_TO_PAGE"
            ? FormApp.PageNavigationType.GO_TO_PAGE
            : choiceObject.pageNavigationType === "RESTART"
            ? FormApp.PageNavigationType.RESTART
            : FormApp.PageNavigationType.SUBMIT;

        if (!goToPage && !choiceObject.isCorrectAnswer) {
          return item.createChoice(choiceObject.value);
        } else if (!goToPage && choiceObject.isCorrectAnswer) {
          return item.createChoice(
            choiceObject.value,
            choiceObject.isCorrectAnswer
          );
        } else if (goToPage) {
          return item.createChoice(choiceObject.value, pageNavigationType);
        }
        throw new Error("invalid choiceObject:" + choiceObject);
      });
      item.setChoices(choiceObjects);
    },

    showOtherOption: function (
      itemObject: HasOtherOption,
      item: ShowOtherOptionItem
    ) {
      callWithBooleanValue(
        itemObject.hasOtherOption,
        function (value: boolean) {
          item.showOtherOption(value);
        }
      );
    },
    quizProperties: function (
      itemObject: CorrectnessFeedbackObject,
      item: CorrectnessFeedbackItem
    ) {
      callWithIntegerValue(itemObject.points, function (value: any) {
        item.setPoints(value);
      });
      callWithNotNullValue(
        itemObject.feedbackForCorrect,
        function (value: any) {
          item.setFeedbackForCorrect(createFeedback(value));
        }
      );
      callWithNotNullValue(
        itemObject.feedbackForIncorrect,
        function (value: any) {
          item.setFeedbackForIncorrect(createFeedback(value));
        }
      );
    },
    includesYear: function (
      itemObject: IncludesYearObject,
      item: IncludesYearItem
    ) {
      callWithBooleanValue(itemObject.includesYear, function (value: any) {
        item.setIncludesYear(value);
      });
    },
  };

  function multipleChoiceHandler(
    itemObject: MultipleChoiceItemObject,
    form: Form
  ) {
    const item = form.addMultipleChoiceItem();
    itemModifiers.choices(itemObject.choices, item);
    itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
    itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    itemModifiers.showOtherOption(
      itemObject,
      (item as unknown) as ShowOtherOptionItem
    );
    if (form.isQuiz()) {
      itemModifiers.quizProperties(
        itemObject,
        (item as unknown) as CorrectnessFeedbackItem
      );
    }
  }

  function gridHandler(
    itemObject: GridItemObject | CheckboxGridItemObject,
    item: GridItem | CheckboxGridItem
  ) {
    item.setRows(itemObject.rows).setColumns(itemObject.columns);
    itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
    itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
  }

  const itemHandlers: ItemHandlers = {
    multipleChoice: multipleChoiceHandler,

    checkbox: function (itemObject: CheckboxItemObject, form: Form) {
      const item = form.addCheckboxItem();
      itemModifiers.choices(itemObject.choices, item);
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
      itemModifiers.showOtherOption(
        itemObject,
        (item as unknown) as ShowOtherOptionItem
      );
      if (form.isQuiz()) {
        itemModifiers.quizProperties(
          itemObject,
          (item as unknown) as CorrectnessFeedbackItem
        );
      }
    },

    list: function (itemObject: ListItemObject, form: Form) {
      const item = form.addListItem();
      itemModifiers.choices(itemObject.choices, item);
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    },

    checkboxGrid: function (itemObject: CheckboxGridItemObject, form: Form) {
      const item = form.addCheckboxGridItem();
      gridHandler(itemObject, item);
    },

    grid: function (itemObject: GridItemObject, form: Form) {
      const item = form.addGridItem();
      gridHandler(itemObject, item);
    },

    time: function (itemObject: TimeItemObject, form: Form) {
      const item = form.addTimeItem();
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    },

    date: function (itemObject: DateItemObject, form: Form) {
      const item = form.addDateItem();
      itemModifiers.includesYear(
        itemObject,
        (item as unknown) as IncludesYearItem
      );
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    },

    datetime: function (itemObject: DateTimeItemObject, form: Form) {
      const item = form.addDateTimeItem();
      itemModifiers.includesYear(
        itemObject,
        (item as unknown) as IncludesYearItem
      );
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    },

    text: function (itemObject: TextItemObject, form: Form) {
      const item = form.addTextItem();
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    },

    paragraphText: function (itemObject: ParagraphTextItemObject, form: Form) {
      const item = form.addParagraphTextItem();
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    },

    duration: function (itemObject: DurationItemObject, form: Form) {
      const item = form.addDurationItem();
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    },

    scale: function (itemObject: ScaleItemObject, form: Form) {
      const item = form.addScaleItem();
      callWithNotNullValue(itemObject.leftLabel, function (left: string) {
        callWithNotNullValue(itemObject.rightLabel, function (right: string) {
          item.setLabels(left, right);
        });
      });
      callWithIntegerValue(itemObject.lowerBound, function (lower: number) {
        callWithIntegerValue(itemObject.upperBound, function (upper: number) {
          item.setBounds(lower, upper);
        });
      });
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
      itemModifiers.questionProperties(itemObject, (item as unknown) as QItem);
    },

    sectionHeader: function (itemObject: SectionHeaderItemObject, form: Form) {
      const item = form.addSectionHeaderItem();
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
    },

    video: function (itemObject: VideoItemObject, form: Form) {
      const item = form.addVideoItem();
      const videoUrl = itemObject.videoUrl;
      item.setVideoUrl(videoUrl);
      callWithIntegerValue(itemObject.width, function (value: number) {
        item.setWidth(value);
      });
      callWithNotNullValue(itemObject.alignment, function (value: string) {
        const alignment = getAlignment(value);
        if (alignment) {
          item.setAlignment(alignment);
        }
      });
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
    },

    image: function (itemObject: ImageItemObject, form: Form) {
      const item = form.addImageItem();
      const image = UrlFetchApp.fetch(itemObject.url);
      item.setImage(image);
      callWithIntegerValue(itemObject.width, function (value: any) {
        item.setWidth(value);
      });
      callWithNotNullValue(itemObject.alignment, function (value: any) {
        const alignment = getAlignment(value);
        if (alignment) {
          item.setAlignment(alignment);
        }
      });
      itemModifiers.itemProperties(itemObject, (item as unknown) as Item);
    },

    pageBreak: function (itemObject: PageBreakItemObject, form: Form) {
      const title = itemObject.title;
      let pageNavigationType = itemObject.pageNavigationType;

      const pageBreakItem = pageBreakItems.get(title);
      if (!pageBreakItem) {
        return;
      }
      const lastItemIndex = form.getItems().length - 1;
      form.moveItem(pageBreakItem.getIndex(), lastItemIndex);

      if (pageNavigationType === "CONTINUE") {
        pageBreakItem.setGoToPage(FormApp.PageNavigationType.CONTINUE);
      } else if (pageNavigationType === "RESTART") {
        pageBreakItem.setGoToPage(FormApp.PageNavigationType.RESTART);
      } else if (pageNavigationType === "SUBMIT") {
        pageBreakItem.setGoToPage(FormApp.PageNavigationType.SUBMIT);
      } else if (itemObject.gotoPageTitle) {
        const gotoPage = pageBreakItems.get(itemObject.gotoPageTitle);
        if (gotoPage) {
          pageBreakItem.setGoToPage(gotoPage);
        }
      }
      itemModifiers.itemProperties(
        itemObject,
        (pageBreakItem as unknown) as Item
      );
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

  json.items.forEach((itemObject) => {
    (itemHandlers as any)[itemObject.type](itemObject, form);
  });

  return form;
}
