import mongoose, { Schema } from "mongoose"
import { groupAvatarPlaceholder } from "../utils/constants"

const groupSchema=new Schema({
    avatar:{
        type:String,
        default:groupAvatarPlaceholder
    },
    coverImage:{
        type:String
    },
    description:{
        type:String,
    },
    links:[String]
})

export const Group=mongoose.model("Group",groupSchema)