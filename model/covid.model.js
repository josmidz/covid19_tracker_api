import covidCollection from '../collections/covid.collection.js';
import {loadCovidCategories,loadCovidCategorieById} from '../model/covid.category.model.js';
import {loadExpertById} from '../model/expert.model.js';
import {loadCountryById} from '../model/country.model.js';
import mongoose from 'mongoose';

/**
 * Charger les informations du covid par rapport a un expert
 * @param {*} expertid ID de l'expert
 */
export async function findCovidInfoByExpertId(expertid) {
    return new Promise((resolve,reject) => {
        covidCollection.find({expertid:expertid},(err,res)=>{
            if(err) {
                resolve({err:err})
            } else {
                _loopExpertInfoFx(resolve,res)
            }
        });
    });
}

async function _loopExpertInfoFx(resolveFx,tab) {
    let _array = [];
    for (let index = 0; index < tab.length; index++) {
        const element = tab[index];
        const _category = await loadCovidCategorieById(element.categoryid);
        if(_category.err) continue;
        _array.push({
            id            : element._id,
            categoryname  : _category.data.category,
            categoryid    : _category.data._id,
            covidinfo     : element.covidvalue
        })
    }
    resolveFx({data:_array});
}

/**
 * Enregistrement de l'information du covid
 * @param {*} covidinfo L'objet contenant toutes les informations necessaire pour enregistrer un document covid
 */
export async function addCovidInfo(covidinfo) {
    return new Promise((resolve,reject) => {
        const _covid = new covidCollection(covidinfo);
        _covid.save()
        .then((saved) => {
            resolve({data:saved});
        }).catch((err) => {
            resolve({err:err});
        })
    });
}

/**
 * Mise à jour de l'information du covid
 * @param {*} covidinfo L'objet contenant toutes les informations necessaire pour enregistrer un document covid
 */
export async function updateCovidInfo(covidinfo){
    return new Promise((resolve,reject) => {
        covidCollection.updateOne({_id:covidinfo._id},covidinfo,(err,raw) =>{
            if(err){
                resolve({err:err});
            } else {
                resolve({data:raw});
            }
        });
    });
}

export async function loadAllCovidInfo(){
    return new Promise( async (resolve,reject) => {
        let _port = process.env.PORT;
        //--load categories
        let categories = await loadCovidCategories();
        if(categories.err) return resolve({err:`ERREUR DANS LE CHARGEMENT DE TOUTES LES INFOS DU COVID : ${categories.err}`});
        if(categories.data.length == 0) return resolve({err:`CATEGORIE VIDE LORS CHARGEMENT DE TOUTES LES INFOS DU COVID : ${categories.err}`});
        categories = categories.data;
        
        let _lastInfoArray = [];
        let _categoriesForChildLoop = categories;
        for (let i = 0; i < categories.length; i++) {

            //VARIABLES
            let _childArray = [];
            let _generalSum = 0;

            //TEMPS
            const element = categories[i];

            //load covid info from categorie id
            let covidinfos = await findCovidInfoByCategorieId(element._id);
            if(covidinfos.err) continue;
            if(covidinfos.data.length == 0) continue;
            covidinfos = covidinfos.data;
            for (let index = 0; index < covidinfos.length; index++) {
                const elem = covidinfos[index];
                _generalSum += elem.covidvalue;

                //load expert info from id
                const _expert = await loadExpertById(elem.expertid);
                if(_expert.err) continue;
                if(_expert.data == null) continue;
                let _expertPhoto = _expert.data.photo;

                if(_expertPhoto !='empty'){
                    _expertPhoto = `http://localhost:${_port}/cov-tracker/v1/expert-photo/${_expertPhoto}`;
                }

                //load country info from id
                const _country = await loadCountryById(_expert.data.countryid);
                if(_country.err) continue;
                if(_country.data == null) continue;
                let _countryFlag = `http://localhost:${_port}/cov-tracker/v1/flags/${_country.data.flag}`;

                //load stats about one country getCovidSumFromCategorieId
                let _statsArray = [];
                for (let j = 0; j < _categoriesForChildLoop.length; j++) {
                    const element = _categoriesForChildLoop[j];

                    const _sumRes = await getCovidSumFromCategorieId(element._id,_country.data._id);
                    if(_sumRes.err) continue;
                    let _sum =0
                    if(_sumRes.data.length > 0) _sum = _sumRes.data[0].total;
                    _statsArray.push({
                        categoryname    : element.category,
                        categoryid      : element._id,
                        value           : _sum
                    })
                }

                //
                _childArray.push({
                    expert : {
                        fullname :`${_expert.data.prenom} ${_expert.data.nom}`,
                        nationality:`${_country.data.nationality}`,
                        photo : _expertPhoto
                    },
                    country:{
                        countryflag:_countryFlag,
                        countryname:_country.data.country,
                    },
                    stats:_statsArray
                })
            }
            //--
            _lastInfoArray.push({
                idcategory:element._id,
                category:element.category,
                genvalue:_generalSum,
                info:_childArray
            })
        }
        resolve({data:_lastInfoArray})
    });
}
/**
 * Chargement de toutes les informations du covid par rapport a l'ID category
 * @param {*} categoryid ID Category
 */
export async function findCovidInfoByCategorieId(categoryid) {
    return new Promise((resolve,reject) => {
        covidCollection.find({categoryid:categoryid},(err,res)=>{
            if(err) {
                resolve({err:err})
            } else {
                resolve({data:res});
            }
        });
    });
}

/**
 * Chargement de toutes les informations du covid par rapport a l'ID category
 * @param {*} categoryid ID Category
 */
export async function findCovidInfoByCategoryExpertId(categoryid,expertid) {
    return new Promise((resolve,reject) => {
        covidCollection.findOne({categoryid:categoryid,expertid:expertid},(err,res)=>{
            if(err) {
                resolve({err:err})
            } else {
                resolve({data:res});
            }
        });
    });
}

export async function getCovidSumFromCategorieId(categoryid,countryid){
    return new Promise((resolve,reject) => {
        covidCollection.aggregate([
            {
                $lookup : {
                    from         : 'covidcategories',
                    localField   : 'categoryid',
                    foreignField : '_id',
                    as           : 'category_docs'
                }, 
            },
            {
                $unwind:{
                    path: "$category_docs",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup : {
                    from : "experts",
                    localField:"expertid",
                    foreignField:"_id",
                    as:"expert_docs"
                }
            },
            {
                $unwind : {
                    path:"$expert_docs",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup : {
                    from : "countries",
                    localField:"expert_docs.countryid",
                    foreignField:"_id",
                    as:"country_docs"
                }
            },
            {
                $unwind : {
                    path:"$country_docs",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $match:{
                    "category_docs._id":mongoose.Types.ObjectId(categoryid),
                    "country_docs._id":mongoose.Types.ObjectId(countryid)
                }
            },
            {
                $group:{
                    _id:null,
                    total: { $sum: "$covidvalue" },
                }
            },
            
        ]).exec((err,result) => {
            if(err) {
                resolve({err:err})
            } else {
                resolve({data:result});
            }
        });
    });
}
