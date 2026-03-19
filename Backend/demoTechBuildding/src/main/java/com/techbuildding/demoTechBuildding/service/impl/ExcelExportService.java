package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.response.attendance.AttendanceResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for exporting attendance data to Excel (.xlsx) format.
 *
 * Report structure:
 * - Title row with project and date range info
 * - Header columns: No, Employee, Date, Check-in, Check-out, Hours, Status
 * - Data rows with styling (alternating colors)
 * - Summary row: total employees, total hours
 */
@Slf4j
@Service
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Export attendance logs to Excel bytes.
     *
     * @param logs        list of attendance records
     * @param projectName name of the project
     * @param startDate   report start date
     * @param endDate     report end date
     * @return byte array of the .xlsx file
     */
    public byte[] exportAttendanceToExcel(List<AttendanceResponseDTO> logs,
            String projectName,
            LocalDate startDate,
            LocalDate endDate) {
        log.info("Exporting {} attendance records to Excel with Vietnamese support", logs.size());

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Bao cao cham cong");

            // Column widths
            sheet.setColumnWidth(0, 2000); // STT
            sheet.setColumnWidth(1, 8000); // Nhân viên
            sheet.setColumnWidth(2, 4500); // Ngày
            sheet.setColumnWidth(3, 5500); // Giờ vào
            sheet.setColumnWidth(4, 5500); // Giờ ra
            sheet.setColumnWidth(5, 4000); // Số giờ
            sheet.setColumnWidth(6, 5000); // Trạng thái

            // ---- Row 0: Report Title ----
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("BÁO CÁO CHẤM CÔNG - " + projectName.toUpperCase());
            titleCell.setCellStyle(createTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 6));

            // ---- Row 1: Date Range ----
            Row subTitleRow = sheet.createRow(1);
            Cell subTitleCell = subTitleRow.createCell(0);
            subTitleCell.setCellValue("Khoảng thời gian: " + startDate.format(DATE_FMT) + " → " + endDate.format(DATE_FMT));
            subTitleCell.setCellStyle(createSubTitleStyle(workbook));
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 6));

            // ---- Row 2: Empty ----
            sheet.createRow(2);

            // ---- Row 3: Headers ----
            String[] headers = { "STT", "Nhân viên", "Ngày", "Giờ vào", "Giờ ra", "Số giờ", "Trạng thái" };
            Row headerRow = sheet.createRow(3);
            CellStyle headerStyle = createHeaderStyle(workbook);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // ---- Data Rows ----
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle altDataStyle = createAltDataStyle(workbook);

            int rowNum = 4;
            double totalHours = 0;
            for (int i = 0; i < logs.size(); i++) {
                AttendanceResponseDTO log = logs.get(i);
                Row row = sheet.createRow(rowNum++);
                CellStyle style = (i % 2 == 0) ? dataStyle : altDataStyle;

                createCell(row, 0, String.valueOf(i + 1), style);
                createCell(row, 1, log.getFullName() != null ? log.getFullName() : log.getUsername(), style);
                createCell(row, 2, log.getCheckInAt() != null ? log.getCheckInAt().toLocalDate().format(DATE_FMT) : "-",
                        style);
                createCell(row, 3, log.getCheckInAt() != null ? log.getCheckInAt().format(DT_FMT) : "-", style);
                createCell(row, 4, log.getCheckOutAt() != null ? log.getCheckOutAt().format(DT_FMT) : "Chưa checkout",
                        style);
                createCell(row, 5, log.getWorkingHours() != null ? String.format("%.1f h", log.getWorkingHours()) : "-",
                        style);
                createCell(row, 6, log.getStatus() != null ? log.getStatus() : "-", style);

                if (log.getWorkingHours() != null)
                    totalHours += log.getWorkingHours();
            }

            // ---- Summary Row ----
            Row totalRow = sheet.createRow(rowNum + 1);
            CellStyle totalStyle = createTotalStyle(workbook);
            createCell(totalRow, 0, "TỔNG CỘNG", totalStyle);
            createCell(totalRow, 1, logs.size() + " bản ghi", totalStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum + 1, rowNum + 1, 1, 4));
            createCell(totalRow, 5, String.format("%.1f h", totalHours), totalStyle);
            createCell(totalRow, 6, "", totalStyle);

            // Write to bytes
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            workbook.write(output);
            log.info("Excel export completed: {} rows, {:.1f} total hours", logs.size(), totalHours);
            return output.toByteArray();

        } catch (IOException e) {
            log.error("Failed to export Excel: {}", e.getMessage());
            throw new RuntimeException("Failed to generate Excel report: " + e.getMessage());
        }
    }

    // ===== STYLE HELPERS =====

    private CellStyle createTitleStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("Times New Roman");
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createSubTitleStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("Times New Roman");
        font.setItalic(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("Times New Roman");
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createDataStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("Times New Roman");
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createAltDataStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("Times New Roman");
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private CellStyle createTotalStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setFontName("Times New Roman");
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        setBorders(style);
        return style;
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }
}
