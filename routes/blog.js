const express= require( "express")
const blog = express.Router()
const { getBlogDetail, deletePost, blogSearch, postComment, editBlog, deleteComment, editComment, draftBlog, getDraftDetail, getAllBlogsOfUser } = require("../controller/blog")

const multer = require('multer');
const path = require("path")

const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, path.resolve(`./public/uploads/`))
},
filename: function (req, file, cb) {
const filename= `${Date.now()}-${file.originalname}`
cb(null, filename)
}
})

const upload = multer({ storage: storage })

blog.get(`/:id`, getBlogDetail)
blog.delete("/delete/:id", deletePost)
blog.post('/comment/:blogId', postComment)
blog.patch('/edit/:id', editBlog)
blog.delete("/deleteComment/:id", deleteComment)
blog.patch("/editComment/:id", editComment)
blog.post("/draft/:id?", upload.single('coverImageUrl'), draftBlog)
blog.get("/draft/:id?", getDraftDetail)
blog.get("/alldrafts/:id", getAllBlogsOfUser)
module.exports = blog
