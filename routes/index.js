const express = require("express");
const router = express.Router();

router.use("/status", require("./status"));
router.use("/profile", require("./profile"));
router.use("/games", require("./games"));
router.use("/gameInfo", require("./gameInfo"));
router.use("/categories", require("./categories"));
router.use("/map", require("./maps"));

module.exports = router;