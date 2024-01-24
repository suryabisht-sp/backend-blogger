const express= require( "express")
const blog = express.Router()
const { getBlogDetail, deletePost, blogSearch, postComment, editBlog, deleteComment, editComment } = require("../controller/blog")

blog.get(`/:id`, getBlogDetail)
blog.delete("/delete/:id", deletePost)
blog.post('/comment/:blogId', postComment)
blog.patch('/edit/:id', editBlog)
blog.delete("/deleteComment/:id", deleteComment)
blog.patch("/editComment/:id", editComment)
module.exports = blog
