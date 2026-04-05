import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// ← On Render, DATABASE_URL is provided as a single connection string
// ← Locally, we still use the individual DB_* variables
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // required for Render's SSL cert
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: "postgres",
        logging: false,
        dialectOptions: isProduction
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
      }
    );

export default sequelize;