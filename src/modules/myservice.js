import DataService from 'dataservice';

export default class MyService extends DataService{
    constructor(){
        super(MyService,['/assets/js/somevendor.js']);
        return super.mount();
    }

    getUser(id){
        ajax.post('http://localhost:8181/getUser',{id:id})
        .then((data)=>{
            trigger('userdata',data);
        })
        .catch((e)=>{
            console.log('[Error] ' + e.message);
        });
    }
    
    getSalesData(userId){
        ajax.get('http://localhost:8181/getSalesData',{userId})
        .then((data)=>{
            trigger('salesdata',data);
        })
        .catch((e)=>{
            console.log('[Error] ' + e.message);
        });
    }
}
