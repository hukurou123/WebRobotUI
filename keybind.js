class Keybind {
    add_key(key){
        this.key = key;
    }

    add_stat(stat){
        this.stat = stat;
    }

    add_tpc(tpc){
        this.tpc = tpc;
    }

    add_msg(msg){
        this.msg = msg;
    }
}



document.addEventListener('keydown', event => {
    if (event.key == 'a'){
        console.log(event.key+"です");
    }
})