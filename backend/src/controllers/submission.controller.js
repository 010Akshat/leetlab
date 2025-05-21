import { asyncHandler } from "../utils/AsyncHandler.js";
import { db } from "../libs/db.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
export const getAllSubmissions =asyncHandler(async(req,res)=>{
    const userId = req.user.id;
    const submissions = await db.submission.findMany({
        where:{
            userId:userId
        }
    })
    return res.status(200).json(new ApiResponse(200,submissions,"Submissions for user fetched Successfully"));
})
export const getSubmissionsForProblem =asyncHandler(async(req,res)=>{
    const userId = req.user.id;
    const problemId = req.params.problemId;

    const submissions = await db.submission.findMany({
        where:{
            userId:userId,
            problemId:problemId
        }
    })

    return res.status(200).json(new ApiResponse(200,submissions,"Submissions for problem fetched Successfully"));
})
export const getSubmissionsCountForProblem =asyncHandler(async(req,res)=>{
    const problemId = req.params.problemId;
    const submissionsCount = await db.submission.count({
        where:{
            problemId:problemId
        }
    })
    return res.status(200).json(new ApiResponse(200,{submissionsCount:submissionsCount},"Submissions for problem fetched Successfully"))
})