const userModel= require("../model/user");
const { createToken } = require("../utils/auth");

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
  return res.status(200).send({user:userWithoutSensitiveInfo, token });
} catch (error) {
res.status(401).send({error:"Incorrect Email or Password"})
}
}

async function signUpPost (req, res, next) {
try {
  const {fullname, email, password } = req.body
 const result= await userModel.create({
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
 res.status(201).json({ message: 'Signup successful',user:userWithoutSensitiveInfo,  token: token });
} catch (error) {
res.status(401).json({error:"Incorrect Email or Password"})
}
}
















module.exports = { signInPost,signUpPost}