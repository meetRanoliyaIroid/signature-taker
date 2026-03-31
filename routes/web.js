import express from "express";
import { createValidator } from "express-joi-validation";
import asyncWrapper from "express-async-wrapper";
import SignatureController from "../src/controllers/signatureController";
import saveSignatureSchema from "../src/dtos/saveSignature.dto";

const router = express.Router();
const validator = createValidator({ passError: true });

router.get("/", asyncWrapper(SignatureController.index));
router.post(
  "/signatures",
  validator.body(saveSignatureSchema),
  asyncWrapper(SignatureController.store)
);
router.get("/signatures", asyncWrapper(SignatureController.list));
router.get("/signatures/:id", asyncWrapper(SignatureController.show));
router.post("/signatures/:id/delete", asyncWrapper(SignatureController.destroy));

export default router;
