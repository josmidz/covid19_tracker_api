
import mongoose from 'mongoose';
const CountrySchema = mongoose.Schema({
    country:{
        type:mongoose.SchemaTypes.String,
        trim:true,
        lowercase:true
    },
    code:{
        type:mongoose.SchemaTypes.String,
        trim:true,
        lowercase:true
    },
    flag:{
        type:mongoose.SchemaTypes.String,
        trim:true,
        lowercase:true
    },
    nationality:{
        type:mongoose.SchemaTypes.String,
        trim:true,
        lowercase:true
    },
},{timestamps:true});

export default mongoose.model('country',CountrySchema)