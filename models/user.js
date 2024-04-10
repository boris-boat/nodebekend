import { Sequelize, DataTypes, Model } from "sequelize";

import { config } from "../config/config.js";

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

export const Customer = sequelize.define("Customer", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
export const Todo = sequelize.define("Todo", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: DataTypes.STRING,
  },
  isDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
Todo.belongsTo(Customer);
Customer.hasMany(Todo);
