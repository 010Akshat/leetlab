import { asyncHandler } from "../utils/AsyncHandler.js";
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";
import {ApiError} from "../utils/api-error.js"
import {ApiResponse} from "../utils/api-response.js"
import { getJudge0LanguageId,submitBatch,pollBatchResults} from "../libs/judge0.lib.js";
export const createProblem = asyncHandler(async(req,res)=>{
    // get the required data from request body
    const {title, description,difficulty,tags,examples,constraints,testcases,codeSnippets, referenceSolutions} = req.body
    // going to check user once again
    if(req.user.role!==UserRole.ADMIN){
        throw new ApiError(403,"Your are not allowed to  create a problem");
    }
    // loop through each reference solution for different langauges
    for(const [language,solutionCode] of Object.entries(referenceSolutions)){
        // get Judge0 Language id for the current language
        const langaugeId = getJudge0LanguageId(language);
        if(!langaugeId){
            throw new ApiError(400,`Language ${language} not supported`);
        }

        // Prepare judge0 submission for all cases
        const submissions = testcases.map(({input,output})=>({
            source_code:solutionCode,
            language_id:langaugeId,
            stdin:input,
            expected_output:output
        }))
        const submissionResults = await submitBatch(submissions)
        const tokens = submissionResults.map((res)=>res.token)
        const results = await pollBatchResults(tokens)


        for(let i=0;i<results.length;i++){
            const result = results[i];
            // if it not accepted , we will give error.
            // TODO: In future , we can add detail what specific error has arisen
            if(result.status.id!==3){
                throw new ApiError(400,`Testcase ${i+1} failed for language ${language}`)
            }
        }
    }
        // save the problem to database
        const newProblem = await db.problem.create({
            data:{
                title, description,difficulty,tags,examples,constraints,
                testcases,codeSnippets, referenceSolutions,userId:req.user.id
            }
        })
        return res
                .status(201)
                .json(new ApiResponse(201,newProblem,"Problem created Successfully"))
})
export const getAllProblems = asyncHandler(async(req,res)=>{
    const problems = await db.problem.findMany();
    if(!problems){
        throw new ApiError(404,"Error Fetching Problems")
    }
    return res
            .status(200)
            .json(new ApiResponse(200,problems,"Problems Fetched Successfully"));
})
export const getProblemById = asyncHandler(async(req,res)=>{
    const {id}=req.params
    const problem = await db.problem.findUnique(
        {
            where:{
                id
            }
        }
    )
    if(!problem){
        throw new ApiError(404,"Problem Not Found");
    }
    return res.status(200).json(new ApiResponse(201,problem,"Problem Fetched Successfully"));

})
export const updateProblem = asyncHandler(async(req,res)=>{
    // get problem Id
    const {problemId} = req.params
    const problem = await db.problem.findUnique(
        {
            where:{
                id:problemId
            }
        }
    )
    if(!problem){
        throw new ApiError(404,"Problem Not Found")
    }
    // get the required data from request body
    const {title, description,difficulty,tags,examples,constraints,testcases,codeSnippets, referenceSolutions} = req.body
    // going to check user once again
    if(req.user.role!==UserRole.ADMIN){
        throw new ApiError(403,"Your are not allowed to  create a problem");
    }
    // loop through each reference solution for different langauges
    for(const [language,solutionCode] of Object.entries(referenceSolutions)){
        // get Judge0 Language id for the current language
        const langaugeId = getJudge0LanguageId(language);
        if(!langaugeId){
            throw new ApiError(400,`Language ${language} not supported`);
        }

        // Prepare judge0 submission for all cases
        const submissions = testcases.map(({input,output})=>({
            source_code:solutionCode,
            language_id:langaugeId,
            stdin:input,
            expected_output:output
        }))
        const submissionResults = await submitBatch(submissions)
        const tokens = submissionResults.map((res)=>res.token)
        const results = await pollBatchResults(tokens)


        for(let i=0;i<results.length;i++){
            const result = results[i];
            // if it not accepted , we will give error.
            // TODO: In future , we can add detail what specific error has arisen
            if(result.status.id!==3){
                throw new ApiError(400,`Testcase ${i+1} failed for language ${language}`)
            }
        }
    }
        // save the problem to database
        const updatedProblem = await db.problem.update({
            where:{
                id:problemId
            },
            data:{
                title, description,difficulty,tags,examples,constraints,
                testcases,codeSnippets, referenceSolutions,userId:req.user.id
            }
        })
        return res
                .status(201)
                .json(new ApiResponse(201,updatedProblem,"Problem Updated Successfully"))
})
export const deleteProblem = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const problem = await db.problem.findUnique({where:{id}})
    if(!problem){
        throw new ApiError(404,"Problem Not Found")
    }
    const deletedProblem=await db.problem.delete({where:{id}});
    return res.status(200).json(new ApiResponse(200,deletedProblem,"Problem Deleted Successfully"));
    
})
export const getAllProblemsSolvedByUser = asyncHandler(async(req,res)=>{
    
})