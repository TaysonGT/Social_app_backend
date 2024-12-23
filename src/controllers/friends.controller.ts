import { Response, Request } from "express"
import { myDataSource } from "../app-data-source";
import { User } from "../entity/user.entity";
import { Friend } from "../entity/friend.entity";
import { FriendRequest } from "../entity/friend_request.entity";
import { In } from 'typeorm'


const userRepo = myDataSource.getRepository(User)
const friendRepo = myDataSource.getRepository(Friend)
const friendRequestRepo = myDataSource.getRepository(FriendRequest)


const addFriend = async (req: Request, res: Response) => {
  const friend_id = req.params.id
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  
  if (user_data && friend_id) {
    const user_id = JSON.parse(user_data).user_id
    const friend = await userRepo.findOne({where:{id: user_id}})
    const isFriend = await friendRepo.findOne({where:{user_id, friend_id}})
    const isFriendRequest = await friendRequestRepo.findOne({where:{sender_id: user_id, receiver_id:friend_id, status: 'pending'}})
    if(friend_id == user_id){
      res.json({success: false, message: "لا يمكنك ارسال طلب صداقة لنفسك"})
    }else if(!friend){
      res.json({success: false, message: "هذا المستخدم غير موجود"})
    }else if(isFriend){
      res.json({success: false, message: "هذا المستخدم صديقك بالفعل"})
    }else if(isFriendRequest){
      res.json({success: false, message: "لقد أرسلت طلب صداقة لهذا المستخدم من قبل"})
    }else{
      const friendRequestData = {sender_id: user_id, receiver_id:friend_id}
      const friendRequest = friendRequestRepo.create(friendRequestData)
      await friendRequestRepo.save(friendRequest)
      res.json({success: true, message: "تم إرسال طلب الصداقة"})
    }
  }else{
    res.json({success:false, message: "برجاء تسجيل الدخول مرة أخرى"})
  }
  
}
const removeFriend = async (req: Request, res: Response) => {
  const friend_id = req.params.id
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  
  if (user_data && friend_id) {
    const user_id = JSON.parse(user_data).user_id
    const friend = await userRepo.findOne({where:{id:user_id}})
    const isFriend = await friendRepo.findOne({where:{user_id, friend_id}})
    if(!friend){
      res.json({success: false, message: "هذا المستخدم غير موجود"})
    }else if(isFriend){
      const meAsAFriend = await friendRepo.findOne({where: {user_id: friend_id, friend_id:user_id}})
      if(meAsAFriend) await friendRepo.remove(meAsAFriend)
      await friendRepo.remove(isFriend)
      res.json({success: true, message: "تم حذف صديق"})
    }else{
      res.json({success: false, message: "هذا المستخدم ليس من ضمن قائمة أصدقائك"})
    }
  }else{
    res.json({success:false, message: "برجاء تسجيل الدخول مرة أخرى"})
  }
  
}
const allMyFriends = async (req: Request, res: Response) => {
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  if(user_data){
    const user_id = JSON.parse(user_data).user_id
    const friends = await friendRepo.find({where:{user_id}})
    if(friends){
      const usersIds = friends.map((friend)=> friend.friend_id)
      const users = await userRepo.find({where: { id: In(usersIds)}})
      res.json({users})
    }
  }else res.json({success:false, message:"من فضلك سجل دخول مرة أخرى"})
}

const allFriends = async (req: Request, res: Response) => {
  const user_id = req.params.id
  if(user_id){
    const friends = await friendRepo.find({where:{user_id}})
    if(friends){
      const usersIds = friends.map((friend)=> friend.friend_id)
      const users = await userRepo.find({where: { id: In(usersIds)}})
      res.json({users})
    }
  }else res.json({success:false, message:"هذا المستخدم غير موجود"})
}

const getFriend = async (req: Request, res: Response) => {
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  const friend_id = req.params.id
  if(user_data && friend_id){
    const user_id = JSON.parse(user_data).user_id
    const friend = await friendRepo.find({where:{user_id, friend_id}})
    res.json({friend})
  }else res.json({success:false, message:"من فضلك سجل دخول مرة أخرى"})
}

