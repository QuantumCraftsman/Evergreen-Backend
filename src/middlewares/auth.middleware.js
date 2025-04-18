
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
 const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
     const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") 
     if(!token){
         throw new ApiError(401,"unauthorized request")
     }
      const decodedToken = jwt.verify(token,process.env.ACESS_TOKEN_SECRET)
       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
       if(!user){
         throw new ApiError(401,"invalid access token")
       }
       req.user =user;
       next()
   } catch (error) {
    throw new ApiError(401,error?.message||"inavalid access token")
    
   }
})
export {verifyJWT}