import express from 'express';
import { myDataSource } from './app-data-source';
import cors from 'cors';
import { auth } from './middleware/user.auth';
import cookieParser from 'cookie-parser';
import BodyParser from 'body-parser';
import userRouter from './routes/users.router'
import authRouter from './routes/auth.router'
import postRouter from './routes/post.router'
import friendRouter from './routes/friend.router'
import searchRouter from './routes/search.router'


// Initializing App
const app = express()

// Middlewares 
app.use(express.json())
app.use(cookieParser())
app.use(BodyParser.json())
app.use(cors({
    credentials: true,
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "DELETE", "PUT"]
}))
app.use(express.urlencoded({
    extended: true
}))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/search', searchRouter)
app.use(auth)
app.use('/users', userRouter)
app.use('/posts', postRouter)
app.use('/friends', friendRouter)

// Server Running
const initializeDataSource = async ()=>{
    try{
        await myDataSource
        .initialize() 
        .then(()=>{
            console.log("Data Source Has Been Initialized!")
        })
    }catch(error){
        throw new Error("failed to initialize data source "+ error.message)
    }
}

const initializingTimeout = 5000;

const serverInitializationTimeout = setTimeout(()=>{
    console.error("Server Initializing Timed out...")
    process.exit(1)
}, initializingTimeout)

initializeDataSource()
  .then(() => {
      app.listen(5000, () => {
      console.log(`Server running at http://localhost:5000`);
      clearTimeout(serverInitializationTimeout); 
    });
  })
  .catch(err => {
    console.error('Error initializing datasource:', err);
    clearTimeout(serverInitializationTimeout); 
    process.exit(1); 
  });