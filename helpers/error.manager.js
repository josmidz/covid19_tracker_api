import fs from 'fs';
import path from 'path';
export function writeErrorFile(content){
    if(!fs.existsSync(path.join(process.cwd(),'errors'))){
        fs.mkdirSync(path.join(process.cwd(),'errors'))
        fs.createWriteStream(path.join(process.cwd(),'errors','error.json'),)
    }
    fs.readFile(path.join(process.cwd(),'errors','error.json'),(err,data)=>{
        if(err) return;
        if(data.toString('utf8').length ==0){
            let _array = [];
            _array.push(content)
            let jsonString = JSON.stringify(_array)
            fs.writeFile(path.join(process.cwd(),'errors','error.json'),jsonString,(err)=>{
                if(err) return;
            })
        } else {
            let _data = JSON.parse(data.toString('utf8'));
            let _array = [..._data];
            _array.push(content);
            let jsonString = JSON.stringify(_array);
            fs.writeFile(path.join(process.cwd(),'errors','error.json'),jsonString,(err)=>{
                if(err) return;
            })
        }
    })
}

export function readErrorFile(req,res){
    fs.readFile(path.join(process.cwd(),'errors','error.json'),{encoding:'utf8'},(err,data)=>{
        if(err){
            res.status(404).json({status:false,message:"Aucun bug n'a été trouvé"})
        } else if(data.length ==0){
            res.status(404).json({status:false,message:"Aucun bug n'a été trouvé"})
        } else {
            try {
                let _data = JSON.parse(data);
                res.status(200).json({status:true,data:_data})
            } catch (error) {
                res.status(404).json({status:false,message:"Aucun bug n'a été trouvé"})
            }
        }
    })
}

export function deleteErrorFile(req,res){
    fs.readFile(path.join(process.cwd(),'errors','error.json'),{encoding:'utf8'},(err,data)=>{
        if(err){
            res.status(404).json({status:false,message:"Aucun bug n'a été trouvé"})
        } else if(data.length ==0){
            res.status(404).json({status:false,message:"Aucun bug n'a été trouvé"})
        } else {
            let _array = [];
            let jsonString = JSON.stringify(_array)
            fs.writeFile(path.join(process.cwd(),'errors','error.json'),jsonString,(err)=>{
                if(err){
                    res.status(404).json({status:false,message:"Echec de l'opération"})
                } else {
                    res.status(404).json({status:true,message:"Suppression éffectuée avec succès"})
                }
            })
        }
    })
}

