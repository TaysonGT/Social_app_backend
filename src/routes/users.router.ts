import {
  allUsers,
  usersRange,
  findUser,
  updateUser,
  deleteUser,
} from '../controllers/users.controller'
import express from 'express';
const userRouter = express.Router()

userRouter.get('/', allUsers);
userRouter.post('/range', usersRange);
userRouter.get('/:id', findUser);
userRouter.delete('/:id', deleteUser);
userRouter.put('/:id', updateUser);

export default userRouter;