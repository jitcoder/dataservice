module.exports = function(req,res){
    if(req.params.method === 'clear'){
        console.log('\033[2J'); //eslint-disable-line
    }
    else{
        var lines = req.body.msg.split('\n');
        for(var i = 0; i < lines.length; i++){
            console.log(`[Browser:${req.params.method}] ${lines[i]}`);
        }
    }

    res.send('"OK"');
};
