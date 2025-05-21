import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAllListDetails,
    getPlaylistDetails,
    createPlaylist,
    addProblemToPlaylist,
    deletePlaylist,
    removeProblemFromPlaylist } from "../controllers/playlist.controller.js";
const playlistRoutes = express.Router();

playlistRoutes.post("/create-playlist", authMiddleware, createPlaylist);
playlistRoutes.post("/:playlistId/add-problem", authMiddleware, addProblemToPlaylist);
playlistRoutes.delete("/:playlistId/remove-problem", authMiddleware, removeProblemFromPlaylist);
playlistRoutes.get("/:playlistId", authMiddleware, getPlaylistDetails);
playlistRoutes.get("/",authMiddleware,getAllListDetails);
playlistRoutes.delete("/delete/:playlistId", authMiddleware, deletePlaylist);

export default playlistRoutes