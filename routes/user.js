const express= require( "express")
const router = express.Router()
const { signInPost, forgetPassword, resetPassword, deactivateAccount, allUsers, suspendAccount, deleteAccount } = require("../controller/userGet")
const { signUpPost } = require("../controller/userGet.js")
const { postBlog, editBlog, updateUserProfile, profileDetails, draftByAdmin } = require("../controller/blog.js")
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

router.get('/', allUsers )
router.post("/signin", signInPost)
router.post("/signup", signUpPost)
router.post('/upload-blog', upload.single('coverImageUrl'), postBlog);
router.post("/forgetpassword", forgetPassword)
router.post("/resetpassword/", resetPassword)
router.patch('/edit/:blogId', upload.single('coverImageUrl'), editBlog);
router.put('/upload-image', upload.single('profilePhoto'), updateUserProfile);
router.post('/getprofile', profileDetails);
router.post('/deactivate', deactivateAccount)

//admin api's
router.post('/admin/suspend', suspendAccount)
router.delete('/admin/delete', deleteAccount)
router.patch('/admin/draftblog', draftByAdmin)


module.exports= router
