import {create} from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import ProblemPage from "../Page/ProblemPage";

export const useSubmissionStore = create((set)=>({
    isLoading:null,
    submissions:[],
    submission:null,
    submissionCount:null,

    getAllSubmissions : async()=>{
        try {
            set({isLoading:true})
            const res = await axiosInstance.get("/submission/get-all-submissions")
            set({submissions:res.data.data})
            toast.success(res.data.message)
        } catch (error) {
            console.log("Error getting submissions", error?.response?.data || "Internal Error ");
            toast.error("Error in getting submissions")
        }
        finally{
            set({isLoading:false})
        }
    },

    getSubmissionForProblem:async(problemId)=>{
        try {
            set({isLoading:true})
            const res = await axiosInstance.get(`/submission/get-submission/${problemId}`);
            set({submission:res.data.data})
            toast.success(res.data.message)
        } catch (error) {
            console.log("Error getting submissions", error?.response?.data || "Internal Error ");
            toast.error("Error in getting submissions")
        }
        finally{
            set({isLoading:false})
        }
    },

    getSubmissionCountForProblem:async(problemId)=>{
        try {
            const res = await axiosInstance.get(`/submission/get-submissions-count/${problemId}`)
            set({submissionCount:res.data.data.submissionsCount})
            // toast.success(res.data.message)
        } catch (error) {
            console.log("Error getting submissions", error?.response?.data || "Internal Error ");
            toast.error("Error in getting submissions")
        }
    }
}))