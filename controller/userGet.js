const userModel = require("../model/user");
const { createToken, validateToken } = require("../utils/auth");
const sendEmail = require("../utils/email")
async function signInPost(req, res, next) {
  const { email, password } = req.body
  const user = await userModel.findOne({ email })
  const userWithoutSensitiveInfo = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
  };
  try {
    const token = await userModel.matchPassword(email, password)
    return res.status(200).send({ user: userWithoutSensitiveInfo, token });
  } catch (error) {
    res.status(401).send({ error: "Incorrect Email or Password" })
  }
}

async function signUpPost(req, res, next) {
  try {
    const { fullname, email, password } = req.body
    const result = await userModel.create({
      fullname,
      email,
      password
    })
    const userWithoutSensitiveInfo = {
      _id: result._id,
      fullname: result.fullname,
      email: result.email,
      profileImage: result.profileImage, // Include any other necessary fields
      role: result.role,
    };

    const token = createToken(result)
    res.status(201).json({ message: 'Signup successful', user: userWithoutSensitiveInfo, token: token });
  } catch (error) {
    res.status(401).json({ error: "Incorrect Email or Password" })
  }
}


async function forgetPassword(req, res, next) {
  try {
    const { email } = req.body
    const user = await userModel.findOne({ email })
    const token = await userModel.forgetpass(email)
    const resetURL = `https://frontend-blogger-3fp5qnot3-suryabisht-sp.vercel.app/user/resetPassword/?token=${token.passToken}`
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
  console.log("parasmmmm-----", req.params)
  const check = validateToken(req.params.token)
  try {
    if (!check) {
      if (password !== cPassword) {
        return res.status(401).send({ "msj": "password didn't matched" })
      }
      const email = check?.email
      if (email) {
        user = await userModel.findOne({ email });
        try {
          const result = await userModel.saveResetPass(email, password)
          if (result?.email) {
            return res.status(200).send({ "msj": "Password changed successfully" })
          }
        } catch (error) {
          console.log("error", error)
        }
      }
    }
    if(true) {
      user = await userModel.findOne({
        passResetToken: req.params.token,
        passwordResetTime: { $gt: Date.now() }
      });
      console.log("user=============", user)
      if (!user) {
        return res.status(401).send({ "msj": "Token Expired" });
      }
      // return res.render("resetPassword", { user: user });
    }
  } catch (error) {
    console.log("error--------------", error)
  }

}








module.exports = { signInPost, signUpPost, forgetPassword, resetPassword }