'use strict';

function DataService(className,libs) {
    this.reserved = ['constructor','register','invoke','mount'];

    this.interface = {
        events:{},
        on:function(event,callback){
            this.events[event] = callback;
        }
    };
    
    var methods = [];
    var classMethods = Object.getOwnPropertyNames(className.prototype);
    for(var i = 0; i < classMethods.length; i++){
        var isReserved = false;
        var property = classMethods[i];
        
        for(var j = 0; j < this.reserved.length; j++){
            if(property === this.reserved[j]){
                isReserved = true;
            }
        }
        
        if(!isReserved){
            this.interface[property] = this.invoke.bind(this, property);
            methods.push(className.prototype[property].toString());
        }
    }

    this.contents = `
    function initialize(){
        var libs = ${JSON.stringify(libs || []) };
        var tasks = [];
        for(var i = 0; i < libs.length; i++){
            tasks.push(ajax.send('GET',libs[i],{},'text/plain'));
        }
        Promise.all(tasks)
        .then(function(responses){
            for(var i = 0; i < responses.length; i++){
                eval.apply(self,responses[i]);
            }
            main();
        })
    };

    ${methods.join('\n')}
    initialize();
    `;
    
    var blobURL = URL.createObjectURL( new Blob([this.vendor + ';' + this.contents],{type:'text/javascript'}));
    this.instance = new Worker(blobURL);
    URL.revokeObjectURL(blobURL);
    this.instance.onmessage = function(msg){
        if(typeof this.interface.events[msg.data.event] === 'undefined'){
            console.warn('unhandled event triggered: ' + msg.data.event);
        }
        else{
            this.interface.events[msg.data.event](msg.data.data);
        }
        
    }.bind(this);


}

DataService.prototype.invoke = function() {
    var args = new Array(arguments);
    for(var i = 0; i < arguments.length; ++i) {
        args[i] = arguments[i];
    }
    this.instance.postMessage(args);
    return;
};

DataService.prototype.mount = function() {
    return this.interface;
};

module.exports = DataService;
