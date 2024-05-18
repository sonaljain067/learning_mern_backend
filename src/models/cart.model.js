import mongoose, { Schema } from "mongoose"

const cartSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productDet: {
            type: Schema.Types.ObjectId,
            ref: "ProductDetail"
        },
        qty: {
            type: Number,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId, 
            ref: "User"
        }
    }, {
        timestamps: true 
    }
)

export const Cart = mongoose.model("Cart", cartSchema)