import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.toString().split(' ')[1]
    if(token && token!='undefined'){ 
      const verify = jwt.verify(token, "something-complicated")
      verify? next() : res.json({message: "Invalid Session! Please Logout and Sign In again...", success: false})
    }else{
        res.json({success: false, message:"من فضلك سجل دخولك مرة أخرى"})
    }
}

export const checkPermission = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.headers.user_id?.toString()
    const user_id = req.params.user_id.toString()
    if(id == user_id){
      next()
    }else{
        res.json({success: false, message: "لا تملك الصلاحيات لهذا الامر"})
    }
}