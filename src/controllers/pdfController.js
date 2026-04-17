import path from "path";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import SignatureService from "../services/signatureService";
import { SIGNATURE_STATUS } from "../config/enum";

class PdfController {
  static async uploadForm(req, res) {
    res.render("pdf/upload", { title: "Upload PDF" });
  }

  static async upload(req, res) {
    if (!req.file) {
      return res.redirect("/pdf/upload");
    }
    res.redirect(`/pdf/edit/${req.file.filename}`);
  }

  static async edit(req, res) {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../../uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).render("error", {
        title: "Not Found",
        error: { statusCode: 404, message: "PDF file not found" },
      });
    }

    const signatures = await SignatureService.getAll();
    const activeSignatures = signatures.filter(
      (s) => s.status === SIGNATURE_STATUS.ACTIVE
    );

    res.render("pdf/edit", {
      title: "Edit PDF",
      filename,
      signatures: activeSignatures,
    });
  }

  static async generate(req, res) {
    const { filename, placements } = req.body;
    const filePath = path.join(__dirname, "../../uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "PDF not found" });
    }

    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    for (const placement of placements) {
      const { pageIndex, x, y, width, height, signatureData } = placement;
      const page = pages[pageIndex];

      // Extract base64 data from data URL
      const base64Data = signatureData.replace(
        /^data:image\/png;base64,/,
        ""
      );
      const sigImageBytes = Buffer.from(base64Data, "base64");
      const sigImage = await pdfDoc.embedPng(sigImageBytes);

      const pageHeight = page.getHeight();

      page.drawImage(sigImage, {
        x: x,
        y: pageHeight - y - height,
        width: width,
        height: height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    const outputFilename = `signed-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "../../uploads", outputFilename);
    fs.writeFileSync(outputPath, pdfBytes);

    res.json({
      success: true,
      message: "PDF generated successfully",
      data: { filename: outputFilename, url: `/uploads/${outputFilename}` },
    });
  }
}

export default PdfController;
