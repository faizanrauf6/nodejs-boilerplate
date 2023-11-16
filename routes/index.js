const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const storageRoutes = require("./storageRoutes");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/storage", storageRoutes);

module.exports = router;
