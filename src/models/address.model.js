import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const addressSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId, 
            ref: "User"
        },
        fullName:{
            type: String,
            required: true
        },
        phoneNumber:{
            type: String,
            required: true
        },
        addressLine1:{
            type: String,
            required: true
        },
        addressLine2:{
            type: String,
        },
        city:{
            type: String,
            required: true
        },
        state:{
            type: String,
            required: true
        },
        pincode:{
            type: String,
            required: true
        },
        country:{
            type: String,
            required: true
        },
        isDefaultAddress:{
            type: Boolean,
        },
        propertyType:{
            type: String,
        },
        deliveryInstructions:{
            type: String,
        }
    }, {
        timestamps: true 
    }
)
addressSchema.plugin(mongooseAggregatePaginate)
export const Address = mongoose.model("Address", addressSchema)