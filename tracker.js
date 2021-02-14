import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import appRoute from './route/route.js';
import db from './configs/database.js';
import bodyParser from 'body-parser';
/**
 * 
 * import { fileURLToPath } from 'url';
    import { dirname } from 'path';

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
 */

/**
 * __dirname = process.cwd();
    __dirname = fs.realpathSync('.');
    __dirname = process.env.PWD
 */

dotenv.config();
const app = express();
app.use(cors());
app.use(helmet());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false,limit:'500mb' }))
 
// parse application/json
app.use(bodyParser.json())

//statics
// app.use(express.static(process.cwd()+'/ressources'));

const PORT = process.env.PORT || 4004;

//define route
appRoute(app);
app.get('*', (req,res) => {
    res.status(404).end();
});


//DB
db(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD);

http.createServer(app).listen(PORT,() => {
    console.log(`OUR SERVEUR IS RUNNING ON ${PORT}`)
})