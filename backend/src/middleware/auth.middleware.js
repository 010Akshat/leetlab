import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { db } from "../libs/db.js"
export const authMiddleware = asyncHandler(async (req, res, next)=>{
    const token = req.cookies?.token
    if(!token){
        throw new ApiError(400,"Unauthorized request");
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const user = await db.user.findUnique({
            where:{
                id:decoded.id
            },
            select:{
                id:true,
                image:true,
                name:true,
                email:true,
                role:true
            }
        })
        if(!user){
            throw new ApiError(404,"User Not Found");
        }
        req.user=user;
        next();
    } catch (error) {
        console.log(error)
        throw new ApiError(400,"Invalid Token")
    }
})