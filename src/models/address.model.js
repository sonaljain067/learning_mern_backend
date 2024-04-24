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
        },
        phoneNumber:{
            type: String,
        },
        addressLine1:{
            type: String,
        },
        addressLine2:{
            type: String,
        },
        city:{
            type: String,
        },
        state:{
            type: String,
        },
        pincode:{
            type: String,
        },
        country:{
            type: String,
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