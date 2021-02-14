import expertCollection from '../collections/expert.collection.js';

import { fileURLToPath } from 'url';
import {writeErrorFile} from '../helpers/error.manager.js';
import fs from 'fs';
import path from 'path';
/**
 * Creation d'un nouvel expert  
 * @param {*} expert object contenant toutes les information de l'expert
 */
export async function createExpert(expert) {
    return new Promise((resolve,reject)=>{
        let _expert = new expertCollection(expert);
        _expert.save()
        .then((saved)=>{
            resolve({data:saved});
        }).catch((err)=>{
            writeErrorFile({
                filename:fileURLToPath(import.meta.url),
                description:err,
                date: Date.now(),
                dirname:process.env.PWD,
                title:'Creating Expert'
            })
            resolve({err:err})
        })
    });
}

/**
 * Mise a jour de l'expert  
 * @param {*} expert objet contenant les proprietes a mettre a jour
 * @param {*} id id de l'expert a mettre a jour
 */
export async function updateExpert(expert,id) {
    return new Promise((resolve,reject)=>{
        expertCollection.updateOne({_id:id},expert,(err,raw)=>{
            if(err){
                errorToFile({
                    filename:fileURLToPath(import.meta.url),
                    description:err,
                    date: Date.now(),
                    dirname:process.env.PWD,
                    title:'Updating Expert'
                })
                resolve({err:err})
            } else {
                resolve({data:raw.nModified})
            }
        })
    });
}

/**
 * Suppression de l'expert  
 * @param {*} id ID de l'expert a supprimer
 */
export async function deleteExpert(id) {
    return new Promise((resolve,reject)=>{
        expertCollection.deleteOne({_id:id},(err,raw)=>{
            if(err){
                errorToFile({
                    filename:fileURLToPath(import.meta.url),
                    description:err,
                    date: Date.now(),
                    dirname:process.env.PWD,
                    title:'Deleting Expert'
                })
                resolve({err:err})
            } else {
                resolve({data:true})
            }
        })
    });
}
/**
 * charger les informations des l'expert par son id
 * @param {*} id ID de l'expert a chercher
 */
export async function loadExpertById(id) {
    return new Promise((resolve,reject)=>{
        expertCollection.findById(id,(err,res)=>{
            if(err){
                errorToFile({
                    filename:fileURLToPath(import.meta.url),
                    description:err,
                    date: Date.now(),
                    dirname:process.env.PWD,
                    title:'Loading Expert by id'
                })
                resolve({err:err})
            } else {
                resolve({data:res})
            }
        })
    });
}

export async function loadExpertByUsername(username) {
    return new Promise((resolve,reject)=>{
        expertCollection.findOne({username:username},(err,res)=>{
            if(err){
                errorToFile({
                    filename:fileURLToPath(import.meta.url),
                    description:err,
                    date: Date.now(),
                    dirname:process.env.PWD,
                    title:'Loading Expert by id'
                })
                resolve({err:err})
            } else {
                resolve({data:res})
            }
        })
    });
}

export async function loadProfilPic(picname){
    return new Promise((resolve,reject)=>{
        fs.readFile(path.join(process.cwd(),'ressources','profil',picname),(err,data) => {
            if(err) {
                resolve('empty')
            } else {
                resolve(data.toString('base64'))
            }
        })
    })
}

/**
 * Bloquer ou debloquer un compte
 * @param {*} id ID de l'expert
 * @param {*} status Etat du compte a mettre a jour
 */
export async function lockOrUnlockExperAccount(id,status){
    return new Promise((resolve,reject)=>{
        expertCollection.updateOne({_id:id},{status:status},(err,res)=>{
            if(err){
                errorToFile({
                    filename:fileURLToPath(import.meta.url),
                    description:err,
                    date: Date.now(),
                    dirname:process.env.PWD,
                    title:'lock or unlock Expert by id'
                })
                resolve({err:err})
            } else {
                resolve({data:res})
            }
        })
    });
}

