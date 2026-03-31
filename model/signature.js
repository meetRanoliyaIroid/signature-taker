import { DataTypes } from "sequelize";
import sequelize from "../src/config/database";

const Signature = sequelize.define(
  "Signature",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    signer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    signer_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    signature_data: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
      comment: "Base64 data URL (data:image/png;base64,...)",
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "1: active, 2: revoked",
    },
  },
  {
    tableName: "signatures",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Signature;
