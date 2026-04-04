import * as XLSX from 'xlsx';

/**
 * Export an array of plain objects to an .xlsx file and trigger browser download.
 * @param data  Array of row objects (keys become column headers)
 * @param filename  File name without extension
 */
export function exportToExcel(data: Record<string, any>[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  // Auto-fit column widths
  const cols = Object.keys(data[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? '').length)) + 2,
  }));
  worksheet['!cols'] = cols;

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
