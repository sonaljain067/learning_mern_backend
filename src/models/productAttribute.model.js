import mongoose, { Schema } from "mongoose"

const productAttributeSchema = new Schema(
    {
        type: {
            type: String, 
        }, 
        value: {
            type: String, 
        }, 
    }, {
        timestamps: true 
    }
)

export const ProductAttribute = mongoose.model("ProductAttribute", productAttributeSchema)