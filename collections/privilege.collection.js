import mongoose, { Schema } from 'mongoose';
const PrivilegeSchema  = Schema({
    privilege:{
        type:mongoose.SchemaTypes.String,
        lowercase:true,
        trim:true
    },
    shorthand:{
        type:mongoose.SchemaTypes.String,
        lowercase:true,
        trim:true
    },
    description:{
        type:mongoose.SchemaTypes.String,
        lowercase:true,
        trim:true
    },
},{timestamps:true})

export default mongoose.model('privilege',PrivilegeSchema)