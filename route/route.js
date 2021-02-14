import express from 'express';
import fs from 'fs';
import path from 'path';
import countryController from '../controller/country.controller.js'
import {readErrorFile,deleteErrorFile} from '../helpers/error.manager.js';
import {
    expertRegister,
    resendCode,
    expertLogin,
    expertLoadOwnCovidInfo,
    validateAccount,
    updateProfilPic} from '../controller/expert.controller.js';
import {fetchAllCovidInfo,addCovidInfoFx} from '../controller/covid.controller.js';

export default (app) => {
    const mainRoute = express.Router();
    const flagsRoute = express.Router();
    const expertRoute = express.Router();
    const covidRoute = express.Router();
    const countryRoute = express.Router();
    const errorRoute = express.Router();
    const profilRoute = express.Router();

    //welcome
    mainRoute.get('/',(req,res) => {
        res.type('json');
        res.status(201).json({message:"Welcome from route file"})
    });

    //FLAGS
    mainRoute.use('/flags',flagsRoute);
    flagsRoute.get('/:name', async (req,res) => {
        const name = req.params.name;
        if(name == null) res.status(404).end();
        res.type('png')
        fs.readFile(path.join(process.cwd(),'ressources','flags',name),(err,data) => {
            if(err) return res.status(404).end();
            res.writeHead(200);
            res.end(data);
        })
    });

    //PROFIL PIC
    mainRoute.use('/expert-photo',profilRoute);
    profilRoute.get('/:name', async (req,res) => {
        const name = req.params.name;
        if(name == null) res.status(404).end();
        res.type('png')
        fs.readFile(path.join(process.cwd(),'ressources','profil',name),(err,data) => {
            if(err) return res.status(404).end();
            res.writeHead(200);
            res.end(data);
        })
    });

    //EXPERT
    mainRoute.use('/experts',expertRoute);
    expertRoute.post('/login',expertLogin)
        .post('/register',expertRegister)
        .get('/init-password/:email',(req,res) => {})
        .get('/validation/:token/code/:code',validateAccount)
        .get('/resend-code/:token',resendCode)
        .post('/set-password',(req,res) => {})
        .get('/covid-info/:token',expertLoadOwnCovidInfo)
        .post('/update-profil-pic',updateProfilPic)
    
    //COVID
    mainRoute.use('/covid',covidRoute);
    covidRoute.get('/',fetchAllCovidInfo)
        .post('/add',addCovidInfoFx)
        .post('/update',addCovidInfoFx)

    //COUNTRY
    mainRoute.use('/countries',countryRoute);
    countryRoute.get('/',countryController.loadAllCountries)


    //ERROR
    mainRoute.use("/bugs",errorRoute);
    errorRoute.get("/",readErrorFile)
        .delete('/',deleteErrorFile)

    app.use('/cov-tracker/v1',mainRoute);
}