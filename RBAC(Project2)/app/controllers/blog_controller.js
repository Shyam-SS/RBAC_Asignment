const Blog = require("../models/blogModel");
const User = require("../models/userModel");

class BlogController {



  async createBlog(req, res) {
    try {
      const { title, content } = req.body;
console.log("inside blog");

      const blogCreated = await Blog.create({
        title,
        content,
        author: req.user.id,
      });

      return res.status(200).json({
        status: true,
        blog: blogCreated,
        message: "Blog created successfully"
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ================= AUTHOR EDIT BLOG =================

  async editSingle(req, res) {
    try {
      console.log("edit");
      
      const blog = await Blog.findById(req.params.id);

      if (!blog || blog.author.toString() !== req.user.id) {
        return res.status(200).json({ message: "Blog not exists" });
      }

      return res.status(200).json({
        status: true,
        blog: blog,
        message: "Single Blog edit successfully"
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

  }

  async updateBlog(req, res) {

    try {

      const {title,content}=req.body;

      const blog = await Blog.findByIdAndUpdate(req.user.id,{title,content});



      if (!blog || blog.author.toString() !== req.user.id) {

        return res.status(200).json({ message: "Blog not exists" });

      }
      const blogData=await blog.save();

      return res.status(200).json({

        status: true,

        blog: blogData,

        message: "Blog update successfully"

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message: error.message,

      });

    }
  }


  async deleteBlog(req, res) {
  try {
    const blogId = req.params.id;
    const userId = req.user?.id || req.session?.user?.id; // Use the same auth source as your create/update

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this blog"
      });
    }

    await Blog.findByIdAndDelete(blogId);

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
}


  async toggleActive(req, res) {
  try {
    const blogId = req.params.id;
    const userId = req.user?.id || req.session?.user?.id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this blog"
      });
    }

    blog.isActive = !blog.isActive;
    
    const updatedBlog = await blog.save();

    return res.status(200).json({
      success: true,
      isActive: updatedBlog.isActive,
      message: `Blog is now ${updatedBlog.isActive ? 'Active' : 'Inactive'}`,
      blog: updatedBlog
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
}


  async approveBlog(req, res) {
  try {
    console.log("aop");
    
    const blogId = req.params.id;

    // 1. Update the blog and return the NEW document
    const blog = await Blog.findByIdAndUpdate(
      blogId, 
      { isApproved: true },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found. Approval failed."
      });
    }


    return res.status(200).json({
      success: true,
      message: "Blog approved successfully",
      isApproved: blog.isApproved,
      blog: blog
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
}

  async rejectBlog(req, res) {
  try {
    const blogId = req.params.id;


    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { isApproved: false },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found. Rejection failed."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog has been rejected/disapproved",
      isApproved: blog.isApproved,
      blog: blog
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
}


  async adminBlogs(req, res) {
    const blogs = await Blog.find().populate("author");

    res.render("admin/blogs", {
      blogs,
      layout: "layout/dashboard",
      user: req.session.user
    });
  }


  async publicBlogs(req, res) {
  try {
    const blogs = await Blog.find({
      isActive: true,
      isApproved: true,
    }).lean(); 

    // 2. Handle the empty state
    if (!blogs || blogs.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No public blogs found",
        count: 0,
        blogs: []
      });
    }

    // 3. Return the JSON response
    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs: blogs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching blogs: " + error.message
    });
  }
}


 async singleBlog(req, res) {
  try {
    const blogId = req.params.id;

 
    const blog = await Blog.findOne({
      _id: blogId,
      isActive: true,
      isApproved: true,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or is currently unavailable"
      });
    }

    return res.status(200).json({
      success: true,
      blog: blog
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error fetching blog: " + error.message
    });
  }
}
}

module.exports = new BlogController();