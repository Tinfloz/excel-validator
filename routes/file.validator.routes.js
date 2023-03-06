const express = require("express");
const { upload } = require("../utils/multer.upload");
const { getFile } = require("../controllers/file.validator");

const router = express.Router();

router.route("/").post(upload, getFile);

module.exports = router;