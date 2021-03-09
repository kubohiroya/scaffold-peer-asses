/// <reference types="@types/google-apps-script" />
import Form = GoogleAppsScript.Forms.Form;
import { FormObject } from "./types";
export default function formToJson(form: Form): FormObject;
