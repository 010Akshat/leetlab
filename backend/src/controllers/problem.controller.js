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
            langauge_id:langaugeId,
            stdin:input,
            expected_output:output
        }))

        const submissionResults = submitBatch(submissions)
        const tokens = submissionResults.map((res)=>res.token)
        const results = pollBatchResults(tokens)

        for(let i=0;i<results.length;i++){
            const result = results[i];
            if(result.status.id!==3){
                throw new ApiError(400,`Testcase ${i+1} failed for language ${language}`)
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
    }
})
export const getAllProblems = asyncHandler(async(req,res)=>{})
export const getProblemById = asyncHandler(async(req,res)=>{})
export const updateProblem = asyncHandler(async(req,res)=>{})
export const deleteProblem = asyncHandler(async(req,res)=>{})
export const getAllProblemsSolvedByUser = asyncHandler(async(req,res)=>{})