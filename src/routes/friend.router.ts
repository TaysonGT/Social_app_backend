import {
  getFriend,
  allFriends,
  allMyFriends,
  addFriend,
  removeFriend,
  declineFriend,
  allRequests,
  acceptFriend
} from '../controllers/friends.controller'

import express from 'express';
const friendRouter = express.Router()

friendRouter.get('/all', allMyFriends)
friendRouter.get('/all/:id', allFriends)
friendRouter.get('/single/:id', getFriend)
friendRouter.delete('/single/:id', removeFriend)
friendRouter.get('/request/', allRequests)
friendRouter.post('/request/:id', addFriend)
friendRouter.put('/request/decline/:id', declineFriend)
friendRouter.put('/request/accept/:id', acceptFriend)

export default friendRouter