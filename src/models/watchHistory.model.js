import mongoose, { Schema } from "mongoose"

const watchHistorySchema = new Schema(
    {   
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

export const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema)