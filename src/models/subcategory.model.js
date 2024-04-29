import mongoose, { Schema } from "mongoose"

const subcategorySchema = new Schema(
    {
        name: {
            type: String, 
        },
        description: {
            type: String 
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category"
        }
    }, {
        timestamps: true 
    }
)

export const Subcategory = mongoose.model("Subcategory", subcategorySchema)