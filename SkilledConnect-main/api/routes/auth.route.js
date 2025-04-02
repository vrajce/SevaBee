import express from "express";
import { register , logout } from "../controllers/auth.controller.js";

const router=express.Router();

// router.post("/register", register)
// router.post("/login", login)
// router.post("/logout", logout)
router.post("/register",register);
router.delete('/logout/:id' , logout);
export default router;