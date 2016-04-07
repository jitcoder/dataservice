import MyService from 'myservice';

let service = new MyService();

service.on('userdata',function(user){
    console.log(JSON.stringify(user));
});

service.getUser(1);
