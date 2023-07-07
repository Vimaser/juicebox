const express = require("express");
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require("../db");
const { requireUser } = require("./utils");
const { post } = require("./users");

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/);
  const postData = {
    authorId: req.user.id,
    title,
    content,
  };

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    const post = await createPost(postData);
    // this will create the post and the tags for us
    if (post) {
      res.send({ post });
    } else {
      next({ name: "Error", message: "Failed to create post" });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");
  next();
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();
  res.send({ posts });
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatePost });
    } else {
      next(
        post
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete a post which is not yours",
            }
          : {
              name: "PostNotFoundError",
              message: "That post does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//console.log('Testing console.log');


postsRouter.get('/', async (req, res, next) => {
  try {
    const allPosts = await getAllPosts();
    //console.log('All posts:', allPosts);

    const posts = allPosts.filter(post => {
      //console.log('Filtering post:', post);
      if (post.active) {
        //console.log('Post is active:', post);
        return true;
      }
    
    
      if (req.user && post.author.id === req.user.id) {
        //console.log('Post belongs to current user:', post);
        return true;
      }
    
      //console.log('Post is not active and does not belong to current user:', post);
      return false;
    });

    //console.log('Filtered posts:', posts);

    res.send({
      posts
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});



module.exports = postsRouter;