
const express = require ("express");

const { loginUser , registerUser, getUserProgress} = require("../controllers/user.controller");

const router = express.Router()
const auth = require("../middlewares/auth");


router.get("/user/progress", auth, getUserProgress);
router.post ('/signup', registerUser);
router.post ('/login', loginUser)

module.exports = router;