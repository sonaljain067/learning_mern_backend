import mongoose, { Schema } from "mongoose"

const productSchema = new Schema(
    {
        subcategory: {
            type: Schema.Types.ObjectId,
            ref: "Subcategory"
        },
        name: {
            type: String, 
            required: true 
        }, 
        description: {
            type: String, 
            required: true  
        }, 
        coverImage: {
            type: String,
            required: true, 
        }, 
        images: [
            {
                type: String, 
            }
        ],
        artisan: {
            type: Schema.Types.ObjectId,
            ref: "Artisan"
        },
        reviews: {
            type: Number, 
        }, 
        ratings: {
            type: Number, 
        },
        sell: {
            type: Number
        }
    }, {
        timestamps: true 
    }
)

export const Product = mongoose.model("Product", productSchema)