/// <reference types="@types/google-apps-script" />
import Item = GoogleAppsScript.Forms.Item;
import QuizFeedback = GoogleAppsScript.Forms.QuizFeedback;
import MultipleChoiceItem = GoogleAppsScript.Forms.MultipleChoiceItem;
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
    items: Array<QItemObjects | GeneralFeedbackObject | CorrectnessFeedbackObject | OtherItemObjects>;
}
export declare const TYPES: {
    checkbox: GoogleAppsScript.Forms.ItemType;
    checkboxGrid: GoogleAppsScript.Forms.ItemType;
    date: GoogleAppsScript.Forms.ItemType;
    dateTime: GoogleAppsScript.Forms.ItemType;
    duration: GoogleAppsScript.Forms.ItemType;
    grid: GoogleAppsScript.Forms.ItemType;
    image: GoogleAppsScript.Forms.ItemType;
    list: GoogleAppsScript.Forms.ItemType;
    multipleChoice: GoogleAppsScript.Forms.ItemType;
    pageBreak: GoogleAppsScript.Forms.ItemType;
    paragraphText: GoogleAppsScript.Forms.ItemType;
    scale: GoogleAppsScript.Forms.ItemType;
    sectionHeader: GoogleAppsScript.Forms.ItemType;
    text: GoogleAppsScript.Forms.ItemType;
    time: GoogleAppsScript.Forms.ItemType;
};
export declare const TYPE_NAMES: {
    [x: number]: string;
};
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
export interface CheckboxGridItemObject extends GridItemObject {
}
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
export interface PageBreakItemObject extends ItemObject, PageNavigation {
}
export interface CheckboxItemObject extends QItemObject, CorrectnessFeedbackObject, HasChoices, HasOtherOption {
}
export interface IncludesYearObject extends QItemObject {
    includesYear: boolean;
}
export interface DateItemObject extends IncludesYearObject, GeneralFeedbackObject {
}
export interface DateTimeItemObject extends DateItemObject, GeneralFeedbackObject {
}
export interface DurationItemObject extends QItemObject, GeneralFeedbackObject {
}
export interface GridItemObject extends QItemObject {
    rows: string[];
    columns: string[];
}
export interface ImageItemObject extends ItemObject {
    url: string;
    alignment: string;
    width: number;
}
export interface ListItemObject extends QItemObject, HasChoices, CorrectnessFeedbackObject {
}
export interface MultipleChoiceItemObject extends QItemObject, CorrectnessFeedbackObject, HasChoices, HasOtherOption {
}
export interface ParagraphTextItemObject extends QItemObject, GeneralFeedbackObject {
}
export interface ScaleItemObject extends QItemObject, GeneralFeedbackObject {
    leftLabel: string;
    lowerBound: number;
    rightLabel: string;
    upperBound: number;
}
export interface SectionHeaderItemObject extends ItemObject {
}
export interface TextItemObject extends QItemObject, GeneralFeedbackObject {
}
export interface TimeItemObject extends QItemObject, GeneralFeedbackObject {
}
export interface VideoItemObject extends ItemObject {
    videoUrl: string;
    alignment: string;
    width: number;
}
export declare type OtherItemObjects = ImageItemObject | VideoItemObject | PageBreakItemObject | SectionHeaderItemObject;
export declare type QItemObjects = TextItemObject | ParagraphTextItemObject | CheckboxItemObject | MultipleChoiceItemObject | DateItemObject | DateTimeItemObject | DurationItemObject | TimeItemObject | GridItemObject | CheckboxGridItemObject | ListItemObject | ScaleItemObject;
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
export declare function getAlignment(value: string): GoogleAppsScript.Forms.Alignment;
