/*
    keybind.js
    キーバインド登録用クラス
*/

class Keybind {
    key;
    event;
    topic;
    message;

    add_key(key){
        this.key = key;
        console.log("keyが追加されました");
    }

    add_event(event){
        this.event = event;
    }

    add_topic(topic){
        this.topic = topic;
    }

    add_message(message){
        this.message = message;
    }

    get_key(){
        return this.key;
    }

    get_event(){
        return this.event;
    }

    get_topic(){
        return this.topic;
    }

    get_message(){
        return this.message;
    }

    change_json(rw){
        let objlist = {
            key : this.key,
            event : this.event,
            topic : this.topic,
            message : this.message
        };
        let obj = JSON.stringify(objlist);
        localStorage.setItem(rw, obj);
    }

    get_json(rw){
        let jsonObj = localStorage.getItem(rw);
        let jsObj = JSON.parse(jsonObj);
        // console.log(jsObj);
        return jsObj;
    }
}