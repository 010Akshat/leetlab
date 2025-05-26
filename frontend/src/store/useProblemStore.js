import {create} from "zustand";
import { axiosInstance } from "../libs/axios";
import {toast} from "react-hot-toast"



export const useProblemStore = create((set)=>({
    problems:[],
    problem:null,
    solvedProblems:[],
    isProblemsLoading:false,
    isProblemLoading:false,

    getAllProblems: async()=>{
        try {
            set({isProblemsLoading:true})
            const res = await axiosInstance.get("/problems/get-all-problems")
            set({problems:res.data.data})
        } catch (error) {
            console.log("Error getting Problems", error?.response?.data || "Internal Error ");
            toast.error("Error in getting problems")
        }   
        finally{
            set({isProblemsLoading:false})
        }
    },

    getProblemById: async(id)=>{
        try {
            set({isProblemLoading:true});
            
            const res = await axiosInstance.get(`/problems/get-problem/${id}`)
            set({problem:res.data.data})
            console.log("I am in store ,",res.data.data);
        } catch (error) {
            console.log("Error getting Problem", error || "Internal Error ");
            toast.error("Error in getting problem")
        }
        finally{
            set({isProblemLoading:false})
        }
    },

    getSolvedProblemByUser: async()=>{
        try {
            const res = await axiosInstance.get(`/problems/get-solved-problem`)
            console.log(res.data.data)
            set({solvedProblems:res.data.data})
        } catch (error) {
            console.log("Error getting Solved Problems", error?.response?.data || "Internal Error ");
            toast.error("Error in getting solved problems")
        }
    }

}))