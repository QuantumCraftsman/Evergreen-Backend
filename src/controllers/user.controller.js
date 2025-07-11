import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { refreshToken, accessToken }

  } catch (error) {
    throw new ApiError(500, "something wend wrong while generataing token")

  }
}

const registerUser = asyncHandler(async (req, res, next) => {
  //get user from frontend
  //validation - not empty
  //check if user already exists
  //check for images ,check for avataar
  //upload them to cloudinary,avatar
  //create user object -create enry in db


  //  console.log(req.body)
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) =>
    field?.trim() === "")
  ) {
    throw new ApiError(400, "all feilds are required")
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (existedUser) {
    throw new ApiError(409, "user with email and username already existes")
  }
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path


  if (!avatarLocalPath) {
    throw new ApiError(400, "avattar not found")
  }
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverimage not found")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatar) {
    throw new ApiError(400, "avater not uploaded to cloudinary")
  }
  if (!coverImage) {
    throw new ApiError(400, "coverimage not uploaded to cloudinary")

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
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registring the user")
  }
  return res.status(201).json(
    new ApiResponse(200, createdUser, "user registered user ")
  )
})
const loginuser = asyncHandler(async (req, res, next) => {
  // reqbody--Data
  // username email
  // find the user
  // password check
  // access token and refresh token
  // send cookie
  const { email, username, password } = req.body
  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (!user) {
    throw new ApiError(400, "user does not exitsts")
  }
  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "user does not exists")
  }
  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  const options = {
    httponly: true,
    secure: true
  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "user logged in successfully"
      )
    )




})
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set:
    {
      refreshToken: undefined
    }
  },
    {
      new: true
    }
  )

  const options = {
    httponly: true,
    secure: true
  }
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)



})
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized token")
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken._id)
    if (!user) {
      throw new ApiError(401, "invalid refresh tokenm")
    }
    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used")
    }
    const options = {
      httponly: true,
      secure: true
    }
    const { accessToken, refreshToken: newrefreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken }
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "some error in generating new token")

  }

})
const changeCurrentPassword = asyncHandler(async (req, res) => {  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid old password")
  }
  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"))

})
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})
const updateAccountData = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body
  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required")
  }
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        fullName, email
      }
    }, { new: true }
  ).select("-password")
  return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"))

})
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if (!avatar.url) {
    throw new ApiError(400, "avatar file is missing")
  }
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      avatar: avatar.url
    }
  }, { new: true }).select("-password")

})
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover file is missing")
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!coverImage.url) {
    throw new ApiError(400, "coverImage file is missing")
  }
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      coverImage: coverImage.url
    }
  }, { new: true }).select("-password")

})


export {
  registerUser,
  loginuser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateCoverImage
}
//    3