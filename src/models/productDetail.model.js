import mongoose, { Schema } from "mongoose"

const productDetailSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId, 
            ref: "Product"
        },
        productSize: {
            type: Schema.Types.ObjectId,
            ref: "ProductAttribute"
        },
        productColor: {
            type: Schema.Types.ObjectId,
            ref: "ProductAttribute"
        },
        price: {
            type: Number
        },
        qty: {
            type: Number, 
        },
        noStock: {
            type: Boolean 
        }
    }, {
        timestamps: true 
    }
)

export const ProductDetail = mongoose.model("ProductDetail", productDetailSchema)