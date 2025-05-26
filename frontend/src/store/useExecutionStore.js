import {create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { Languages } from "lucide-react";

export const useExecutionStore = create((set)=>({
    isExecuting:false,
    submission:null,

    executeCode : async(source_code, language_id,stdin,expected_outputs, problemId)=>{
        try{
            set({isExecuting:true})

            console.log("Submission:",JSON.stringify({
                source_code, language_id,stdin,expected_outputs, problemId
            }))
            const res =  await axiosInstance.post("/execute-code",{source_code, language_id,stdin,expected_outputs, problemId});
            set({submission:res.data.data})
            toast.success(res.data.message);
        }catch(error){
            console.log(error?.response?.data || "Error executing code")
            toast.error("Error Executing Code")
        }
        finally{
            set({isExecuting:false})
        }
    }

}))