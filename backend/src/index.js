import express from "express"
import dotenv from "dotenv"

dotenv.config();

const app = express();

app.use(express.json());

app.get("/",(req,res) => {
    res.send("Welcome to leetlab 🔥")
})

app.use("/api/v1/auth",authRoutes);

app.listen(process.env.PORT,()=>{
    console.log("Server is running on port 8080")
})