
const express = require ("express");

const { loginUser , registerUser, getUserProgress} = require("../controllers/user.controller");

const router = express.Router()
const auth = require("../middlewares/auth");
const { resetPassword, forgotPassword } = require("../controllers/forgetten");


router.get("/user/progress", auth, getUserProgress);
router.post ('/signup', registerUser);
router.post ('/login', loginUser)

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

module.exports = router;