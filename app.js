'use strict';

const express = require('express');
const app = express();
const remoteConsole = require('./middleware/remote-console');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 8181;

app.set('view engine', 'jade');

app.use(cors());
app.use(bodyParser.json());
app.use('/console/:method',remoteConsole);
app.use((req, res, next) => {
    console.log('[Server] ' + req.method + ' -> ' + req.path);
    next();
});

app.use(express.static('dist'));

app.get('/', function(req, res) {
    res.render('index');
});

app.post('/getUser',function(req,res){
    switch(req.body.id){
    case 1:
        res.json({id:1,username:'bob'});
        break;
    case 2:
        res.json({id:2,username:'bob2'});
        break;
    }
    res.end();
});

app.get('/getSalesData',function(req,res){
    var results = [];
    for(var i = 0; i < 10000; i++){
        if(i % 2 === 0){
            results.push({id:i,userId:1,amount:Math.round(Math.random()*100)});
        }
        else{
            results.push({id:i,userId:0,amount:Math.round(Math.random()*100)});
        }
    }
    res.json(results);
    res.send();
});

app.listen(PORT);
console.log('[Server] Listening on port ' + PORT);
