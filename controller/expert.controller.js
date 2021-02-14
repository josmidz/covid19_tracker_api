
import {
    createExpert,
    updateExpert,
    deleteExpert,
    loadProfilPic,
    loadExpertByUsername,
    loadExpertById,
    lockOrUnlockExperAccount} from '../model/expert.model.js';
import Country from '../collections/country.collection.js';
import {passwordMatched,hashPassword} from '../helpers/hash.password.js';
import mongoose from 'mongoose';
import genCode from '../helpers/code.generator.js';
import {deleteProfilPicture} from '../helpers/delete.profilpic.js';
import {sendAccountConfirmationEmail,sendInitPasswordConfirmationEmail} from '../helpers/send.email.js';

import {loadCountryById,countryFlagToBase64} from '../model/country.model.js';
import {encryptFx,decryptFx} from '../helpers/encrypt.decrypt.js';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import expertCollection from '../collections/expert.collection.js';
import {loadCovidCategories,loadCovidCategorieById} from '../model/covid.category.model.js';
import {findCovidInfoByExpertId} from '../model/covid.model.js';

export async function expertRegister(req,res){
    let {prenom,nom,username,password,countryid}  = req.body;
    if(!prenom ||!nom||!username||!password||!countryid) return res.status(200).json({status:false,message:"Toutes les information requises ne sont pas envoyées"});
    
    const _expertFromUsername = await loadExpertByUsername(username);
    if(_expertFromUsername.err != null) return res.status(204).json({status:false,message:"Echec de l'opération, veuillez réessayer"});
    if(_expertFromUsername.data != null) return res.status(204).json({status:false,message:"Cette adresse email est déjà utilisée"});
    const _hash = await hashPassword(password);

    const country = await loadCountryById(mongoose.Types.ObjectId(countryid));
    if(country.err != null) return res.status(500).json(    {status:false,message:"Echec de l'opération, veuillez réessayer"});
    if(country.data == null) return res.status(404).json({status:false,message:"Aucun pays correspondant n'a été trouvé"}); 

    //GEN CODE
    let _code = genCode()

    const _expert = await createExpert({
        prenom:prenom,
        nom:nom,
        username:username,
        password:_hash,
        countryid:country.data._id,
        initcode:_code
    });
    if(_expert.err) return res.status(500).json({status:false,message:"Echec de l'opération, veuillez réessayer"});

    //sent confirmation code 
    // sendAccountConfirmationEmail(`${prenom} ${nom}`,_code,email)
    const _enc = await encryptFx({id:_expert.data._id,time:Date.now()});
    if(_enc.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
    return res.status(200).json({status:true,data:_enc.data,message:"Un code de confirmation vous a été envoyé par mail"});
}

export async function validateAccount(req,res){
    let {code,token} = req.params;
    if(!code || !token) return res.status(204).json({status:false,message:"Toutes les informations requises ne sont pas fournies"}); 

    const _dec = await decryptFx(token)
    if(_dec.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});

    try {
        const _userInfoDecoded = JSON.parse(_dec.data);
        //moment
        let _time = new Date(_userInfoDecoded.time);
        const _momentTime = moment(_time).unix();
        const _currentTime = moment().subtract(5,'minutes').unix();
        if(_currentTime > _momentTime) return res.status(401).json({status:false,message:"Le délai d'attente pour cette opération a expiré"});

        //find expert
        const _expert = await loadExpertById(mongoose.Types.ObjectId(_userInfoDecoded.id));
        if(_expert.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
        if(_expert.data == null ) return res.status(404).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});

        //--test already activated
        if(_expert.data.activated == true) return res.status(201).json({status:false,message:"Votre compte a déjà été activé, veuillez vous connecter"});
        //--test code
        if(`${_expert.data.initcode}` != code) return res.status(201).json({status:false,message:"Le code de cofirmation érroné"});

        const _updated = await updateExpert({activated:true},_expert.data._id);
        if(_updated.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
        if(_updated.data ==0 ) return res.status(201).json({status:false,message:"Echec de l'opération, veuillez réessayer"});
        return res.status(200).json({status:true,message:"Votre compte a été crée avec succès"});
    } catch (err) {
        return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
    }
}

