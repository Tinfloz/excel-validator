const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const fileRouter = require("./routes/file.validator.routes");

const app = express();

const port = process.env.PORT || 9000;

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use(bodyParser.json());

// test route
app.get("/", (req, res) => {
    res.send("server up and running!")
});

app.use("/api/validate", fileRouter);

app.listen(port, () => console.log(`server running on port: ${port}`)); 