import {
  allPosts,
  allUserPosts,
  addPost,
  getPost,
  updatePost,
  deletePost,
  addComment,
  updateComment,
  deleteComment,
  allComments,
  toggleLike,
  getLikes
} from '../controllers/posts.controller'
import express from 'express';
const postRouter = express.Router()

postRouter.post('/', addPost);
postRouter.get('/all', allPosts);
postRouter.get('/all/:id', allUserPosts);
postRouter.get('/:id', getPost);
postRouter.put('/:id', updatePost);
postRouter.delete('/:id', deletePost);
postRouter.post('/like/:type/:id', toggleLike);
postRouter.get('/like/:type/:id', getLikes);
postRouter.get('/comment/all/:id', allComments);
postRouter.post('/comment', addComment);
postRouter.put('/comment/:id', updateComment);
postRouter.delete('/comment/:id', deleteComment);


export default postRouter;