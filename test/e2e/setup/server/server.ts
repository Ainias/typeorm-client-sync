import 'dotenv/config';

import * as path from 'path';

import express from 'express';
import {routes} from './routes';
import {DatabaseOptions, Database} from "@ainias42/typeorm-sync";
import {syncModels} from "../models/syncModels";

//Import Models

const port = process.env.PORT || 3000;

// BaseModel._databaseClass = EasySyncServerDb;
const databaseOptions: DatabaseOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "123456",
    database: process.env.DB_DB ?? "typeormSync",
    synchronize: true,

    logging: ['error', 'warn'],
    // "logging": true
};

//Downscaling von Images
const app = express();

//Todo guten wert finden?
app.use(express.json({limit: '50mb'}));

//Allow Origin setzen bevor rest passiert
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Pass to next layer of middleware
    next();
});
app.use('/api', routes);

app.use(express.static(path.resolve(path.dirname(process.argv[1]), 'public')));

//Handle errors, do not delete _ or otherwise it is not an error handler
app.use(function (err, req, res, _) {
    console.error('Error:', err);
    res.status(err.status || 500);
    if (err instanceof Error) {
        res.json({error: err.message});
    } else {
        res.json({error: err});
    }
});

Database.setSyncModels(syncModels);
Database.init(databaseOptions).then(async () => {
    app.listen(port, () => {
        console.log('Server started on Port: ' + port);
    });
})
