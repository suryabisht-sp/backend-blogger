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
Draft: {
  type: Boolean,
  require: true
}
})


const BlogDraft = mongoose.model("blogDraft", blogSchema)

module.exports = BlogDraft
  const apiURL = 'http://localhost:8000/';
