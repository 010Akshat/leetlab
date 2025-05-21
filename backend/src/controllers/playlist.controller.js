import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { db } from "../libs/db.js";

export const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body
    if(!name){
        throw new ApiError(400,"Name Cannot Be Empty");
    }
    const userId = req.user.id;
    const existingPlaylist = await db.playlist.findUnique({
        where:{
            name_userId:{
                name,
                userId
            }
        }
    })
    if(existingPlaylist){
        throw new ApiError(400,"Playlist Name already exists");
    }
    const playlist = await db.playlist.create({
        data:{
            name,
            description,
            userId
        }
    })
    if(!playlist){
        throw new ApiError(400,"Error while creating playlist");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Created Successfully"));
})
export const addProblemToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {problemIds} = req.body
     
    console.log(playlistId)
    if(!Array.isArray(problemIds) || problemIds.length === 0){
        throw new ApiError(400,"Invalid or missing problemId");
    }
    const problemsInPlaylist = await db.problemInPlaylist.createMany({
        data:problemIds.map((problemId)=>({
            playListId:playlistId,
            problemId
        }))
    })
    if(!problemsInPlaylist){
        throw new ApiError(400,"Error while Adding Problems in Playlist")
    }
    return res.status(201).json(new ApiResponse(201,problemsInPlaylist,"Problems Added Successfully"));
})
export const removeProblemFromPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const {problemIds} = req.body

    if(!Array.isArray(problemIds) || problemIds.length === 0){
        throw new ApiError(400,"Invalid or missing problemId");
    }
    const deleteProblemsInPlaylist = await db.problemInPlaylist.deleteMany({
        where:{
            playListId:playlistId,
            problemId:{
                in:problemIds
            }
        }
    })
    if(!deleteProblemsInPlaylist){
        throw new ApiError(400,"Error while deleting Problems in Playlist")
    }
    return res.status(201).json(new ApiResponse(201,deleteProblemsInPlaylist,"Problems Deleted Successfully"));

})
export const getPlaylistDetails = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const playlist = await db.playlist.findUnique({
        where:{
            id:playlistId,
            userId:req.user.id
        },
        include:{
            problems:{
                include:{
                    problem:true
                }
            }
        }
    })
    if(!playlist){
        throw new ApiError(400,"Error while fetching Playlists");
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Fetched Sucessfully"));
})
export const getAllListDetails = asyncHandler(async(req,res)=>{
    const playlists = await db.playlist.findMany({
        where:{
            userId:req.user.id
        },
        include:{
            problems:{
                include:{
                    problem:true
                }
            }
        }
    })
    if(!playlists){
        throw new ApiError(400,"Error while fetching Playlists");
    }
    return res.status(200).json(new ApiResponse(200,playlists,"Playlists Fetched Sucessfully"));
})
export const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params;
    const deletedPlaylist = await db.playlist.delete({
        where:{
            id:playlistId
        }
    })
    if(!deletedPlaylist){
        throw new ApiError(400,"Error while deleting playlist");
    }
    return res.status(200).json(new ApiResponse(200,deletedPlaylist,"Playlist Successfully Deleted"));
})
