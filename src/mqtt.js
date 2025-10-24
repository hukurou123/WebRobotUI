// var client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');
var client;

// MQTTブローカーに接続する関数
function ConnectButtonClick() {
    // ipNameとportNameの値を取得して接続
    let ipName = document.getElementById("ip_name");
    let portName = document.getElementById("port_name");
    client = mqtt.connect('ws://'+ipName.value+':'+portName.value+'/mqtt');
    // connectionが確立したら
    client.on('connect', () => {
        // 接続情報をローカルストレージに保存
        localStorage.setItem("BrokerIP", ipName.value);
        localStorage.setItem("BrokerPORT", portName.value);
        // ステータス表示を緑に変更, connectボタンをactive状態に, disconnectボタンを非active状態に
        document.getElementById("status").src = "./green.PNG";
        document.getElementById("ip_button").classList.add("active");
        document.getElementById("disconnect_button").classList.remove("active");
        
        console.log('connected');
        // client.subscribe('test');
    });
    // client が初期化されたらメッセージハンドラを登録
    if (client && typeof client.on === 'function'){
        client.on('message', (topic, message) => {
            try{
                const msg = (typeof message === 'string') ? message : message.toString();
                console.log(topic + ':' + msg);
            } catch(e){
                console.error('message handler error', e);
            }
        });
    }
}

// MQTTブローカーから切断する関数
function disConnectButtonClick(){
    // clientが存在し，かつend関数が存在する場合にのみ実行
    if (client && typeof client.end === 'function'){
        // client.end() はエラーを投げる可能性があるので念のため
        try{ client.end(); } catch(e){ console.error('client end error', e); }
    }
    // 切断後の表示変更
    // const ipBtn = document.getElementById("ip_button");
    document.getElementById("ip_button").classList.remove("active");
    // const discBtn = document.getElementById("disconnect_button");
    document.getElementById("disconnect_button").classList.add("active");
    const statusEl = document.getElementById("status");
    statusEl.src = "./red.PNG";
}



// JSONに登録されているかどうかを確認する変数
const isEmpty = (obj) => {
    return JSON.stringify(obj) === "{}";
}


// 登録されたキーが押された時MQTT通信する
document.addEventListener('keydown', event => {
    // 今フォーカスされている要素を取得
    const active = document.activeElement;
    // テキスト入力中なら何もしない
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable) {
        return;
    }

    //配列の長さ分だけ繰り返し
    for (let i=0; i<tbl.rows.length-1; i++){
        //押されたキーが配列に登録されているなら
        if (event.key == keybind[i].get_key() && keybind[i].get_event()=="down"){
            console.log(event.key+"です");
            if (client && typeof client.publish === 'function'){
                client.publish(keybind[i].get_topic(), keybind[i].get_message());
            } else {
                console.warn('publish skipped: client not ready');
            }
        }
    }
})


// 登録されたキーが離された時MQTT通信する
document.addEventListener('keyup', event => {
    // 今フォーカスされている要素を取得
    const active = document.activeElement;
    // テキスト入力中なら何もしない
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable) {
        return;
    }

    //配列の長さ分だけ繰り返し
    for (let i=0; i<tbl.rows.length-1; i++){
        //押されたキーが配列に登録されているなら
        if (event.key == keybind[i].get_key() && keybind[i].get_event()=="up"){
            // console.log(event.key+"です");
            if (client && typeof client.publish === 'function'){
                client.publish(keybind[i].get_topic(), keybind[i].get_message());
            } else {
                console.warn('publish skipped: client not ready');
            }
        }
    }
})


