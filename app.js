import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import { PORT, HOST } from "./src/config/constant";
import { SIGNATURE_STATUS, SIGNATURE_STATUS_LABEL } from "./src/config/enum";
import db from "./model";
import router from "./routes";
import errorHandler from "./src/middleware/errorHandler";

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Expose enums to all EJS templates
app.locals.SIGNATURE_STATUS = SIGNATURE_STATUS;
app.locals.SIGNATURE_STATUS_LABEL = SIGNATURE_STATUS_LABEL;

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", router);

// Error handler
app.use(errorHandler);

// Database sync & server start
db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully");
    app.listen(PORT, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err.message);
  });

export default app;
