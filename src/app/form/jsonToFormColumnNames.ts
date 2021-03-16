import {
  CheckboxGridItemObject,
  FormObject,
  GridItemObject,
  ItemObject,
  SurveyJsMatrixItemObject,
} from "./types";

export const jsonToFormColumnNames = (formSrc: FormObject) => {
  const columnNames = new Array<string>();
  formSrc.items.forEach((element: { type: string }) => {
    if (element.type === "surveyJs:matrix") {
      ((element as unknown) as SurveyJsMatrixItemObject).rows.forEach((row) => {
        columnNames.push(row.value);
      });
    } else if (element.type === "grid") {
      const item = (element as unknown) as GridItemObject;
      item.rows.forEach((row) => {
        columnNames.push(`${item.title} [${row}]`);
      });
    } else if (element.type === "checkboxGrid") {
      const item = (element as unknown) as CheckboxGridItemObject;
      item.rows.forEach((row) => {
        columnNames.push(`${item.title} [${row}]`);
      });
    } else {
      const item = (element as unknown) as ItemObject;
      columnNames.push(item.title);
    }
  });
  // Logger.log(JSON.stringify(formSrc, null, " "));
  // Logger.log(columnNames.join("\n"));
  return columnNames;
};
