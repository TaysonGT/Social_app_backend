import {
  getFriend,
  allFriends,
  allMyFriends,
  addFriend,
  removeFriend,
  declineFriend,
  allRequests,
  allMyRequests,
  getRequest,
  removeRequest,
  acceptFriend
} from '../controllers/friends.controller'

import express from 'express';
const friendRouter = express.Router()

friendRouter.delete('/:id', removeFriend)
friendRouter.get('/all', allMyFriends)
friendRouter.get('/all/:id', allFriends)
friendRouter.get('/single/:id', getFriend)
friendRouter.get('/request/all', allRequests)
friendRouter.get('/request/me', allMyRequests)
friendRouter.get('/request/:id', getRequest)
friendRouter.post('/request/:id', addFriend)
friendRouter.delete('/request/:id', removeRequest)
friendRouter.put('/request/decline/:id', declineFriend)
friendRouter.put('/request/accept/:id', acceptFriend)

export default friendRouter