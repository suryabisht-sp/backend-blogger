const userModel = require("../model/user");
const { createToken, validateToken } = require("../utils/auth");
const sendEmail = require("../utils/email")

const emailValidator = (email) => {
  // Use a regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

async function signInPost(req, res, next) {
  const { email, password } = req.body;
  // Validate email
  if (!emailValidator(email)) {
    return res.status(400).send({ error: "Invalid email format" });
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(401).send({ error: "User not found" });
  }
  const userWithoutSensitiveInfo = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
  };
  try {
    const token = await userModel.matchPassword(email, password);
    return res.status(200).send({ user: userWithoutSensitiveInfo, token });
  } catch (error) {
    res.status(401).send({ error: "Incorrect Email or Password" });
  }
}

async function signUpPost(req, res, next) {
  try {
    const { fullname, email, password } = req.body;
    // Validate email
    if (!emailValidator(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const result = await userModel.create({
      fullname,
      email,
      password
    });
    const userWithoutSensitiveInfo = {
      _id: result._id,
      fullname: result.fullname,
      email: result.email,
      profileImage: result.profileImage,
      role: result.role,
    };
    const token = createToken(result);
    res.status(201).json({ message: 'Signup successful', user: userWithoutSensitiveInfo, token: token });
  } catch (error) {
    res.status(401).json({ error: "Error in signup process" });
  }
}


async function forgetPassword(req, res, next) {
  try {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    const token = await userModel.forgetpass(email)
    const resetURL = `https://frontend-blogger-3fp5qnot3-suryabisht-sp.vercel.app/user/resetPassword/forgetToken=${token.passToken}`
    const message = `We have received a password reset request, please use below link to set your password. It will expire in 10 mins \n\n${resetURL}\n\n`
    try {
      await sendEmail({
        email: email,
        subject: 'Password reset request',
        message: message,
      })
      res.status(200).json({ status: "success", message: "password sent succefully" })
    } catch (err) {
      user.passwordResetTime = undefined,
        user.passResetToken = undefined
      user.save({ validateBeforeSave: false })
      return next(new Error("There was an error sending email. Please try later"))
    }
  }
  catch (error) {
    res.render('forgetpass', { error })
  }
}
async function resetPassword(req, res, next) {
  const { password, cPassword } = req.body
  const plainToken = req.query.forgetToken
  const token = req.query.token

  try {
    if (password !== cPassword) {
      return res.status(401).send({ "msj": "password didn't matched" })
    }
    if (token) {
      const check = await validateToken(token)
      const email = check?.payload?.email
      user = await userModel.findOne({ email });
      try {
        const result = await userModel.saveResetPass(email, password)
        if (result) {
          console.log("email", email)
          return res.status(200).send({ "msj": "Password changed successfully" })
        }
      } catch (error) {
        console.log("error", error)
      }
    }
    if (plainToken) {
      user = await userModel.findOne({
        passResetToken: plainToken,
        passwordResetTime: { $gt: Date.now() }
      });
      if (!user) {
        return res.status(401).send({ "msj": "Token Expired" });
      }
      else {
        try {
          const email = user?.email
          const result = await userModel.saveResetPass(email, password)
          if (result) {
            return res.status(200).send({ "msj": "Password changed successfully" })
          }
        } catch (error) {
          console.log("error", error)
        }
        return res.status(200).send({ "msj": "Password changed successfully" })
      }
    }
  } catch (error) {
    console.log("error--------------", error)
  }
}








module.exports = { signInPost, signUpPost, forgetPassword, resetPassword }