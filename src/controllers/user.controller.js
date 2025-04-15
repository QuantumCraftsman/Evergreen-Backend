import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

 

const registerUser = asyncHandler(async(req,res,next)=>{
    res.status(200).json({
        message:"ok"
    })
})

export {registerUser}