export async function resendCode(req,res) {
    let {token} = req.params;
    if(!token) return res.status(204).json({status:false,message:"Toutes les informations requises ne sont pas fournies"}); 
    const _dec = await decryptFx(token)
    if(_dec.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
    try {
        const _userInfoDecoded = JSON.parse(_dec.data);
         //moment
         let _time = new Date(_userInfoDecoded.time);
         const _momentTime = moment(_time).unix();
         const _currentTime = moment().subtract(5,'minutes').unix();
         if(_currentTime > _momentTime) return res.status(401).json({status:false,message:"Le délai d'attente pour cette opération a expiré"});

         //find expert
        const _expert = await loadExpertById(mongoose.Types.ObjectId(_userInfoDecoded.id));
        if(_expert.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
        if(_expert.data == null ) return res.status(404).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});

        //GEN CODE
        let _code = genCode();
        const _updated = await updateExpert({initcode:_code},_expert.data._id);
        if(_updated.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
        if(_updated.data == 0 ) return res.status(201).json({status:false,message:"Echec de l'opération, veuillez réessayer"});
        return  res.status(200).json({status:true,data:{token:_enc.data},message:"Un nouveau code de confirmation vient de vous être envoyé par mail"});
    } catch (err) {
        return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
    }
}

export async function expertLogin(req,res){
    let {username,password} = req.body;
    
    if(!username ||!password) return res.status(200).json({status:false,message:"Mot de passe ou identifiant incorrect"}); 
    username = username.toString().trim();
    password = password.toString().trim();
    const _expertFromUsername = await loadExpertByUsername(username);
    if(_expertFromUsername.err != null)  return res.status(200).json({status:false,message:"Mot de passe ou identifiant incorrect"}); 
    if(_expertFromUsername.data == null) return res.status(200).json({status:false,message:"Mot de passe ou identifiant incorrect"}); 
    //
    const _user = _expertFromUsername.data;
    // console.log("user founded hash: ",_user.password)
    const _isMatch = await passwordMatched(password,_user.password);
    // console.log("password match : ",_isMatch)
    if(!_isMatch) return res.status(200).json({status:false,message:"Mot de passe ou identifiant incorrect"});
    
    //--
    const country = await loadCountryById(_user.countryid);

    const _flag = await countryFlagToBase64(country.data.flag || '');
    const _token = await encryptFx({id:_user._id});
    if(_token.err) return res.status(200).json({status:false,message:"Echec de l'opération veuillez réessayer ultérieurement"}); 
    if(_user.photo != null) {
        //load profil pic
        const _pic = await loadProfilPic(_user.photo || '');
        let _info = {
            token:_token.data,
            username:_user.username,
            photo:_pic,
            prenom :_user.prenom,
            nom:_user.nom,
            countryflag:_flag,
            countryid:_user.countryid,
            countryname:country.data.country||'',
            countrycode:country.data.code||'',
            countrynat:country.data.nationality||'',
        }
        return res.status(200).json({status:true,data:_info});
    } else {
        let _info = {
            token:_token.data,
            username:_user.username,
            photo:_user.photo,
            prenom :_user.prenom,
            nom:_user.nom,
            countryflag:_flag,
            countryid:_user.countryid,
            countryname:country.data.country||'',
            countrycode:country.data.code||'',
            countrynat:country.data.nationality||'',
        }
        return res.status(200).json({status:true,data:_info});
    }
}

export async function updateProfilPic(req,res) {
    let {pic,picname,token} = req.body;
    if(!pic||!picname ||!token) return res.status(200).json({status:false,message:"Toutes les informations requises ne sont pas fournies"}); 
    picname = picname.toString().toLowerCase();
    const _dec = await decryptFx(token)
    if(_dec.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
    const _userInfoDecoded = JSON.parse(_dec.data);

    //find expert
    const _expert = await loadExpertById(mongoose.Types.ObjectId(_userInfoDecoded.id));
    if(_expert.err) return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});
    if(_expert.data == null ) return res.status(404).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer"});

    let _newFileName = "profil-"+Date.now()+""+path.extname(picname);
    let _newBuffer = Buffer.from(pic,'base64');

    fs.writeFile(path.join(process.cwd(),'ressources','profil',_newFileName),_newBuffer,(err)=>{
        if(err){
            return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer pic--8350"});
        } else {
            expertCollection.updateOne(
                {_id:_expert.data._id},{photo:_newFileName},(err,raw)=>{
                    if(err){
                        return res.status(500).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer pic--8354"});
                    } else {
                        if(raw.nModified > 0){
                            //delete old pic
                            if(_expert.data.photo != 'empty')
                                deleteProfilPicture(_expert.data.photo);

                            return res.status(200).json({status:true,message:"La mise à jour effectuée avec succès"});
                        } else {
                            return res.status(200).json({status:false,message:"La mise à jour de la photo n'a pas abouti"});
                        }
                    }
                })
        }
    })
}


export async function expertLoadOwnCovidInfo(req,res){
    let {token} = req.params;
    if(!token) return res.status(200).json({status:false,message:"Les informations liées à votre token n'ont pas été envoyées"});
    const _dec = await decryptFx(token)
    if(_dec.err) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --093-own-if"});
    const _userInfoDecoded = JSON.parse(_dec.data);

    //find expert
    const _expert = await loadExpertById(mongoose.Types.ObjectId(_userInfoDecoded.id));
    if(_expert.err) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --094-own-if"});
    if(_expert.data == null) return res.status(404).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --095-own-if"});

    const _info = await findCovidInfoByExpertId(_expert.data._id);
    if(_info.err) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --094-own-cont"});
    res.status(200).json({status:true,data:_info.data});
}
