const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();

export function formatDateTime(datetime: string | undefined): string {
  if (datetime) {
    return Utilities.formatDate(
      new Date(datetime),
      timezone,
      "yyyy/MM/dd HH:mm:ss"
    );
  } else {
    return "(invalid date)";
  }
}
