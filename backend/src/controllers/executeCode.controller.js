import { pollBatchResults, submitBatch , getLanguageName } from "../libs/judge0.lib.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { db } from "../libs/db.js";
export const executeCode = asyncHandler(async(req,res)=>{
    const {source_code, language_id,stdin,expected_outputs,problemId} = req.body
    const userId = req.user.id

    // Validate test cases
    if(
        !Array.isArray(stdin) ||
        stdin.length === 0 ||
        !Array.isArray(expected_outputs) ||
        expected_outputs.length !== stdin.length
    ){
        throw new ApiError(400,"Invalid or missing test cases");
    }

    // Prepare each test case for judge0 batch submission
    const submissions = stdin.map((input)=>({
        source_code,
        language_id,
        stdin:input
    }))

    // Send batch of submissions to judge0 
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((res)=>res.token);

    // Poll judg0 for results of all submitted test cases
    const results = await pollBatchResults(tokens);

    console.log("Results-------------------")
    console.log(results);
/*
[
  {
    stdout: '300\n',
    time: '0.11',
    memory: 14616,
    stderr: null,
    token: '91ded9c7-fa2c-4cee-9784-c2ef3a6f6196',
    compile_output: null,
    message: null,
    status: { id: 3, description: 'Accepted' }
  },
  {
    stdout: '-1100\n',
    time: '0.116',
    memory: 16236,
    stderr: null,
    token: 'd87fcba7-de4a-4f42-9c7a-77b3666eb0b9',
    compile_output: null,
    message: null,
    status: { id: 3, description: 'Accepted' }
  }
]
This output has ben written so that further code can be understood.
*/
    // Analyze test case result
    let allPassed = true;
    // TODO: This will not ensure all cases ex- Any one output is correct 
    const detailedResults = results.map((result,i)=>{
        const stdout = result.stdout?.trim();
        const expected_output = expected_outputs[i];
        const passed = stdout === expected_output;

        // console.log(`Testcase #${i+1}`)
        // console.log(`Input: ${stdin[i]}`)
        // console.log(`Expected Output for testcase: ${expected_output}`)
        // console.log(`Actual Output: ${stdout}`)

        // console.log(`Matched : ${passed}`)

        if(!passed)allPassed=false;

        return {
            testCase:i+1,
            passed,
            stdout,
            expected:expected_output,
            stderr:result.stderr || null,
            compile_output:result.compile_output || null,
            status:result.status.description,
            memory:result.memory ? `${result.memory} KB`:undefined,
            time:result.time ? `${result.time} s`:undefined
        }
    })

    console.log(detailedResults)

    // save in submission table 
    const submission = await db.submission.create({
        data:{
            userId,
            problemId,
            sourceCode:source_code,
            language:getLanguageName(language_id),
            stdin:stdin.join("\n"),
            stdout: JSON.stringify(detailedResults.map((r)=>r.stdout)),
            stderr: detailedResults.some((r)=>r.stderr)?JSON.stringify(detailedResults.map((r)=>r.stderr)):null,
            compileOutput:detailedResults.some((r)=>r.compile_output)?JSON.stringify(detailedResults.map((r)=>r.compile_output)):null,
            status:allPassed?"Accepted":"Wrong Answer",
            memory:detailedResults.some((r)=>r.memory)?JSON.stringify(detailedResults.map((r)=>r.memory)):null,
            time:detailedResults.some((r)=>r.time)?JSON.stringify(detailedResults.map((r)=>r.time)):null,
        }
    })

/*
In Prisma, the upsert method is a powerful operation that combines the functionality of both update and create.
It checks whether a record exists based on a unique identifier:
If the record exists: It updates the existing record with the provided data.
If the record does not exist: It creates a new record with the specified data.
*/
    // Id allPassed = true , mark problem as solved for current user
    if(allPassed){
        await db.problemSolved.upsert({
            where:{
                userId_problemId:{
                    userId , problemId
                }
            },
            update:{},
            create:{
                userId,problemId
            }
        })
    }
    
    // Save individual test case results using detailedResult
    const testCaseResults = detailedResults.map((result)=>(
        {
            submissionId:submission.id,
            testCase:result.testCase,
            passed:result.passed,
            stdout:result.stdout,
            expected:result.expected,
            stderr:result.stderr,
            compileOutput:result.compile_output,
            status:result.status,
            memory:result.memory,
            time:result.time
        }
    ))
    await db.testCaseResult.createMany({
        data:testCaseResults
    })

    const submissionWithTestCase = await db.submission.findUnique({
        where:{
            id:submission.id
        },
        include:{
            testCases:true
        }
    })
    return res.status(200).json(new ApiResponse(200,submissionWithTestCase,"Code Executed"))
})

