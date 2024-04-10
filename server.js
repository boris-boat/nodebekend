import express from "express";
import Sequelize, { json } from "sequelize";
import { Customer, Todo } from "./models/user.js";
import cors from "cors";
import { config } from "./config/config.js";
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
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
    await sequelize.sync();
    console.log("base synced");
    await Customer.sync({ alter: true });
    await Todo.sync({ alter: true });
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

app.post("/login", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(500).json({ message: "Invalid request sent" });
    return;
  }
  const user = await Customer.findOne({
    where: { username: req.body.username },
    include: Todo,
  });
  if (!user) {
    res.status(500).json({ message: "Wrong credentials" });
    return;
  }
  if (user.dataValues.password === req.body.password) {
    res.status(201).json({ message: "User found", user: user.dataValues });
    return;
  } else {
    res.status(500).json({ message: "Wrong credentials" });
    return;
  }
});

app.post("/createtodo", async (req, res) => {
  if (!req.body.text || !req.body.id) {
    return res.status(400).json({ message: "Missing todo text or user ID" });
  }

  try {
    const user = await Customer.findByPk(req.body.id, {
      include: Todo,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTodo = await Todo.create({
      text: req.body.text,
      CustomerId: user.id,
    });

    res.status(201).json({ message: "Todo created!", user: user });
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ message: "Error creating todo" });
  }
});
