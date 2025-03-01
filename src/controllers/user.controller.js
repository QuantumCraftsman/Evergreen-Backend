import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asyncHandler(async(req,res) =>{
    //get user details from 

    const {fullName,email,username,password}= req.body
    console.log(email);

    if (
        [fullName,email,username,password].some((field)=>
            field?.trim() === "")
    )
    {
        throw new ApiError(400,"all fields are required")
    }

    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if (existedUser){
        throw new ApiError(409,"username and email already present in the database")
    }
     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath = req.files?.coverImage[0]?.path;

     if (!avatarLocalPath){
        throw new ApiError(404,"avatar file is required")
     }

     if (!coverImageLocalPath){
        return ""
     }
     const avatar =  await uploadOnCloudinary(avatarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

     if(!avatar){
        throw new ApiError(404,"avatar file is required")

     }
     if(!coverImage){
        return ""
     }
    const user =  await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage.url,
        email,
        password,
        username:username.toLowerCase()
     })
     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"user has not been created")
    }
    return req.status(201).json(
        new ApiResponse(200,createdUser,"user is not register")
    )

     

    
})

export {registerUser}
