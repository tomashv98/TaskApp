const express = require("express");

require("./db/mongoose");

const app = express();

const PORT = process.env.PORT;
const ip = process.env.IP || "localhost";

app.set("view engine", "ejs");


const userRoutes = require("./routes/users");
const taskRoutes = require("./routes/tasks");

app.use(express.json())

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log("App is online on " + PORT)
});