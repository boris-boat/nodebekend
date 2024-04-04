import express from "express";
import Sequelize, { json } from "sequelize";
import { Customer } from "./models/user.js";
import {cors} from "cors"
import { config } from "./config/config.js";
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    await Customer.sync();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  console.log(`Server listening on port ${port}`);
});

app.post("/register", async (req, res) => {
  try {
    const newUser = await Customer.create(req.body);
    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Validation errors" });
    } else {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
});
app.get("/users", async (req, res) => {
  try {
    const users = await Customer.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to retrieve users" });
  }
});
app.post("/login", async (req, res) => {
  const user = await Customer.findOne({
    where: { username: req.body.username },
  });
  if (user.dataValues.password === req.body.password) {
    res.status(201).json({ message: "User found", user: user.dataValues });
  } else {
    res.status(500).json({ message: "Wrong credentials" });
  }
});
