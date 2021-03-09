/// <reference types="@types/google-apps-script" />
import { FormObject } from "./types";
import Form = GoogleAppsScript.Forms.Form;
export declare function jsonToForm(json: FormObject, form: Form | null): Form;
