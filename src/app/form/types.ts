/*
import Item = GoogleAppsScript.Forms.Item;
import QuizFeedback = GoogleAppsScript.Forms.QuizFeedback;
import MultipleChoiceItem = GoogleAppsScript.Forms.MultipleChoiceItem;
import Alignment = GoogleAppsScript.Forms.Alignment;
*/

import Item = GoogleAppsScript.Forms.Item;
import QuizFeedback = GoogleAppsScript.Forms.QuizFeedback;
import MultipleChoiceItem = GoogleAppsScript.Forms.MultipleChoiceItem;
// import Alignment = GoogleAppsScript.Forms.Alignment;

export interface FormMetadataObject {
  quiz?: boolean;
  allowResponseEdits?: boolean;
  collectEmail?: boolean;
  description: string;
  acceptingResponses?: boolean;
  publishingSummary?: boolean;
  confirmationMessage?: string;
  customClosedFormMessage?: string;
  limitOneResponsePerUser?: boolean;
  progressBar?: boolean;
  editUrl: string;
  editors: string[];
  id: string;
  publishedUrl: string;
  shuffleQuestions?: boolean;
  summaryUrl?: string;
  title: string;
  requiresLogin?: boolean;
  linkToRespondAgain?: boolean;
  destinationId?: string;
  destinationType?: string;
}

export interface FormObject {
  metadata: FormMetadataObject;
  items: Array<
    | QItemObjects
    | GeneralFeedbackObject
    | CorrectnessFeedbackObject
    | OtherItemObjects
  >;
}

export const TYPES = {
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

export const TYPE_NAMES = {
  [FormApp.ItemType.CHECKBOX]: "checkbox",
  [FormApp.ItemType.CHECKBOX_GRID]: "checkboxGrid",
  [FormApp.ItemType.DATE]: "date",
  [FormApp.ItemType.DATETIME]: "dateTime",
  [FormApp.ItemType.DURATION]: "duration",
  [FormApp.ItemType.GRID]: "grid",
  [FormApp.ItemType.IMAGE]: "image",
  [FormApp.ItemType.LIST]: "list",
  [FormApp.ItemType.MULTIPLE_CHOICE]: "multipleChoice",
  [FormApp.ItemType.PAGE_BREAK]: "pageBreak",
  [FormApp.ItemType.PARAGRAPH_TEXT]: "paragraphText",
  [FormApp.ItemType.SCALE]: "scale",
  [FormApp.ItemType.SECTION_HEADER]: "sectionHeader",
  [FormApp.ItemType.TEXT]: "text",
  [FormApp.ItemType.TIME]: "time",
};
/*
export const ALIGNMENTS = new Map<string, Alignment>([
  ["LEFT", Alignment.LEFT],
  ["CENTER", Alignment.CENTER],
  ["RIGHT", Alignment.RIGHT],
]);
*/
export interface BlobObject {
  name: string;
  contentType: string;
  dataAsString: string;
}

export interface QuizFeedbackObject {
  type: string;
  text: string;
  linkUrls: string[];
}

export interface GeneralFeedbackObject extends QuizFeedbackObject {
  points: number;
  generalFeedback: QuizFeedbackObject;
}

export interface CorrectnessFeedbackObject extends QuizFeedbackObject {
  points: number;
  feedbackForCorrect?: QuizFeedbackObject;
  feedbackForIncorrect?: QuizFeedbackObject;
}

export interface ItemObject {
  type: string;
  id: number;
  index: number;
  title: string;
  helpText: string;
}

export interface QItemObject extends ItemObject {
  isRequired: boolean;
}

export interface CheckboxGridItemObject extends GridItemObject {}

export interface HasChoices {
  choices: ChoiceObject[];
}

export interface HasOtherOption {
  hasOtherOption: boolean;
}

export interface PageNavigation {
  gotoPageTitle?: string;
  pageNavigationType?: string;
}

export interface ChoiceObject extends PageNavigation {
  value: string;
  isCorrectAnswer?: boolean;
}

export interface PageBreakItemObject extends ItemObject, PageNavigation {}

export interface CheckboxItemObject
  extends QItemObject,
    CorrectnessFeedbackObject,
    HasChoices,
    HasOtherOption {}

export interface IncludesYearObject extends QItemObject {
  includesYear: boolean;
}
export interface DateItemObject
  extends IncludesYearObject,
    GeneralFeedbackObject {}
export interface DateTimeItemObject
  extends DateItemObject,
    GeneralFeedbackObject {}
export interface DurationItemObject
  extends QItemObject,
    GeneralFeedbackObject {}

export interface GridItemObject extends QItemObject {
  rows: string[];
  columns: string[];
}

export interface ImageItemObject extends ItemObject {
  // image?: BlobObject;
  url: string;
  alignment: string;
  width: number;
}

export interface ListItemObject
  extends QItemObject,
    HasChoices,
    CorrectnessFeedbackObject {}

export interface MultipleChoiceItemObject
  extends QItemObject,
    CorrectnessFeedbackObject,
    HasChoices,
    HasOtherOption {}

export interface ParagraphTextItemObject
  extends QItemObject,
    GeneralFeedbackObject {}

export interface ScaleItemObject extends QItemObject, GeneralFeedbackObject {
  leftLabel: string;
  lowerBound: number;
  rightLabel: string;
  upperBound: number;
}

export interface SectionHeaderItemObject extends ItemObject {}

export interface TextItemObject extends QItemObject, GeneralFeedbackObject {}

export interface TimeItemObject extends QItemObject, GeneralFeedbackObject {}

export interface VideoItemObject extends ItemObject {
  videoUrl: string;
  alignment: string;
  width: number;
}

export type OtherItemObjects =
  | ImageItemObject
  | VideoItemObject
  | PageBreakItemObject
  | SectionHeaderItemObject;

export type QItemObjects =
  | TextItemObject
  | ParagraphTextItemObject
  | CheckboxItemObject
  | MultipleChoiceItemObject
  | DateItemObject
  | DateTimeItemObject
  | DurationItemObject
  | TimeItemObject
  | GridItemObject
  | CheckboxGridItemObject
  | ListItemObject
  | ScaleItemObject;

export interface QItem extends Item {
  isRequired(): boolean;
  setRequired(value: boolean): void;
}

export interface ShowOtherOptionItem extends Item {
  showOtherOption(enabled: boolean): void;
}

export interface CorrectnessFeedbackItem extends Item {
  setPoints(points: number): void;
  setFeedbackForCorrect(feedback: QuizFeedback): void;
  setFeedbackForIncorrect(feedback: QuizFeedback): void;
}

export interface IncludesYearItem extends Item {
  includesYear(): boolean;
  setIncludesYear(enableYear: boolean): void;
}

export interface AddMultipleChoiceItem extends Item {
  addMultipleChoiceItem(): MultipleChoiceItem;
}

export function getAlignment(value: string){
  return value === "LEFT" ? FormApp.Alignment.LEFT : value === "CENTER"? FormApp.Alignment.CENTER : value === "RIGHT" ? FormApp.Alignment.RIGHT : FormApp.Alignment.RIGHT
}