const declineFriend = async (req: Request, res: Response) => {
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  const id = req.params.id
  if(user_data && id){
    const friendRequest = await friendRequestRepo.find({where:{id, status: 'pending'}})
    if(friendRequest){
      const declineRequest = Object.assign(friendRequest, {status: 'declined'})
      await friendRequestRepo.save(declineRequest)
      res.json({success: true, message: "تم رفض طلب الصداقة"})
    }
  }else res.json({success:false, message:"من فضلك سجل دخول مرة أخرى"})
}

const acceptFriend = async (req: Request, res: Response) => {
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  const id = req.params.id
  if(user_data && id){
    const user_id = JSON.parse(user_data).user_id
    const friendRequest = await friendRequestRepo.findOne({where:{id, status: 'pending'}})
    if(friendRequest){
      const friend = await userRepo.findOne({where:{id: friendRequest.sender_id}})
      if(friend){
        const acceptRequest = Object.assign(friendRequest, {status: 'accepted'})
        const myFriendData = {user_id, friend_id: friendRequest.sender_id}
        const hisFriendData = {user_id: friendRequest.sender_id, friend_id: user_id}
        
        await friendRequestRepo.save(acceptRequest)
        await friendRepo.save(myFriendData)
        await friendRepo.save(hisFriendData)
        res.json({success: true, message: ` أنت و${friend.firstname} أصبحتما أصدقاء`})
      }else res.json({success:false, message:"هذا المستخدم غير موجود"})
    }else res.json({success:false, message:"من فضلك سجل دخول مرة أخرى"})
  }else res.json({success:false, message:"من فضلك سجل دخول مرة أخرى"})
}

const allRequests = async (req: Request, res: Response) => {
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  if(user_data){
    const user_id = JSON.parse(user_data).user_id
    const requests = await friendRequestRepo.find({where:{receiver_id:user_id, status:'pending'}})
    if(requests){
      const usersIds = requests.map((friendRequest)=> friendRequest.sender_id)
      const users = await userRepo.find({where: { id: In(usersIds)}})
      res.json({requests, users})
    }
  }
}
const allMyRequests = async (req: Request, res: Response) => {
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  if(user_data){
    const user_id = JSON.parse(user_data).user_id
    const requests = await friendRequestRepo.find({where:{sender_id:user_id, status:'pending'}})
    if(requests){
      const usersIds = requests.map((friendRequest)=> friendRequest.sender_id)
      const users = await userRepo.find({where: { id: In(usersIds)}})
      res.json({requests, users})
    }
  }
}

const getRequest = async (req: Request, res: Response) => {
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  const friend_id = req.params.id
  if(user_data && friend_id){
    const user_id = JSON.parse(user_data).user_id
    const request = await friendRequestRepo.findOne({where:{sender_id:user_id, receiver_id:friend_id, status: 'pending'}})
    res.json({request})
  }else res.json({success:false, message:"من فضلك سجل دخول مرة أخرى"})
}

const removeRequest = async (req: Request, res: Response) => {
  const user_data = req.headers.user_data?.toString().split(' ')[1]
  const id = req.params.id
  if(user_data && id){
    const user_id = JSON.parse(user_data).user_id
    const request = await friendRequestRepo.findOne({where:{id, sender_id:user_id}})
    if(request){
      await friendRequestRepo.remove(request)
      res.json({success: true, message:"تم حذف الطلب"})
    }else res.json({success: false, message: 'هذا الطلب غير موجود'})
  }else res.json({success:false, message:"من فضلك سجل دخول مرة أخرى"})
}


export{
  getFriend,
  allMyFriends,
  allFriends,
  allRequests,
  allMyRequests,
  getRequest,
  addFriend,
  removeFriend,
  declineFriend,
  acceptFriend,
  removeRequest
}