require("dotenv").config();
const express = require("express");
const cors = require("cors");
const studioRoute = require("./routes/studio");
require("./mongo");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", studioRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error(err);
});
