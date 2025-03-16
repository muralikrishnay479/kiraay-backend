const express = require("express");
const router = express.Router();
const { registerUser, loginUser, currentUser } = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");
const validateUser = require("../middleware/validationMiddleware");

router.post("/register", validateUser, registerUser);
router.post("/login", validateUser, loginUser);
router.get("/current", validateToken, currentUser);

module.exports = router;