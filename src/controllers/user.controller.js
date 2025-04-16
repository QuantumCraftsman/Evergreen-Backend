import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

 

const registerUser = asyncHandler(async(req,res,next)=>{
   //get user from frontend
   //validation - not empty
   //check if user already exists
   //check for images ,check for avataar
   //upload them to cloudinary,avatar
   //create user object -create enry in db


   console.log(req.body)
   const{fullName,email,username,password} = req.body;
  
   if([fullName,email,username,password].some((field)=>
   field?.trim()==="")
){
    throw new ApiError(400,"all feilds are required")
   }
    const existedUser =  await User.findOne({
    $or: [{username},{email}]
   })
   if(existedUser){
    throw new ApiError(409,"user with email and username already existes")
   }
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

   
    if(!avatarLocalPath ){
        throw  new ApiError(400,"avattar not found")
    }
    if(!coverImageLocalPath){
        throw  new ApiError(400,"coverimage not found")
    }
      const avatar = await  uploadOnCloudinary(avatarLocalPath)
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)
      if(!avatar){
        throw  new ApiError(400,"avater not uploaded to cloudinary")
      }
      if(!coverImage){
        throw  new ApiError(400,"coverimage not uploaded to cloudinary")

      }
      const user = await User.create({
        fullName: fullName.trim(),
        avatar: avatar.url,
        coverImage: coverImage.url,
        email: email.trim().toLowerCase(),
        password,
        username: username.trim().toLowerCase()
      });
      
      const createdUser = await User.findById(user._id).select("-password -refreshToken")
if(!createdUser){
    throw  new ApiError(500,"something went wrong while registring the user")
}
return res.status(201).json(
    new ApiResponse(200, createdUser ,"user registered user ")
)
})


export {registerUser}
