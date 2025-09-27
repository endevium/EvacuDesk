const express = require("express");
const connectDB = require("./config/dbconnection");

const app = express();

// db connection
connectDB();

app.use(express.json());

// test connection
app.get("/", (req, res) => {
  res.send("API is running");
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
