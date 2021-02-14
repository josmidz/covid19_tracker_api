

import nodemailer from 'nodemailer';


export function sendAccountConfirmationEmail(fullName,code,email) {
    const pass = process.env.EMAIL_PASS;
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'<youremail@email.com>',
            pass:pass
        }
    });

    const output = `
        <h3>Code de confirmation</h3>
        <p>Mr,Mme ${fullName}</p>
        <p>${code} est le code de confirmation pour la création de votre compte</p>
        <br/>
        <h4>COVID-19 TRACKER</h4>
        <p>--2020--</p>
    `;
    const mailOptions = {
        from:"<youremail@email.com>",
        to:`${email}`,
        subject:'Confirmation de compte',
        text:output
    };
    transporter.sendMail(mailOptions,async (resolve,reject)=>{
        console.log('${resolve}  :: ${reject}')
    })
}

export function sendInitPasswordConfirmationEmail(fullName,code) {
    const output = `
        <h3>Code de réinitialisation</h3>
        <p>Mr,Mme ${fullName}</p>
        <p>${code} est le code de confirmation pour la réinitialisation de votre mot de passe</p>
        <br/>
        <h4>COVID-19 TRACKER</h4>
        <p>--2020--</p>
    `;
    const mailOptions = {
        from:"<youremail@email.com>",
        to:`${email}`,
        subject:'Confirmation de compte',
        text:output
    };
    transporter.sendMail(mailOptions,async (resolve,reject)=>{
        console.log('${resolve}  :: ${reject}')
    })
}
