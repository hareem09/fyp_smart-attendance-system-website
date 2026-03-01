const authController = require("../controller/authController.js")
const express = require("express")
const router = express.Router();

const{
    signup,
    studentLogin,
    adminLogin,
    logout,
    forgetPassword,
    resetPassword,
    refreshAccessToken
} = authController;

router.post ("/signup",signup);
router.post("/login/student",studentLogin);
router.post("/login/admin",adminLogin);
router.post("/logout",logout);
router.post("/forget-password",forgetPassword);
router.post("/reset-password/:token",resetPassword);
router.get("/refresh-token",refreshAccessToken);

module.exports = router;