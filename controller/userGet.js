const userModel = require("../model/user");
const { createToken, validateToken } = require("../utils/auth");
const sendEmail = require("../utils/email")

const emailValidator = (email) => {
  // Use a regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


async function allUsers(req, res, next){
  const result = await userModel.find({}).select('-salt -password').sort({ role: 1 })
  res.status(200).json({"data":result})
}

async function signInPost(req, res, next) {
  const { email, password, date } = req.body;
  // Validate email
  if (!emailValidator(email)) {
    return res.status(400).send({ error: "Invalid email format" });
  }
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(401).send({ error: "User not found" });
  }
  const userStatus= user.concern
  const userWithoutSensitiveInfo = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    profileImage: user.profileImage,
    role: user.role,
    concern: user.concern,
    status: user.status
  };
  try {
    const token = await userModel.matchPassword(email, password, date);
    if (token?.deactivated) {
        return res.status(404).send({ message: token?.message});
    }
    else if (userStatus === "suspended") {
      return res.status(401).send({ user:userWithoutSensitiveInfo , message: "You account has been suspended, Kindly contact admin" });
    }
    else {
      return res.status(200).send({ user: userWithoutSensitiveInfo, token: token.token? token?.token: token, message: token?.message? token?.message: "Login success" });
    }
  } catch (error) {
    res.status(401).send({ error: "Incorrect Email or Password" });
  }
}

async function signUpPost(req, res, next) {
  try {
    const { fullname, email, password, creationDate } = req.body;
    // Validate email
    if (!emailValidator(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const result = await userModel.create({
      fullname,
      email,
      password,
      creationDate
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
    const message = `We have received a password reset request, please use below link to set your password. It will expire in 30 mins \n\n${resetURL}\n\n`
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
      return next (err)      // return next(new Error("There was an error sending email. Please try later"))
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
async function deactivateAccount(req, res, next) {
  const { flag, token } = req.body;  
  try {
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }    
    const check = await validateToken(token);    
    if (!check || !check.payload || !check.payload._id) {
      return res.status(400).json({ error: "Invalid token format" });
    }    
    const userId = check.payload._id;
    let updateData = {
      "status.deactivate": true
    };
    if (flag) {
      // Add 15 days to the current date
      const currentDate = new Date();
      const futureDate = new Date(currentDate);
      futureDate.setDate(futureDate.getDate()+15);
      // Update the request date
      updateData["status.reqDate"] = futureDate;
    }
    const result = await userModel.updateOne({ _id: userId }, { $set: updateData });
    if (result.nModified === 0) {
      return res.status(404).json({ error: "User not found or no changes applied" });
    }
    return res.status(200).json({ message: "Request for deletion of account is accepted" });
  } catch (error) {
    console.log("error--------------", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteAccount(req, res, next) {
  const { id, token } = req.body;  
  try {
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }    
    const check = await validateToken(token);    
    if (!check || !check.payload || !check.payload._id) {
      return res.status(400).json({ error: "Invalid token format" });
    }    
    const result = await userModel.findOneAndDelete({ _id: id })
       return res.status(201).json({ message: "Account deleted successfully" });
  } catch (error) {
     return res.status(500).json({ error: "Internal server error" });
  }
 }


async function suspendAccount(req, res, next) {
    const { token, id  } = req.body;  
  try {
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }    
    const check = await validateToken(token);    
    if (!check || !check.payload || !check.payload._id) {
      return res.status(400).json({ error: "Invalid token format" });
    } 
    
    const user = await userModel.findOne({ _id: id })
    console.log("user=======", user)
    const userConcern= user.concern
    const userId = check.payload._id;
    if (userConcern === "suspended") {
       let updateData = {
      "concern": "active"
    };
      const result = await userModel.updateOne({ _id: id }, { $set: updateData });
       return res.status(200).json({ message: "Suspension has been invoked" });
    }    
    let updateData = {
      "concern": "suspended"
    };
    const result = await userModel.updateOne({ _id: id }, { $set: updateData });
    if (result.nModified === 0) {
      return res.status(404).json({ error: "User not found or no changes applied" });
    }
    return res.status(200).json({ message: "Account has been suspended" });
  } catch (error) {
     return res.status(500).json({ error: "Internal server error" });
  }
 }



module.exports = { signInPost, signUpPost, forgetPassword, resetPassword, deactivateAccount, allUsers,deleteAccount,suspendAccount }