class Keybind {
    key_add(key){
        this.key = key;
    }

    stat_add(stat){
        this.stat = stat;
    }

    tpc_add(tpc){
        this.tpc = tpc;
    }

    msg_add(msg){
        this.msg = msg;
    }
}



document.addEventListener('keydown', event => {
    if (event.key == 'a'){
        console.log(event.key+"です");
    }
})