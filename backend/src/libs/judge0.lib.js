import axios from "axios";
import { ApiError } from "../utils/api-error.js";
export const getJudge0LanguageId = (language)=>{
    const languageMap = {
        "PYTHON":71,
        "JAVA":62,
        "JAVASCRIPT":63,
        "C++":54
    }
    return languageMap[language.toUpperCase()];
}

export const submitBatch = async(submissions)=>{
      try {
        const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{
            submissions
        })
    
        console.log("Submission Results: ", data);
        return data;//[{token},{token},{token}]
      } catch (error) {
        console.log(error.status ,error.message)
        throw new ApiError(error.status || 500,error.message || "Internal Server Error");
      }
}


const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve,ms));
// Polling 
/* 
You are asking a endpoint again and again , if work is done or not (Baar Baar ungli karna) after regular interval
*/
export const pollBatchResults = async(tokens)=>{
    while(true){
        let Data;
        try {
          const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
              params:{
                  tokens:tokens.join(","),
                  base64_encoded:false
              }
          })
          Data=data;
        } catch (error) {
            console.log(error.status ,error.message)
            throw new ApiError(error.status || 500,error.message || "Internal Server Error");
        }
/*
console.log(Data);
Example of data returned after passing token to this endpoint
{
  submissions: [
    {
      stdout: null,
      time: null,
      memory: null,
      stderr: null,
      token: '2654d57b-3cec-4e15-a1b3-9b79828cd2e5',
      compile_output: null,
      message: null,
      status: {id:3 , description:'Accepted'}
    },
    {
      stdout: null,
      time: null,
      memory: null,
      stderr: null,
      token: '438e1b14-a0f6-47af-8176-7f7528b8f00f',
      compile_output: null,
      message: null,
      status: {id:3 , description:'Accepted'}
    }
*/
        const results = Data.submissions;
        const isAllDone = results.every(
            (r)=> r.status.id!==1 && r.status.id!==2  // Every testcase is processed , result can be anything
        )

        if(isAllDone){
            return results
        }
        await sleep(1000);
    }
}

export function getLanguageName(languageId){
  const LANGUAGE_NAMES={
    63:"JavaScript",
    71:"Python",
    62:"Java",
    54:"C++"
  }
  return LANGUAGE_NAMES[languageId] || "Unknown";
}

/* Possible Statuses:
[
  {
    "id": 1,
    "description": "In Queue"
  },
  {
    "id": 2,
    "description": "Processing"
  },
  {
    "id": 3,
    "description": "Accepted"
  },
  {
    "id": 4,
    "description": "Wrong Answer"
  },
  {
    "id": 5,
    "description": "Time Limit Exceeded"
  },
  {
    "id": 6,
    "description": "Compilation Error"
  },
  {
    "id": 7,
    "description": "Runtime Error (SIGSEGV)"
  },
  {
    "id": 8,
    "description": "Runtime Error (SIGXFSZ)"
  },
  {
    "id": 9,
    "description": "Runtime Error (SIGFPE)"
  },
  {
    "id": 10,
    "description": "Runtime Error (SIGABRT)"
  },
  {
    "id": 11,
    "description": "Runtime Error (NZEC)"
  },
  {
    "id": 12,
    "description": "Runtime Error (Other)"
  },
  {
    "id": 13,
    "description": "Internal Error"
  },
  {
    "id": 14,
    "description": "Exec Format Error"
  }
]
*/