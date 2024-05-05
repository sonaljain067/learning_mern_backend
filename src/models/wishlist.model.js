import mongoose, { Schema } from "mongoose"

const wishlistSchema = new Schema(
    {   
        userId: {
            type: Schema.Types.ObjectId, 
            ref: "User"
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    }, {
        timestamps: true 
    }
)

export const Wishlist = mongoose.model("Wishlist", wishlistSchema)