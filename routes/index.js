const express = require("express");
const router = express.Router();

router.use("/profile", require("./profile"));
router.use("/games", require("./games"));

module.exports = router;