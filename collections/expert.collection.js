import mongoose from 'mongoose';

const ExpertSchema = mongoose.Schema({
    username:{
        type:mongoose.SchemaTypes.String,
        lowercase:true,
        trim:true,
        unique:true
    },
    password:{
        type:mongoose.SchemaTypes.String,
        trim:true
    },
    prenom:{
        type:mongoose.SchemaTypes.String,
        trim:true,
        lowercase:true,
    },
    photo:{
        type:mongoose.SchemaTypes.String,
        trim:true,
        lowercase:true,
        default:'empty'
    },
    nom:{
        type:mongoose.SchemaTypes.String,
        trim:true,
        lowercase:true,
    },
    countryid:mongoose.SchemaTypes.ObjectId,
    status:{
        type:mongoose.SchemaTypes.String,
        default:'unlocked' //locked 
    },
    activated:{
        type:mongoose.SchemaTypes.Boolean,
        default:false
    },
    initcode:{
        type:mongoose.SchemaTypes.Number,
    },
    initlocked:{
        type:mongoose.SchemaTypes.Boolean,
        default:false
    },
    initnextdate:{
        type:mongoose.SchemaTypes.Date,
    },
},{timestamps:true})

export default mongoose.model("expert",ExpertSchema);

