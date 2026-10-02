// Turns prepared rows into the .xlsx file. Kept apart from the route so the
// route only deals with the request, the query and the audit entry.

import * as XLSX from "xlsx";

export type ExportSheet = {
  name: string;
  headers: string[];
  rows: (string | number)[][];
};

const maxColumnWidth = 40;
const columnPadding = 2;

function widthFor(sheet: ExportSheet, column: number): number {
  const longestValue = sheet.rows.reduce((longest, row) => {
    const length = String(row[column] ?? "").length;
    return length > longest ? length : longest;
  }, 0);

  const widest = Math.max(sheet.headers[column].length, longestValue);
  return Math.min(widest + columnPadding, maxColumnWidth);
}

export function buildWorkbook(sheets: ExportSheet[]): ArrayBuffer {
  const book = XLSX.utils.book_new();

  // RTL is a workbook view setting, not a sheet one: setting it per sheet is
  // silently dropped when the file is written.
  book.Workbook = { Views: [{ RTL: true }] };

  for (const sheet of sheets) {
    const worksheet = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);

    worksheet["!cols"] = sheet.headers.map((_, column) => ({
      wch: widthFor(sheet, column),
    }));

    XLSX.utils.book_append_sheet(book, worksheet, sheet.name);
  }

  // "array" gives an ArrayBuffer, which a Response body accepts directly.
  return XLSX.write(book, { type: "array", bookType: "xlsx" });
}
