import {
  normal
} from '../controllers/search.controller'
import express from 'express';

const searchRouter = express.Router()

searchRouter.get('/', normal)

export default searchRouter