import dbConnection from "../src/config/database";
import Signature from "./signature";

const db = {};

db.sequelize = dbConnection;
db.Signature = Signature;

export default db;
