const express = require('express');
const apiRouter = express.Router();

const usersRouter = require('./users');
const postsRouter = require('./post');
const tagsRouter = require('./tags');
apiRouter.use('/users', usersRouter);

//const postsRouter = require()
apiRouter.use('/post', postsRouter)

apiRouter.use('/tags', tagsRouter)

module.exports = apiRouter;