import {loadAllCountries} from '../model/country.model.js';
class CountryController {
    async loadAllCountries(req,res){
        const _countries = await loadAllCountries();
        if(_countries.err != null) return res.status(500).json({status:false,message:'Une erreur est survenue'});
        res.status(201).json({status:true,data:_countries.data});
    }
}

const countryController = new CountryController()

export default countryController