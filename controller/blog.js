const Blog = require("../model/blog.js")
const Comments = require("../model/comments.js")
const path = require('path');

async function getBlogDetail(req, res, next) {
  const result = await Blog.findById(req.params.id).populate("createdBy")
  const comments = await Comments.find({ blogId: req.params.id }).populate({path:"createdBy",select: "-password -salt"}).sort({ createdAt: -1 });
  return res.status(200).send({ result, comments });
}

async function getDraftDetail(req, res, next) {
  const result = await Blog.findById(req.params.id).populate("createdBy")
  return res.status(200).send({ result });
}

async function getAllBlogsOfUser(req, res, next) {
  try {
    const userId = req.params.id;
    // Find all blogs posted by the user
    const blogs = await Blog.find({ createdBy: userId }).populate("createdBy");
    return res.status(200).send({ blogs });
  } catch (error) {
    console.error('Error in getAllBlogsOfUser:', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
}

async function postBlog(req, res, next) {
try {
    const { title, body, createdBy, location, commentsAllowed, publishedDate, publishedTime } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and Body are required fields' });
    }
    let coverImageUrl;
    // Check if the request contains a file (image)
    if (req.file) {
  const fileName = path.basename(req.file.path);
      coverImageUrl = `/uploads/${fileName}`;
    }
     const result = await Blog.create({
      title,
      body,
      createdBy: createdBy.toString(),
      coverImageUrl,
      location,
      commentsAllowed,
      publishedDate,
      publishedTime, 
      draft: false      

    });
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function editBlog(req, res, next) {
try {
    const { title, body, createdBy } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and Body are required fields' });
    }
    let coverImageUrl;
    // Check if the request contains a file (image)
    if (req.file) {
      const fileName = path.basename(req.file.path);     
      coverImageUrl = `/uploads/${fileName}`;   
    }  
      const updatedBlog = await Blog.findByIdAndUpdate(req.params.blogId, { title: title, body:body, createdBy:createdBy, coverImageUrl:coverImageUrl, draft: false }, { new: true });
    
    return res.status(201).json(updatedBlog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deletePost(req, res, next) { 
try {
    const blogId = req.params.id
   await Blog.findOneAndDelete({_id:blogId})
   await Comments.deleteMany({ blogId });
  res.status(200).send("Successfully deleted")
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function blogSearch(req, res, next) { 
  const result = await Blog.find();
   try{
   const { search } = req.query;
     const searchLowerCase = search.toLowerCase();
    // Filter the data to include only blogs with titles containing the search term (case-insensitive)
     const filteredData = result.filter(blog => blog.title.toLowerCase().includes(searchLowerCase)); 
   return res.status(200).send({data: filteredData })
    } catch (error) {
    return res.status(301).send({error})
  }
}

async function postComment(req, res, next){
  const { blogId, content, createdBy } = req.body
  await Comments.create({    
    content: content,
    blogId: blogId,
    createdBy: createdBy?.toString(),
    createdAt: Date.now(),
  })
   return res.status(200).send({msj:"Comment posted Successfully"})
}

async function deleteComment(req, res, next) { 
try {
    const commentId = req.params.id
   await Comments.findOneAndDelete({_id:commentId})
   res.status(200).send("Successfully deleted")
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function editComment(req, res, next) {
  try {
    const commentId = req.params.id;
    const { content } = req.body;
    // Find the comment by ID and update its content
    const updatedComment = await Comments.findByIdAndUpdate(commentId, { content }, { new: true });

    if (!updatedComment) {
      return res.status(404).send('Comment not found');
    }

    res.status(200).json({ message: 'Comment successfully updated', updatedComment });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function draftBlog(req, res, next) {
try {
  const { title, body, createdBy, location, commentsAllowed, publishedDate, publishedTime } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and Body are required fields' });
    }
    let coverImageUrl;
    // Check if the request contains a file (image)
    if (req.file) {
  const fileName = path.basename(req.file.path);
      coverImageUrl = `/uploads/${fileName}`;
    }
    const result = await Blog.create({
    title,
      body,
      createdBy: createdBy.toString(),
      coverImageUrl,
      location,
      commentsAllowed,
      publishedDate,
      publishedTime,
      draft: true      
    });
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
const updateUserProfile = async (req, res) => {
  try {
    // Extract user ID from the request (you should have this after user authentication)
    const userId = req.user._id; // Assuming user ID is available in req.user after authentication
    // Check if the user profile already exists
    let userProfile = await UserProfile.findOne({ userId });
    // If user profile does not exist, create a new one
    if (!userProfile) {
      userProfile = new UserProfile({ userId });
    }
    if (req.file) {
      const fileName = path.basename(req.file.path);     
      coverImageUrl = `/uploads/${fileName}`;   
    }  
    // Update user profile fields
    userProfile.name = req.body.name;
    userProfile.dob = req.body.dob;
    userProfile.email = req.body.email;
    userProfile.phoneNo = req.body.phoneNo;
    userProfile.address = req.body.address;
    userProfile.hobbies = req.body.hobbies;
    userProfile.profilePhoto = req.body.profilePicUrl;
    userProfile.bio = req.body.bio;
    // Save the updated user profile
    await userProfile.save();

    // Respond with success message
    return res.status(200).json({ success: true, message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


module.exports={getBlogDetail, postComment, postBlog, deletePost, blogSearch,editBlog, deleteComment, editComment, draftBlog, getDraftDetail,getAllBlogsOfUser,updateUserProfile}