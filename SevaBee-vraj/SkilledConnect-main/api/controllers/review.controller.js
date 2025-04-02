// export const deleteUser=(req,res)=>{
//     res.send("from controlller")
// }
import Review from "../models/review.model.js";

export const createReview = async(req,res)=>{
    try {
        const {beeId, userId, star, desc} = req.body;
        
        const reviewedUser = await Review.findOne({beeId , userId});
        if(reviewedUser){
            return res.status(400).json({message:"You've already reviewed this!!"});
        }

        const newReview = new Review({
            beeId ,
            userId,
            star,
            desc
        });

        await newReview.save();
        res.status(201).json({message: "data saved" , review : newReview});
    } catch (error) {
        res.status(505).json({message : "you've got some error" , error : error.message});
    }
}

export const getReviews = async(req,res) =>{
    try {
        const{beeId} = req.body;
        const reviews = await Review.find({ beeId });

        if (!reviews.length) {
            return res.status(404).json({ message: "No reviews found for this ID" });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({message:"you've got some error" , error : error.message});
    }
}

export const deleteReview = async(req,res) =>{
    try {
        const {reviewId , userId } = req.param;
        const existingReview = await Review.findOne({_id : reviewId , userId});
        if(!existingReview) {
            return res.status(404).json({ message: "Review not found or unauthorized" });
        }
        await Review.findByIdAndDelete(reviewId);
        res.status(200).json({message:"review deleted"});
    } catch (error) {
        res.status(500).json({message : "You've encounted an error!!"});
    }
}