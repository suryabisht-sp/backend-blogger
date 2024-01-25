const express= require( "express")
const router = express.Router()
const { signInPost, forgetPassword, resetPassword } = require("../controller/userGet")
const { signUpPost } = require("../controller/userGet.js")
const { postBlog } = require("../controller/blog.js")
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

router.post("/signin", signInPost)
router.post("/signup", signUpPost)
router.post('/upload-blog', upload.single('coverImageUrl'), postBlog);
router.post("/forgetpassword", forgetPassword)
router.post("/resetpassword/:token?", resetPassword)

module.exports= router