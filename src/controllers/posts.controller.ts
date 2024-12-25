import { Response, Request } from "express"
import { myDataSource } from "../app-data-source";
import { Post } from "../entity/post.entity";
import { Like } from "../entity/like.entity";
import { Comment } from "../entity/comment.entity";
import { addPostDto } from "../dto/add-post.dto"
import { addLikeDto } from "../dto/add-like.dto"
import { addCommentDto } from "../dto/add-comment.dto"

const postRepo = myDataSource.getRepository(Post)
const commentRepo = myDataSource.getRepository(Comment)
const likeRepo = myDataSource.getRepository(Like)

const allPosts = async (req: Request, res: Response) => {
  const posts = await postRepo.find()
  res.json({ posts: posts.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at))})
}

const allUserPosts = async (req: Request, res: Response) => {
  const id = req.params.id
  if(id){
    const posts = await postRepo.find({where: {user_id:id}})
    res.json({ posts: posts.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at))})
  } else res.json({ success: false, message: "حدث خطأ" });
}

const addPost = async (req: Request, res: Response) => {
  const { content } = req.body;
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  
  if (content&&user_data) {
      const user_id = JSON.parse(user_data).id
      const postData:addPostDto = { user_id, content };
      const post = postRepo.create(postData);
      const results = await postRepo.save(post);
      res.json({ results, message: "تم النشر", success: true });
  }
  else
    res.json({ message: "برجاء ادخال محتوى للمنشور", success: false });
}

const getPost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await postRepo.findOne({ where: { id } });
  const comments = await commentRepo.find({where: { post_id: id }})
  const likes = await likeRepo.find({where: { post_id: id }})
  post ? res.json({ post, comments, likes }) : res.json({ message: "هذا المنشور غير موجود", success: false });
};

const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await postRepo.findOne({ where: { id } });
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  if (post && user_data) {
    const user_id = JSON.parse(user_data).id
    if(user_id != post.user_id){
      res.json({ message: "لا تملك الصلاح لتنفيذ الامر", success: false });
    } else {
      const deletedPost = await postRepo.remove(post);
      const deletedComments = await commentRepo.delete({post_id: post.id});
      const deletedLikes = await likeRepo.delete({post_id: post.id})
      res.json({ deletedPost, deletedComments, deletedLikes , message: "تمت إزالة المنشور بنجاح", success: true });
    }
  } else {
    res.json({ message: "هذا المنشور غير موجود", success: false });
  }
}

const updatePost = async (req: Request, res: Response) => {
  const { content } = req.body;
  const { id } = req.params;
  const post = await postRepo.findOne({ where: { id } });
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  
  if(post && user_data){
    const user_id = JSON.parse(user_data).id
    if( user_id != post.user_id ){
      res.json({ message: "لا تملك الصلاحيات لتنفيذ الامر", success: false });
    } else if (!content || content!='' || content.trim() == post.content.trim()){
        res.json({ message: "لم يتم إدخال أي بيانات", success: false });
    } else {
      const postData:addPostDto = { content, user_id: post.user_id };
      const updatedPost = Object.assign(post, postData);
      const updated = await postRepo.save(updatedPost);
      res.json({ success: true, updated, message: "تم تعديل المنشور" });
    }
  } else res.json({ success: false, message: "المنشور غير موجود" });
}

const allComments = async (req: Request, res: Response) => {
  const { id } = req.params
  const post = await postRepo.findOne({where: {id}})
  if (post){
    const comments = await commentRepo.find({where: {post_id: id}})
    res.json({ comments, success:true })  
  }else{
    res.json({ success: false, message: "المنشور غير موجود" });
  }
}

const addComment = async (req: Request, res: Response) => {
  const { content } = req.body;
  const { id } = req.params
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  if (content && user_data) {
    const user_id = JSON.parse(user_data).id
    const commentData:addCommentDto = { user_id, post_id: id , content };
    const comment = commentRepo.create(commentData);
    const results = await commentRepo.save(comment);
    res.json({ results, message: "تم التعليق", success: true });
  }
  else
    res.json({ message: "برجاء ادخال محتوى للتعليق", success: false });
}

const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params
  const { content } = req.body
  const comment = await commentRepo.findOne({ where: { id } })
  if (comment){
    if(content == comment.content || !content){
      res.json({ success: false, message: "برجاء ادخال بيانات" });
    }else{
      const commentData:addCommentDto = { content, user_id: comment.user_id, post_id: comment.post_id };
      const updatedComment = Object.assign(comment, commentData);
      const updated = await commentRepo.save(updatedComment);
      res.json({ success: true, updated, message: "تم تعديل التعليق" });
    }
  }else{
    res.json({ success: false, message: "التعليق غير موجود" }); 
  }
}

const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const comment = await commentRepo.findOne({ where: { id } });
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  if (comment && user_data) {
    const user_id = JSON.parse(user_data).id
    if(user_id != comment.user_id){
      res.json({ message: "لا تملك الصلاح لتنفيذ الامر", success: false });
    } else{
      const deletedComment = await commentRepo.remove(comment);
      const deletedLikes = await likeRepo.delete({comment_id: id})
      res.json({ deletedComment, deletedLikes, message: "تمت ازالة التعليق بنجاح", success: true });
    }
  } else {
    res.json({ message: "هذا التعليق غير موجود", success: false });
  }
}

const toggleLike = async (req: Request, res: Response) => {
  const { id, type } = req.params
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  let user_id = ''
  let duplicate = null
  
  if(user_data) user_id = JSON.parse(user_data).user_id;
  if(type == 'post'){
    duplicate = await likeRepo.findOne({ where : { user_id, post_id: id }})
  }else{
    duplicate = await likeRepo.findOne({ where : { user_id, comment_id: id }})
  }
  
  if (!duplicate && user_id) {
    let likeData:addLikeDto = {user_id, type, comment_id:null, post_id: null};
    if (type == 'post') {
      likeData.post_id = id
    }else{
      likeData.comment_id= id 
    }
    const createLike = likeRepo.create(likeData);
    const like = await likeRepo.save(createLike);
    res.json({ like, message: "تم الاعجاب", success: true });
  }else if(duplicate && user_data){
    const user_id = JSON.parse(user_data).id
    if(user_id != duplicate.user_id){
      res.json({ message: "لا تملك الصلاح لتنفيذ الامر", success: false });
    }else{
      const like = await likeRepo.remove(duplicate);
      res.json({ like , message: "تمت ازالة الاعجاب بنجاح", success: true });
    } 
  }
  else
    res.json({ message: "حدث خطأ", success: false });
}

const getLikes = async (req: Request, res: Response) => {
  const { id, type } = req.params
  let likes:any = []
  if(type=='post'){
    likes = await likeRepo.find({where: {post_id: id}})
  }else{
    likes = await likeRepo.find({where: {comment_id: id}})
  }
  res.json({likes})
}

export {
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
}