import mongoose, { Schema } from "mongoose"

const ratingReviewSchema = new Schema(
    {
        rating: {
            type: Number, 
        },
        review: {
            type: String, 
        }, 
        images: [
            {
                type: String
            }
        ],
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    }, {
        timestamps: true 
    }
)

export const RatingReview = mongoose.model("RatingReview", ratingReviewSchema)