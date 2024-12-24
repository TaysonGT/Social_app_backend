import { Response, Request } from "express"
import { myDataSource } from "../app-data-source";
import { User } from "../entity/user.entity";
import { Post } from "../entity/post.entity";

const postRepo = myDataSource.getRepository(Post)
const userRepo = myDataSource.getRepository(User)

const normal = async (req: Request, res: Response) => {
  const query = req.query.query
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  
  if(user_data){
    const user_id = JSON.parse(user_data).user_id 
    const users = await userRepo
      .createQueryBuilder('users')
      .where('users.username LIKE :query', { query: `%${query}%` })
      .orWhere('users.firstname LIKE :query', { query: `%${query}%` })
      .orWhere('users.lastname LIKE :query', { query: `%${query}%` })
      .getMany();
    if(users){
      const filteredUsers = users.filter((user)=> user.id != user_id)
      const userIds = filteredUsers.map(user=> user.id)
      const posts = await postRepo
        .createQueryBuilder('posts')
        .where('posts.content LIKE :query', { query: `%${query}%` })
        .orWhere('posts.user_id In (:...userIds)', {userIds})
        .getMany();
        res.json({ posts: posts.sort((a,b)=> new Date(b.created_at) - new Date(a.created_at)), users: filteredUsers})
    }else res.json({success: false, message: "حدث خطأ"})
  }
}

export {
  normal
}