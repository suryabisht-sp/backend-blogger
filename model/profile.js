const mongoose = require("mongoose")

const { Schema } = require("mongoose")
// const {userModel} = require("./user")

const userProfileSchema = new Schema({
  // Assuming a user is identified by a unique user ID
  // userId: {
  //   type: Schema.Types.ObjectId,
  //   ref: userModel, // Reference to the User model
  //   required: true,
  // },
  name: {
    type: String,
    },
dob: {
    type: Date,
    validate: {
      validator: function (date) {
        return moment(date, "DD/MM/YYYY", true).isValid();
      },
      message: "Invalid date format for dob",
    },
  },
  email: {
    type: String,
    unique: true,
    // You might want to add more validation for email format
  },
  phoneNo: {
    type: String,
    // You might want to add more validation for phone number format
  },
    street: {
      type: String,
    },
    city: {
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
