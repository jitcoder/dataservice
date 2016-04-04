'use strict';

const express = require('express');
const app = express();
const remoteConsole = require('./middleware/remote-console');
const bodyParser = require('body-parser');

const PORT = 8181;

app.set('view engine', 'jade');

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

app.get('/getUser',function(req,res){
    switch(req.body.id){
    case 1:
        req.send(JSON.stringify({id:1,username:'bob'}));
        break;
    case 2:
        req.send(JSON.stringify({id:2,username:'bob2'}));
    }
});

app.get('/getSalesData',function(req,res){
    
});

app.listen(PORT);
console.log('[Server] Listening on port ' + PORT);
