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

    get_key(key){
        return key;
    }

    get_event(event){
        return event;
    }

    get_topic(topic){
        return topic;
    }

    get_massage(massage){
        return massage;
    }
}