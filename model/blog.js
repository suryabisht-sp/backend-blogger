const mongoose = require("mongoose")

const { Schema } = require("mongoose")
const userModel = require("./user")

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
})


const Blog = mongoose.model("blog", blogSchema)

module.exports = Blog
 