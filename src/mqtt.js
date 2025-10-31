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


// 任意の配列とテーブルIDを使ってキーイベントでMQTT通信
// スティックの通信はgamepadのクラスに直書きしてます
function setupKeyPublish(array, tableId, eventType, keyName) {
    const tbl = document.getElementById(tableId);
    if (!tbl) return;

    // 今フォーカスされている要素を取得
    const active = document.activeElement;
    // テキスト入力中なら何もしない
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable) {
        return;
    }

    //配列の長さ分だけ繰り返し
    for (let i = 0; i < array.length; i++) {
        const kb = array[i];
        //キーボードイベントのときはevent.keyを使う
        const keyToCheck = keyName || (eventType.key ? eventType.key : null);
        //押されたキーが配列に登録されているなら
        if (kb.get_key() === keyToCheck && kb.get_event() === eventType) {
            const topic = kb.get_topic();
            // const message = kb.get_message();
            // console.log(keyToCheck + " です");
            // topicが空でなければ送信
            if (topic){
                console.log(keyToCheck + " です");
                if (client && typeof client.publish === 'function') {
                    client.publish(kb.get_topic(), kb.get_message());
                } else {
                    console.warn('publish skipped: client not ready');
                }
            }
        }
    }
}

function stickPublish(topic, message) {
    if (!topic) return;
    if (client && typeof client.publish === 'function') {
        client.publish(topic, message);
        console.log(`[MQTT] ${topic} <- ${message}`);
    } else {
        console.warn('publish skipped: client not ready');
    }
}

