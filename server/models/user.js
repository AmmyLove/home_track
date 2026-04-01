import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // no two accounts with the same email
    validate: {
      isEmail: true, // sequelize checks the format for us
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    // IMPORTANT: we never store the raw password — only the bcrypt hash
  },
});

export default User;