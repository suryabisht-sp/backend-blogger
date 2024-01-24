const Blog = require("../model/blog.js")
const Comments = require("../model/comments.js")
const path = require('path');

async function getBlogDetail(req, res, next) {
  const result = await Blog.findById(req.params.id).populate("createdBy")
  const comments = await Comments.find({ blogId: req.params.id }).populate({path:"createdBy",select: "-password -salt"}).sort({ createdAt: -1 });
  return res.status(200).send({ result, comments });
}

async function postBlog(req, res, next) {
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
    const result = await Blog.create({
      title,
      body,
      createdBy: createdBy.toString(), // Assuming you have a user in your request object
      coverImageUrl,
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
    const result = await Blog.create({
      title,
      body,
      createdBy: createdBy.toString(), // Assuming you have a user in your request object
      coverImageUrl,
    });
    return res.status(201).json(result);
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

module.exports={getBlogDetail, postComment, postBlog, deletePost, blogSearch,editBlog, deleteComment, editComment}