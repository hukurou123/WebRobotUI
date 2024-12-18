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
}