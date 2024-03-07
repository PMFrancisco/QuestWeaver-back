const express = require("express");
const router = express.Router();

router.use("/profile", require("./profile"));
router.use("/games", require("./games"));
router.use("/gameInfo", require("./gameInfo"));
router.use("/categories", require("./categories"));

module.exports = router;