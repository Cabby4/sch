const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../model/user.model");

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 15;

  await user.save();

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  console.log("RESET LINK:", resetLink);

  res.json({ message: "Reset link generated" });
};


// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
};

module.exports = {
  forgotPassword,
  resetPassword
};