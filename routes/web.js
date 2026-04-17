import express from "express";
import path from "path";
import multer from "multer";
import { createValidator } from "express-joi-validation";
import asyncWrapper from "express-async-wrapper";
import SignatureController from "../src/controllers/signatureController";
import PdfController from "../src/controllers/pdfController";
import saveSignatureSchema from "../src/dtos/saveSignature.dto";

const router = express.Router();
const validator = createValidator({ passError: true });

// Multer config for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `pdf-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

// Signature routes
router.get("/", asyncWrapper(SignatureController.index));
router.post(
  "/signatures",
  validator.body(saveSignatureSchema),
  asyncWrapper(SignatureController.store)
);
router.get("/signatures", asyncWrapper(SignatureController.list));
router.get("/signatures/:id", asyncWrapper(SignatureController.show));
router.post("/signatures/:id/delete", asyncWrapper(SignatureController.destroy));

// PDF routes
router.get("/pdf/upload", asyncWrapper(PdfController.uploadForm));
router.post("/pdf/upload", upload.single("pdf"), asyncWrapper(PdfController.upload));
router.get("/pdf/edit/:filename", asyncWrapper(PdfController.edit));
router.post("/pdf/generate", asyncWrapper(PdfController.generate));

export default router;
