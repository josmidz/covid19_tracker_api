import {
    loadAllCovidInfo,
    findCovidInfoByExpertId,
    addCovidInfo,
    updateCovidInfo,findCovidInfoByCategoryExpertId} from '../model/covid.model.js';
import {loadCovidCategories,loadCovidCategorieById} from '../model/covid.category.model.js';
import {decryptFx} from '../helpers/encrypt.decrypt.js';
import {
    loadExpertById,
    } from '../model/expert.model.js';
import mongoose from 'mongoose';

export async function fetchAllCovidInfo(req,res){
    const _info = await loadAllCovidInfo();
    if(_info.err) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --090-own-al"});
    // if(_info.data.length == 0) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --091-own-al"});
    res.status(200).json({status:true,data:_info.data});
}

export async function addCovidInfoFx(req,res){
    let {token,nouveaucas,deces,gueris} = req.body;
    if(!token ||!nouveaucas ||!deces ||!gueris) return res.status(200).json({status:false,message:"Toutes les informations requises ne sont pas envoyées --010-crea"});

    const _dec = await decryptFx(token)
    if(_dec.err) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --011-crea"});
    const _userInfoDecoded = JSON.parse(_dec.data);

    //find expert
    const _expert = await loadExpertById(mongoose.Types.ObjectId(_userInfoDecoded.id));
    if(_expert.err) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --012-crea"});
    if(_expert.data == null) return res.status(404).json({status:false,message:"Aucune information correspondant à un expert n'a été trouvée, veuillez réessayer --013-crea"});

    const _info = await findCovidInfoByExpertId(_expert.data._id);
    if(_info.err) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --014-crea"});

    if(_info.data.length == 0){
        //create new info
        let categories = await loadCovidCategories();
        if(categories.err) return resolve({err:`ERREUR DANS LE CHARGEMENT DE CATEGORIE DU COVID --015-crea--`});
        if(categories.data.length == 0) return resolve({err:`CATEGORIE VIDE LORS CHARGEMENT DE TOUTES LES INFOS DU COVID -- 016-crea--`});

        for (let index = 0; index < categories.data.length; index++) {
            const element = categories.data[index];

            if(`${element.category}`.startsWith('nouv')) {
                let _info = {
                    covidvalue : req.body.nouveaucas,
                    categoryid : element._id,
                    expertid   : _expert.data._id
                }
                const _creation = await addCovidInfo(_info);
            } else if(`${element.category}`.startsWith('gu')) {
                let _info = {
                    covidvalue : req.body.gueris,
                    categoryid : element._id,
                    expertid   : _expert.data._id
                }
                const _creation = await addCovidInfo(_info);
                // console.log("IN LOOP child: ",index,' created ',_creation);
            }  else {
                let _info = {
                    covidvalue : req.body.deces,
                    categoryid : element._id,
                    expertid   : _expert.data._id
                }
                const _creation = await addCovidInfo(_info);
            }
            
        }
        // if(_creation.err) return res.status(200).json({status:false,message:"Quelque chode s'est mal passée, veuillez réessayer --017-crea"});
        res.status(200).json({status:true,message:"creation de données effectuée avec succès"});

    } else {
        //update existing info
        console.log("body --- ",req.body)
        let categories = await loadCovidCategories();
        if(categories.err) return resolve({err:`ERREUR DANS LE CHARGEMENT DE CATEGORIE DU COVID --015-crea--`});
        if(categories.data.length == 0) return resolve({err:`CATEGORIE VIDE LORS CHARGEMENT DE TOUTES LES INFOS DU COVID -- 016-crea--`});

        let _expect = 0;
        for (let index = 0; index < categories.data.length; index++) {
            const element = categories.data[index];
            const _covidInfoFromCatId = await findCovidInfoByCategoryExpertId(element._id,_expert.data._id);
            if(_covidInfoFromCatId.err || _covidInfoFromCatId.data == null) {
                continue;
            }
            if(`${element.category}`.startsWith('nouv')) {
                let _info = {
                    covidvalue : req.body.nouveaucas,
                    _id   : mongoose.Types.ObjectId(_covidInfoFromCatId.data._id),
                }
                const _update = await updateCovidInfo(_info);
                if(_update.err) continue;
                if(_update.data.nModified > 0) _expect++;
            } else if(`${element.category}`.startsWith('gu')) {
                let _info = {
                    covidvalue : req.body.gueris,
                    _id   : _covidInfoFromCatId.data._id,
                }
                const _update = await updateCovidInfo(_info);
                if(_update.err) continue;
                if(_update.data.nModified > 0) _expect++;
            }  else {
                let _info = {
                    covidvalue : req.body.deces,
                    _id   : _covidInfoFromCatId.data._id,
                }
                const _update = await updateCovidInfo(_info);
                if(_update.err) continue;
                if(_update.data.nModified > 0) _expect++;
            }
            
        }

        if(_expect == 3) {
            res.status(200).json({status:true,message:"La mise à jour est effectuée avec succès"});
        } else {
            res.status(200).json({status:false,message:"La mise à jour n'a pas abouti correctement --83ier-wieo"});
        }
    }
}


