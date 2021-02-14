
import mongoose from 'mongoose';
const CovidInfoSchema = mongoose.Schema({
    expertid : {
        type    : mongoose.SchemaTypes.ObjectId,
    },
    categoryid : {
        type    : mongoose.SchemaTypes.ObjectId,
    },
    covidvalue : {
        type    : mongoose.SchemaTypes.Number,  //nouveau cas; deces; gueris;
        default : 0
    },
},{timestamps : true});

export default mongoose.model('covidinfo',CovidInfoSchema)