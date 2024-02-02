const mongoose = require("mongoose")

const { Schema } = require("mongoose")
const userModel = require("./user")


const profileSchema = new Schema({
  hobbies: {
    type: String,
    required: false,
  },
  profilePic: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  dob: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phoneNo: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
});

const blogSchema = new Schema({
title: {
type: String,
required: true
},
body: {
type: String,
required: true
},
createdBy: {
type: Schema.Types.ObjectId,
ref: userModel
},
coverImageUrl: {
type: String,
require: false
},
  draft: {
  type: Boolean,
  require: true
  }, 
  commentsAllowed: {
    type: Boolean,
     required: true
  },
  publishedDate:{
  type: String,
    required: true
  },
  publishedTime: {
    type: String,
    required: true
  },
  location: {
   type: Array,
    required: true
  },
  userProfile: {
    type: profileSchema,
    required: false,
  },
})


const Blog = mongoose.model("blog", blogSchema)

module.exports = Blog
 