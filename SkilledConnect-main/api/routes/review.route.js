import express from "express";
import {createReview,deleteReview,getReviews} from "../controllers/review.controller.js";

const router=express.Router();
// router.get("/test",deleteUser)
router.post("/",createReview);
router.get("/:beeId",getReviews);
router.delete("/:reviewId/:userId", deleteReview);
export default router;