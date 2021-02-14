import covidCategoryCollection from '../collections/covid.category.collection.js';

export async function saveCovidCategory(catagory) {
    return new Promise((resolve,reject)=>{
        const _covid = new covidCategoryCollection(catagory);
        _covid.save()
        .then((saved)=>{
            resolve({data:saved})
        }).catch((err)=>{
            resolve({err:err})
        })
    })
}

export async function loadCovidCategories(catagory) {
    return new Promise((resolve,reject)=>{
        covidCategoryCollection.find({},(err,docs)=>{
            if(err){
                resolve({err:err})
            } else {
                resolve({data:docs})
            }
        });
    })
}

export async function loadCovidCategorieById(id) {
    return new Promise((resolve,reject)=>{
        covidCategoryCollection.findOne({_id:id},(err,docs)=>{
            if(err){
                resolve({err:err})
            } else {
                resolve({data:docs})
            }
        });
    })
}

export async function loadCovidCategorieByName(categoryname) {
    return new Promise((resolve,reject)=>{
        covidCategoryCollection.findOne({catagory:categoryname},(err,docs)=>{
            if(err){
                resolve({err:err})
            } else {
                resolve({data:docs})
            }
        });
    })
}



