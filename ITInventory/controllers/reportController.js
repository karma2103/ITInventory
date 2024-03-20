const express = require("express");
const router = express.Router();
const Backup = require("../models/backup");
const AssetInward = require("../models/AssetInward");
const AssetOutward = require("../models/AssetOutward");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

// Define a function to generate PDF reports
async function generatePdfReport(res, data, header, filename) {
  const pdfDoc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${filename}.pdf`);
  pdfDoc.pipe(res);

  // Generate the PDF content as a table
  pdfDoc.fontSize(12).text(filename, { align: "center" });
  pdfDoc.moveDown();

  // Define table layout
  const startX = 60;
  const startY = pdfDoc.y;
  const columnWidth = 80;
  const rowHeight = 40;

  // Create a table header
  pdfDoc
    .fillAndStroke("#CCCCCC")
    .rect(startX, startY, columnWidth * header.length, rowHeight)
    .fill("#CCCCCC");
  pdfDoc.fillColor("#000000").font("Helvetica-Bold");
  header.forEach((headerText, index) => {
    pdfDoc.text(headerText, startX + index * columnWidth, startY, {
      width: columnWidth,
      align: "center",
    });
  });

  // Populate the table with data
  pdfDoc.font("Helvetica");
  let currentY = startY + rowHeight;
  data.forEach((rowData) => {
    pdfDoc.fillColor("#000000");
    header.forEach((headerText, index) => {
      const cellData = headerText === "date" ? new Date(rowData[headerText]).toLocaleDateString() : rowData[headerText];
      pdfDoc.text(
        cellData !== undefined ? cellData.toString() : "",
        startX + index * columnWidth,
        currentY,
        { width: columnWidth, align: "center" }
      );
    });
    currentY += rowHeight;
  });
  pdfDoc.end();
}

// Define a function to generate Excel reports
async function generateExcelReport(res, data, header, filename) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Backup Report");

  // Define the Excel header row
  worksheet.addRow(header);

  // Add data rows
  data.forEach((rowData) => {
    worksheet.addRow(rowData);
  });

  // Set response headers for Excel
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);

  // Send the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  res.send(buffer);
}

// View
router.get("/report", function (req, res) {
  res.render("./pages/Reports/reportBackup");
});

// Initialize jsreport
router.post("/generate-report", async (req, res) => {
  const { startDate, endDate, reportCategory, reportFormat } = req.body;

  let data, header, filename;
  try {
    switch (reportCategory) {
      case "backups":
        data = await Backup.find({
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        header = [
          "date",
          "server",
          "backupType",
          "startTime",
          "endTime",
          "mediaType",
          "mediaSrNo",
          "backupTakenBy",
          "backupLocation",
          "remarks",
        ];
        filename = "Backup Report";
        break;
      case "assetOutwards":
        data = await AssetOutward.find({
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        header = [
          "date",
          "particulars",
          "serialNumber",
          "assetDescription",
          "assetSentTo",
          "authorizedBY",
          "remarks",
        ];
        filename = "Asset Outward Report";
        break;
      case "assetInwards":
        data = await AssetInward.find({
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        header = [
          "date",
          "particulars",
          "serialNumber",
          "assetDescription",
          "suppiledBy",
          "receivedBy",
          "remarks",
        ];
        filename = "Asset Inward Report";
        break;
      default:
        return res.status(400).send("Invalid Report Type");
    }

    if (reportFormat === "pdf") {
      await generatePdfReport(res, data, header, filename);
    } else if (reportFormat === "excel") {
      await generateExcelReport(res, data, header, filename);
    } else {
      res.status(400).send("Invalid Report Type");
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).send("Error retrieving data from the database");
  }
});

module.exports = router;