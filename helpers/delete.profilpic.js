import fs from 'fs';
import path from 'path';

export async function deleteProfilPicture(old){
    try {
        fs.unlink(path.join(process.cwd(),'ressources','profil',old),(err)=>{
            if(err){
                console.log("ERROR DELETION :  ",err)
            }
        })
    } catch (error) {
        
    }
}