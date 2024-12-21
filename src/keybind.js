class Keybind {
    key;
    event;
    topic;
    massage;

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

    add_massage(massage){
        this.massage = massage;
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

    get_massage(){
        return this.massage;
    }

    change_json(rw){
        let objlist = {
            key : this.key,
            event : this.event,
            topic : this.topic,
            massage : this.massage
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