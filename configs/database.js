import mongoose from 'mongoose';
import {countryInitialization} from '../model/country.model.js';
import {encryptFx,decryptFx} from '../helpers/encrypt.decrypt.js'

export default (db,user,pwd)=> {
    const MONGO_DATABASE = `mongodb://${user||'test-user'}:${pwd||'test-pass'}@localhost:27017/${db ||'test_covid'}?authSource=admin`;
    mongoose.connect(MONGO_DATABASE,{
        useNewUrlParser: true,
        useCreateIndex: true,
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        useUnifiedTopology: true,
    }).then((v) => {
        console.info(`Successfully connected to bd`);
        // const _enc = encryptFx({hello:'data info'})
        // console.log("encrypted : ",_enc);
        // const _dec = decryptFx(_enc)
        // console.log("decoded : ",JSON.parse(_dec));
        countryInitialization();
    }).catch((err) => {
        console.log('fail to connect to db ',err)
    })
}