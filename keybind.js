class Keybind {
    add_key(key){
        this.key = key;
    }

    add_ivent(ivent){
        this.ivent = ivent;
    }

    add_topic(topic){
        this.topic = topic;
    }

    add_massage(massage){
        this.massage = massage;
    }
}

document.addEventListener('keydown', event => {
    if (event.key == 'a'){
        console.log(event.key+"です");
    }
})