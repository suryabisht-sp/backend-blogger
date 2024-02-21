const mongoose = require("mongoose")
const { Schema } = require("mongoose")
const {createToken}=require("../utils/auth") 
const {
  createHmac, randomBytes
} = require('crypto');
const { error } = require("console");
const UserProfile = require ("./profile.js")

const userSchema = new Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "/images/user.png"
  },
  salt: {
    type: String,
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: UserProfile   
  },
  role: {
    type: String,
    enum: ["user", "Admin"],
    default: "user"
  },
  concern: {
    type: String
  },
  passwordResetTime: { type: Date},
  passResetToken: { type: String },
  status: {
    reqDate: {
      type: Date,      
    },
    deactivate: {
      type: Boolean,
      default: false
    }
  },
  creationDate: {
    type: Date,
  }
})


userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return
  const salt = randomBytes(16).toString()
  const hashPassword = createHmac('sha256', salt).update(user.password).digest("hex")
  this.salt = salt;
  this.password = hashPassword
  next()
})

userSchema.static("matchPassword", async function (email, password, date) {
  const user = await this.findOne({ email });
  const status = user?.status?.deactivate
  const time = user?.status?.reqDate
  const userId = user?._id
  const username= user?.fullname
  console.log("user,", user)
  if (!user) throw new Error("user not found");
  if (status) {
    let updateData = {
      "status.deactivate": false
    };

function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  const yyyy = date.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

function calculateDateDifferenceAndFormat(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const differenceMs = Math.abs(d1 - d2);
  const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
 return differenceDays
   }
   if (calculateDateDifferenceAndFormat(time, date) <= 15) {
      const result = await userModel.updateOne({ _id: userId }, { $set: updateData });
      const salt = user.salt;
      const hashPassword = user.password
      const userprovided = createHmac('sha256', salt).update(password).digest("hex")
      if (result.nModified === 0) {
      return res.status(404).json({ error: "User not found or no changes applied" });
    }    
        if (hashPassword !== userprovided) {
         throw new Error("invalid password")
        }
      const token = createToken(user)
     return ({message:`Welcome back ${username}, your account has been re-activated`, token });
    }
      else {
        const result = await userModel.findOneAndDelete({ _id: userId })
       return{message: "Your account has been deleted, Kindly signup again to use the service", deactivated: true}
    }    
  }
  const salt = user.salt;
  const hashPassword = user.password
  const userprovided = createHmac('sha256', salt).update(password).digest("hex")
  if (hashPassword !== userprovided) {
    throw new Error("invalid password")
  }
  const token = createToken(user)
  return (token);
})

userSchema.static("forgetpass", async function (email){
  try {
    // Check if the user exists
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Email not registered with us");
    }
    const salt = user.salt;
    const resetToken = "password";
    // Update the user with the new values
    const updatedUser = await this.findOneAndUpdate(
      { email },
      {
        $set: {
          passResetToken: createHmac('sha256', salt).update(resetToken).digest("hex"),          
          passwordResetTime: new Date(Date.now() + 30 * 60 * 1000)
        }
      },
      { new: true, runValidators: true }
    );
    return {
      passToken: updatedUser.passResetToken,
      passTime: updatedUser.passwordResetTime,
      user: updatedUser
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
});

userSchema.static("saveResetPass", async function (email, password) {
  try {
    // Check if the user exists
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Email not registered with us");
    }
    const salt = user.salt;
     // Update the user with the new values
    const updatedUser = await this.findOneAndUpdate(
      { email },
      {
        $set: {
          password:createHmac('sha256', salt).update(password).digest("hex"),
          passResetToken: null,
          passwordResetTime: null,
        }
      },
      { new: true, runValidators: true }
    );
    return {
     user: updatedUser
    };
  } catch (error) {
    console.error("Error updating user's password:", error);
    throw new Error("Failed to update user password");
  }
});

const userModel = mongoose.model("userBlog", userSchema);

module.exports = userModel;