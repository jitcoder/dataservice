import DataService from 'dataservice';

export default class MyService extends DataService{
    constructor(){
        super(MyService,['/assets/js/somevendor.js']);
        return super.mount();
    }

    getUser(id){
        // ajax.post('/getUser',{id:id})
        // .then((data)=>{
        //     console.log('[Data] ' + JSON.stringify(data));
        // })
        // .catch((e)=>{
        //     console.log('[Error] ' + e.message);
        // });
        console.log('Real getUser invoked with id:' + id);
    }
    
    getSalesData(userId){
        ajax.post('/getSalesData',{userId})
        .then((data)=>{
            this.updateState('sales',data);
        })
        .catch((e)=>{
            console.log('[Error] ' + e.message);
        });
    }
}
