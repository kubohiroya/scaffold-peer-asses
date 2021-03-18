import {
  CheckboxGridItemObject,
  FormObject,
  GridItemObject,
  ItemObject,
  SurveyJsMatrixItemObject,
} from "./types";
import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import {ReviewUser} from '../reviewConfig/ReviewUser';

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

export const traverseFormSrc = (formSrc: FormObject, callback:(type: string, key1: string, key2?: string)=>void) => {
  formSrc.items.forEach((element: { type: string }) => {
    if (element.type === "surveyJs:matrix") {
      const matrix = ((element as unknown) as SurveyJsMatrixItemObject);
      matrix.rows.forEach((row) => {
        callback(matrix.type, matrix.name, row.value);
      });
    } else if (element.type === "grid") {
      const item = (element as unknown) as GridItemObject;
      item.rows.forEach((row) => {
        callback(item.type, item.title, row);
      });
    } else if (element.type === "checkboxGrid") {
      const item = (element as unknown) as CheckboxGridItemObject;
      item.rows.forEach((row) => {
        callback(item.type, item.title, row);
      });
    } else {
      const item = (element as unknown) as ItemObject;
      callback(item.type, item.title)
    }
  });
};

export const getRubricScores = (formSrc: FormObject, data: Array<string|number>): {rowScores: Array<number>, total: number} => {
  const rowScores = new Array<number>();
  let total = 0;
  formSrc.items.forEach((element: { type: string }) => {
    if (element.type === "surveyJs:matrix") {
      const matrix = ((element as unknown) as SurveyJsMatrixItemObject);
      matrix.rows.forEach((row: { text: string, value: string }) => {
        matrix.columns.forEach((column: string) => {
          if (data[rowScores.length] === matrix.cells[row.value][column]) {
            const score = matrix.points[row.value][column];
            rowScores.push(score);
            total += score;
          }
        });
      });
    }
  });
  return {rowScores, total};
};

function createSummarySheet(formSrc: FormObject, reviewers: Array<ReviewUser>, reviewees: Array<ReviewUser>, resultSheet: Sheet, summarySheet: Sheet){
  const scoreTotal = 10; // FIXME
  const scoreArray = [...Array(scoreTotal+1)].map((_, i) => i);

  const reviewerSerialNumArray = reviewers.map(r=>r.index+1);
  const reviewerEmailAddressArray = reviewers.map(r=>r.emailAddress);
  const reviewerFullNameArray = reviewers.map(r=>r.fullName);
  const reviewerPhotoUrlArray = reviewers.map(r=>r.photoUrl);
  const reviewerHashDigestArray = reviewers.map(r=>r.hashDigest);

  const values = new Array<Array<string|number>>();
  values.push(["評価者通し番号", "評価者メールアドレス","評価者氏名","評価者写真URL","評価者ハッシュ値", ...reviewerSerialNumArray, ...scoreArray, "平均", "順位"]);
  [reviewerEmailAddressArray, reviewerFullNameArray, reviewerPhotoUrlArray, reviewerHashDigestArray].forEach((reviewerArray)=>{
    values.push([...Array(5).fill(""), ...reviewerArray, ...Array(scoreTotal + 1).fill(""), ...Array(2).fill("")]);
  });
  reviewees.forEach(reviewee=>{
    const revieweeMetadata = [reviewee.index+1, reviewee.emailAddress, reviewee.fullName, reviewee.photoUrl, reviewee.hashDigest];
    // const body = new Array<string|number>();
    const body = reviewers.map(reviewer=>{});
    const countTotalCells = scoreArray.map(score=>{return 0});
    const countTotalCells = [];
    const averageCell = 999;
    const orderCell = 0;
    values.push([...revieweeMetadata, ...body, ...countTotalCells, averageCell, orderCell]);
  });

  summarySheet.clear();
  summarySheet.getRange(1,1, values.length, values[0].length).setValues(values);

}
