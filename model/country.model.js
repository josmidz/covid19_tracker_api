import countryCollection from '../collections/country.collection.js';
import mongoose from 'mongoose';
import countriesTab from '../helpers/countries.js';
import fs from 'fs';
import path from 'path';
import {saveCovidCategory} from '../model/covid.category.model.js';

export async function loadCountryById(id){
    return new Promise((resolve,reject)=>{
        countryCollection.findOne({_id:id},(err,country)=>{
            if(err) return resolve({err:"Echec de l'opération, veuillez réessayer"})
            resolve({data:country})
          }
        )
    })
}

export async function loadAllCountries(){
    return new Promise((resolve,reject)=>{
        let _port = process.env.PORT;
        countryCollection.find({})
        .then((docs)=>{
            let _tab = docs.map((v)=> {
                return {...v._doc,flag:`http://localhost:${_port}/cov-tracker/v1/flags/${v.flag}`};
            });
            resolve({data:_tab||[]})
        }).catch((err)=>{
            resolve({err:'Une erreur est survenue'})
        })
    })
}

export async function countryFlagToBase64(flagname){
    return new Promise((resolve,reject)=>{
        fs.readFile(path.join(process.cwd(),'ressources','flags',flagname),(err,data) => {
            if(err) {
                resolve('empty')
            } else {
                resolve(data.toString('base64'))
            }
        })
    })
}

export async function saveCountry(info){
    return new Promise((resolve,reject)=>{
        const _country = countryCollection(info);
        _country.save()
        .then((saved) => {
            resolve({data:saved})
        }).catch((err) => {
            resolve({err:"Echec l'opération"})
        })
    })
}

export async function countCountries(){
    return new Promise((resolve,reject)=>{
        countryCollection.countDocuments({},(err,count) => {
            if(err){
                return resolve(0);
            } else return resolve(count);
        })
    })
}

export async function countryInitialization(){
    const count  = await countCountries();
    if(count < 1){
        for (let i = 0; i < countriesTab.length; i++) {
            const element = countriesTab[i];
            const _saved = await saveCountry({
                country:element.pays,
                nationality:element.nationalite,
                code:element.code,
                flag: element.pays =='Etats-Unis'? '1e.png':`${element.code}.png`
            })
        }
        for (let index = 0; index < ['nouveau cas','décès','guéri(s)'].length; index++) {
            const elem = ['nouveau cas','décès','guéri(s)'][index];
            await saveCovidCategory({category:elem})
        }
        console.log('initialization done!')
    } else return console.log('Already initialized !')
}