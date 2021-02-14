import bcryptjs from 'bcryptjs';
export  function hashPassword(password) {
    return new Promise((resolve,reject)=>{
        const _hash =  bcryptjs.hashSync(password,12);
        resolve(_hash);
    })
}
export  function passwordMatched(password,hash) {
    return new Promise((resolve,reject)=>{
        const _hash = bcryptjs.compareSync(password,hash)
        resolve(_hash);
    })
}