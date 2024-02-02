const JWT = require("jsonwebtoken")

const secret = "blogger@143%5&&@#"

function createToken(user) {
  const payload = ({
    _id: user._id,
    email: user.email,
    username: user.fullname,
    profileImage: user.profileImage,
    role: user.role
  })

  const token = JWT.sign(payload, secret);
  return token 
}

function validateToken(token) {
  try {
  const payload = JWT.verify(token, secret)
  return {payload}
  }
  catch (error) {
    return ("Invalid Token or Expired Token")
  }
}

module.exports={validateToken, createToken}