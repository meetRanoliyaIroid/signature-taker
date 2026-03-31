import dotenv from "dotenv";
dotenv.config();

export const APP_NAME = process.env.APP_NAME || "Signature Taker";
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || "localhost";

export const DB_CONNECTION = process.env.DB_CONNECTION || "mysql";
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = process.env.DB_PORT || 3306;
export const DB_USERNAME = process.env.DB_USERNAME || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "signature_taker";

export const baseUrl = (path = "") => {
  return `http://${HOST}:${PORT}/${path}`;
};
