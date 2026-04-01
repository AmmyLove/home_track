import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // set to console.log if you want to see SQL queries
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // This is important for Render
      }
    }
  }
);


export default sequelize;