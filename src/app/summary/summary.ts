import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
const reviewRateMin = 0;
const reviewRateMax = 10;

export function createResultSheetContent(resultSheet: Sheet, headerColumnsData: Array<Array<string|number>>, headerRowData: Array<string|number>, numMembers: number){
    const startRow = 1;
    const startColumn = 1;
    const numHeaderRows = 1;
    const numHeaderColumns = 3;
    const reviewRateRange = reviewRateMax - reviewRateMin + 1;

    resultSheet.insertRows(numMembers + numHeaderRows);
    resultSheet.getRange(startRow + numHeaderRows, startColumn, numMembers, numHeaderColumns).setValues(headerColumnsData);
    resultSheet.getRange(startRow, startColumn + numHeaderColumns, numHeaderRows, numMembers).setValues([headerRowData]);

    const scoreRange = [];
    for(let i = reviewRateMin; i <= reviewRateMax; i++){
      scoreRange.push((i).toString());
    }
    resultSheet.getRange(startRow, startColumn + numHeaderColumns + numMembers, numHeaderRows, reviewRateRange).setValues([scoreRange]).setBackgroundRGB(255, 240, 240);
    resultSheet.getRange(startRow, startColumn + numHeaderColumns + numMembers + reviewRateRange, 1, 1).setValues([['平均点']]).setBackgroundRGB(240, 240, 255);
    resultSheet.getRange(startRow, startColumn + numHeaderColumns + numMembers + reviewRateRange + 1, 1, 1).setValues([['順位']]).setBackgroundRGB(240,255,255);

    resultSheet.setFrozenColumns(numHeaderColumns);
    resultSheet.setFrozenRows(numHeaderRows);

    const formulas = [];
    const headerStartColumn = 2;
    const numColumnsParMember = 7;
    const indexOfColumnParMember = 5;

    const srcRange = `INDIRECT("src!"&ADDRESS(2,2)&":"&ADDRESS(${(headerStartColumn + numMembers)},${(headerStartColumn + (numMembers * numColumnsParMember) )}))`;

    for(let y=0; y < numMembers; y++){
      var row = [];
      var p2 = ''+(2+y);
      for(var x=0; x < numMembers; x++){
        row.push(`=IFERROR(VLOOKUP(LEFT(INDIRECT(ADDRESS(1,${(startColumn+numHeaderColumns+x)})), FIND(" ", INDIRECT(ADDRESS(1,${(startColumn+numHeaderColumns+x)})))-1), ${srcRange}, (ROW($A${p2})-2)*${numColumnsParMember}+${indexOfColumnParMember+2}, false))`);
      }
      for(let g = 0; g < reviewRateRange ; g++){
        const countIfRange = `INDIRECT(ADDRESS(${p2},${startColumn+numHeaderColumns})&":"&ADDRESS(${p2},${(startColumn+numHeaderColumns+numMembers-1)}))`;
        const value = `INDIRECT(ADDRESS(1, ${(startColumn+numHeaderColumns + numMembers + g )}))`;
        row.push(`=COUNTIF(${countIfRange},${value})`);
      }

      row.push(`=IFERROR(AVERAGEIF(INDIRECT(ADDRESS(${p2},${startColumn+numHeaderColumns})&":"&ADDRESS(${p2},${(startColumn+numHeaderColumns+numMembers)})),">0"),0)`);
      row.push(`=IFERROR(RANK(INDIRECT(ADDRESS(${p2},${(startColumn+numHeaderColumns+numMembers+reviewRateRange)})), INDIRECT(ADDRESS(2,${(startColumn+numHeaderColumns+numMembers+reviewRateRange)})&":"&ADDRESS(${(1+numMembers)},${(startColumn+numHeaderColumns+numMembers+reviewRateRange)}))))`);

      formulas.push(row);
    }

    resultSheet.getRange(startRow + numHeaderRows, startColumn + numHeaderColumns, numMembers, numMembers + reviewRateRange + 2).setFormulas(formulas);
}
// execute(parseMemberRow, createFormSection, createResultSheetContent);

/*
function execute(parseMemberRow: (row: string[])=>string[], createFormSection: (form: Form, member: ), createResultSheetContent){
  const spreadsheet = SpreadsheetApp.getActive();
  const form = (spreadsheet.getFormUrl() && FormApp.openByUrl(spreadsheet.getFormUrl())) || createReviewForm(FORM_NAME_PREFIX+getYYYYMMDD());
  const headerColumnsData = [];
  const headerRowData = [];

  const memberSheet = spreadsheet.getSheetByName(SHEET_NAME.MEMBER);

  const numMembers = evalMemberRows(memberSheet, function(row, index){
    const member = parseMemberRow(row);
    if(createFormSection){
      createFormSection(form, member, index);
    }
    headerColumnsData.push(["", member.email, member.studentName]);
    headerRowData.push(member.email+" "+member.studentName);
  });

  try{
    form.removeDestination();
  }catch(ignore){}
  try{
    spreadsheet.deleteSheet(spreadsheet.getSheetByName(SHEET_NAME.RESULT));
  }catch(ignore){}
  try{
    spreadsheet.deleteSheet(spreadsheet.getSheetByName(SHEET_NAME.SRC));
  }catch(ignore){}
  if(createResultSheetContent){
    const resultSheet = spreadsheet.insertSheet(SHEET_NAME.RESULT);
    createResultSheetContent(resultSheet, headerColumnsData, headerRowData, numMembers);
  }
  try{
    renameFormDestinationSheet(spreadsheet, SHEET_NAME.RESPONSE_PREFIX, SHEET_NAME.SRC);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  }catch(ignore){}
}


function createReviewForm(formName: string){
  const form = FormApp.create(formName);
  form.setRequireLogin(true);
  form.setCollectEmail(true);
  form.setAllowResponseEdits(true);
  form.setLimitOneResponsePerUser(true);
  return form;
}

function getYYYYMMDD(){
  const now = new Date();
  const date = now.getFullYear() + '/' + ('00'+(now.getMonth()+1)).slice(-2) + '/'  + ('00'+now.getDate()).slice(-2);
  return date;
}

function renameFormDestinationSheet(spreadsheet: Spreadsheet, prefix: string, newName: string){
  spreadsheet.getSheets().map(function(sheet){
    if(0 <= sheet.getName().indexOf(prefix)){
      sheet.setName(newName);
      return;
    }
  });
}

function evalMemberRows(sheet: Sheet, callback: (row: Array<any>, index: number)){
  let numMembers = 0;
  const startRow = 2; // skip 1st row to ignore header
  const startColumn = 1;
  const range = sheet.getRange(startRow, startColumn, sheet.getMaxRows(), sheet.getMaxColumns());
  const rows = range.getDisplayValues();
  rows.filter(function(row){return 0 < row.length && 0 < row[0].length}).sort(function(row1, row2){return (row1[0]<row2[0])?-1:((row1[0]>row2[0])?1:0)}).map(function(row, index){
    numMembers = Math.max(numMembers, index + 1);
    callback(row, index);
  });
  return numMembers;
}*/

