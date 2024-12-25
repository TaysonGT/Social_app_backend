import { Response, Request } from "express"
import { myDataSource } from "../app-data-source";
import { User } from "../entity/user.entity";
import jwt from "jsonwebtoken";
import {In} from 'typeorm'

const userRepo = myDataSource.getRepository(User)

const userSignup = async (req: Request, res: Response) => {
  const { username, password, email, firstname, lastname, gender } = req.body;
  if (username && password && email && firstname && lastname && gender) {
    const trimmedPass = password.trim();
    const trimmedUser = username.trim();
    const user = await userRepo.createQueryBuilder("users")
      .where("LOWER(users.username) = LOWER(:query)", {
        query:
          `${trimmedUser}`
      })
      .getOne();
    if (trimmedPass.length < 6) {
      res.json({ message: "كلمة السر يجب ان تتكون من 6 حروف على الاقل", success: false });
    }
    else if (user) {
      res.json({ message: "هذا المستخدم موجود بالفعل", success: false });
    }
    else {
      const userData = { username: trimmedUser, password: trimmedPass, firstname, lastname, email, gender };
      const user = userRepo.create(userData);
      await userRepo.save(user);
      const {password, ...safeUser} = user
      const token = jwt.sign({ trimmedUser }, "something-complicated", { expiresIn: '8h' })
      res.json({ messsage: "تم إنشاء حسابك بنجاح", success: true, token, user: safeUser, expDate: Date.now() + 8 * 60 * 60 * 1000 })
    }
  }
  else
    res.json({ message: "برجاء ادخال جميع البيانات", success: false });
}

const findUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userRepo.findOne({ where: { id } });
  if(user){
    let {password, ...safeUser} = user 
    res.json({ user: safeUser, success:true}) 
  }else{
    res.json({ message: "هذا المستخدم غير موجود", success: false });
    
  }
    
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const users = await userRepo.find();
  const user = await userRepo.findOne({ where: { id } });
  if (users.length < 2) {
    res.json({ message: "لا يوجد مستخدمين آخرين ", success: false });
  } else if (user) {
    const results = await userRepo.remove(user);
    res.json({ results, message: "تمت إزالة المستخدم بنجاح", success: true });
  } else {
    res.json({ message: "هذا الحساب غير موجود", success: false });
  }
}

const updateUser = async (req: Request, res: Response) => {
  const { id, username, password, email, firstname, lastname } = req.body;
  const user = await userRepo.findOne({ where: { id } });
  let pwd:string = password? password: '';
  if (user) {
    if (!password && !username && !email && firstname && lastname ){
      res.json({ message: "لم يتم إدخال أي بيانات", success: false });
    }
    else if (password && pwd.length < 6) {
      res.json({ message: "كلمة السر يجب ان تتكون من 6 حروف على الاقل", success: false });
    } else {
      const userData = { username, password, firstname, lastname, email };
      const updatedUser = Object.assign(user, userData);
      const updated = await userRepo.save(updatedUser);
      const {password: userPassword, ...safeUpdated} = updated
      res.json({ success: true, user: safeUpdated, message: "تم تعديل الحساب" });
    }
  }
  else res.json({ success: false, message: "حدث خطأ" });
}

const userLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const trimmedPass:string = password.trim();
  const trimmedUser:string = username.trim();
  const user = await userRepo.createQueryBuilder("users")
    .where("LOWER(users.username) = LOWER(:query)", { query: `${trimmedUser}` })
    .getOne();
  if(!username && !password){
    res.json({ message: "برجاء ملء كل البيانات", success: false })
  }else if (user) {
    const {password, ...safeUser} = user
    if (user.password == trimmedPass) {
      const token = jwt.sign({ trimmedUser }, "something-complicated", { expiresIn: '8h' })
      res.json({ messsage: "تم تسجيل الدخول بنجاح ", success: true, token, user: safeUser, expDate: Date.now() + 8 * 60 * 60 * 1000 })
    } else {
      res.json({ message: "كلمة السر خطأ", success: false })
    }
  } else {
    res.json({ message: "مستخدم غير موجود", success: false })
  }
}


const allUsers = async (req: Request, res: Response) => {
  const users = await userRepo.find()
  const safeUsers = users.map(({password, ...rest})=>  rest )
  res.json({ users: safeUsers })
}

const usersRange = async (req: Request, res: Response) => {
  const {ids} = req.body
  if(ids){
    const users = await userRepo.find({where: {id: In(ids)}})
    const safeUsers = users.map(({password, ...rest})=>  rest )
    res.json({users: safeUsers})
  }
}

export {
  deleteUser,
  userSignup,
  userLogin,
  updateUser,
  allUsers,
  usersRange,
  findUser,
  
}