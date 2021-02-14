
import mongoose from 'mongoose';
const CovidCategorySchema = mongoose.Schema({
    category:{
        type:mongoose.SchemaTypes.String,
        trim:true,
        lowercase:true
    },
},{timestamps:true});

export default mongoose.model('covidcategory',CovidCategorySchema)