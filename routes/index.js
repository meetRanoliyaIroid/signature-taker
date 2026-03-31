import express from "express";
import webRoutes from "./web";

const router = express.Router();

router.use("/", webRoutes);

export default router;
