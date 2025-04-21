 import mongoose, { Schema } from "mongoose";
 const subscriptionSchema = new Schema({
    subsciber:{
        type:Schema.Types.ObjectId,//one who is subscribing
        ref:"user"
    },
    channel:{
        type:Schema.Types.ObjectId,//one to whom subscriber is subscribing
        ref:"User"
    }

 },{timestamps})
 export const subscription = mongoose.model("Subscription",subscriptionSchema)