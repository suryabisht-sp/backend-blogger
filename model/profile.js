const mongoose = require("mongoose")
const { Schema } = require("mongoose")
const userModel = require("./user")

const userProfileSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
    role: {
    type: String,
  },
      google: {
    type: String,
  },
        git: {
    type: String,
  },
          twitter: {
    type: String,
  },
            instagram: {
    type: String,
  },
              facebook: {
    type: String,
  },
  dob: {
    type: Date,
    defaultValue: null,
  },
  email: {
    type: String,
    unique: true,
   },
  phoneNo: {
    type: String,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
    company: {
    type: String,
  },
      linkedin: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
    type: String,
  },
  country: {
    type: String
  },
  hobbies: [
    {
      type: String,
    },
  ],
  profilePicUrl: {
    type: String,
  },
  bio: {
    type: String,
  },
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
