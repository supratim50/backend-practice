import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // get the user data
    // validation - not empty
    // check if user already exist : username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field 
    // ckeck for user creation
    // return res

    const {fullName, email, username, password } = req.body;
    
    if(
        [fullName, email, username, password].some(field => field === "")
    ){
        throw new ApiError(400, "All fields are required!")
    }

    const existingUser = await User.findOne(
        { $or: [{email}, {username}] }
    )

    if(existingUser) {
        throw new ApiError(409, "User is already exist.")
    }
    // console.log("Files ",req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(409, "Avatar is required!")
    }

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(500, "Something went wrong while uploading your avatar!")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    res.status(200).json(
        new ApiResponse(200, createdUser, "User is registered successfully.")
    );

})

export {registerUser}