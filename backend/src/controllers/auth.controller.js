import bcrypt from "bcryptjs"
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
export const register = asyncHandler(async (req,res) => {
    const {email, password, name} = req.body
    const existingUser = await db.user.findUnique({
        where:{
            email
        }
    })
    if(existingUser){
        throw new ApiError(400,"User Already Exists");
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = await db.user.create({
        data:{
            email,
            password:hashedPassword,
            name,
            role:UserRole.USER
        }
    })
    if(!newUser){
        throw new ApiError(400,"Error while saving user");
    }
    console.log(newUser)
    const token = jwt.sign({id:newUser.id},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })

    const cookieOptions = {
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV!=="development",
        maxAge:1000*60*60*24*7
    }
    return res
        .status(201)
        .cookie("token",token,cookieOptions)
        .json(
            new ApiResponse(201,{
                id:newUser.id,
                email:newUser.email,
                name:newUser.name,
                role:newUser.role,
                image:newUser.image
            },"User Created Successfully")
        )    
})
export const login = asyncHandler(async (req,res) => {
    const {email,password} = req.body
    const user = await db.user.findUnique({
        where:{
            email
        }
    })
    if(!user){
        throw new ApiError(401,"User Not Found")
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new ApiError(401,"Invalid Password")
    }

    const token = jwt.sign({id:user.id},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })

    const cookieOptions = {
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV!=="development",
        maxAge:1000*60*60*24*7
    }
    return res
        .status(201)
        .cookie("token",token,cookieOptions)
        .json(
            new ApiResponse(201,{
                id:user.id,
                email:user.email,
                name:user.name,
                role:user.role,
                image:user.image
            },"User Logged In Successfully")
        )
})
export const logout = asyncHandler(async (req,res) => {
    const cookieOptions = {
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV!=="development",
        maxAge:1000*60*60*24*7
    }
    return res
            .status(200)
            .clearCookie("token",cookieOptions)
            .json( new ApiResponse(200,{},"User logged out successfully"));
})
export const check = asyncHandler(async (req,res) => {
    return res
            .status(200)
            .json(new ApiResponse(200,req.user,"User Authenticated Successfully"))
})