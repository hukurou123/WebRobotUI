/*
    table_operation.js
    表の行追加、削除、スクロール処理
*/


const tbl = document.getElementById("tbl");
var keybind = [];

// 行を追加する関数
function add(){
    keybind.push(new Keybind());
    renderTable();
}

// 行を削除する関数
function remove(index){
    // リストの範囲外だったら何もしない
    if (index < 0 || index >= keybind.length) return;

    keybind.splice(index, 1);
    // リストが空になったら空行を追加
    if (keybind.length === 0) keybind.push(new Keybind());

    // saveKeybinds();
    renderTable();
}

// 表を描画する関数
function renderTable(){
    // 表の初期化 一度全部消す
    while (tbl.rows.length > 1) {
        tbl.deleteRow(1);
    }

    // キーバインドのリストの長さ回繰り返す bindはKeybindのインスタンス iはインデックス
    keybind.forEach((bind, i) => {
        const tr = document.createElement("tr");

        // 行番号
        const tdIndex = document.createElement("td");
        tdIndex.textContent = i + 1;
        tdIndex.classList.add('count');
        tr.appendChild(tdIndex);

        // キー
        const tdKey = document.createElement("td");
        const inpKey = document.createElement("input");
        inpKey.id = `key${i}`;
        inpKey.classList.add("cell");
        // もしbind.get_key()が存在したらそれをvalueに設定、なければ空文字を設定
        inpKey.value = bind.get_key() || "";
        tdKey.appendChild(inpKey);
        tr.appendChild(tdKey);

        // イベント
        const tdEvent = document.createElement("td");
        const sl = document.createElement('select');
        // 選択肢の作成
        ["down" , "up"].forEach(opt => {
            const option = document.createElement('option');
            option.text = opt;
            if (bind.get_event() === opt) option.selected = true;
            sl.appendChild(option);
        });
        sl.id = `event${i}`;
        sl.classList.add("cell");
        tdEvent.appendChild(sl);
        tr.appendChild(tdEvent);

        // トピック
        const tdTopic = document.createElement("td");
        const inpTopic = document.createElement("input");
        inpTopic.id = `topic${i}`;
        inpTopic.classList.add("cell");
        inpTopic.value = bind.get_topic() || "";
        tdTopic.appendChild(inpTopic);
        tr.appendChild(tdTopic);

        // メッセージ
        const tdMsg = document.createElement("td");
        const inpMsg = document.createElement("input");
        inpMsg.id = `massage${i}`;
        inpMsg.classList.add("cell");
        inpMsg.value = bind.get_massage() || "";
        tdMsg.appendChild(inpMsg);
        tr.appendChild(tdMsg);

        // 削除ボタン
        const tdDel = document.createElement("td");
        const btnDel = document.createElement("button");
        btnDel.textContent = "−";
        // 削除ボタンの角を丸くしたいから,tdを背景色にするためのクラスづけ
        tdDel.classList.add('delete-btn');
        btnDel.onclick = () => remove(i);
        tdDel.appendChild(btnDel);
        tr.appendChild(tdDel);

        tbl.appendChild(tr);
    });

    scrollToBottom();
}

// (保存ロジックは saveKeybinds(readFromDOM = true) に統合しました)

// localStrageに保存する関数
function saveKeybinds(){
    // 現在の入力状態を読み取って keybind を更新
    for (let i = 0; i < keybind.length; i++){
        const inpKey = document.getElementById(`key${i}`);
        const sl = document.getElementById(`event${i}`);
        const inpTopic = document.getElementById(`topic${i}`);
        const inpMsg = document.getElementById(`massage${i}`);
        const kb = keybind[i] || new Keybind();

        if (inpKey) kb.add_key(inpKey.value);
        if (sl) kb.add_event(sl.value);
        if (inpTopic) kb.add_topic(inpTopic.value);
        if (inpMsg) kb.add_massage(inpMsg.value);

        keybind[i] = kb;
    }

    // map: 配列の各要素に関数を適用して、新しいmapを作る
    // keybindのインスタンスをオブジェクトに変換して配列にする
    const arr = keybind.map(k => ({ 
        key: k.get_key(), 
        event: k.get_event(), 
        topic: k.get_topic(), 
        massage: k.get_massage() 
    }));
    const toRemove = [];
    // chatGPTとcopilot2つのAIを使用したので繰り返しの書き方が違う
    // chatGPTはforEach使いがち
    // すべてのlocalStorageのキーを確認して、数字だけのキーを削除する
    for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k) continue;
        if (/^[0-9]+$/.test(k)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
    // 配列をJSON文字列に変換してlocalStrageに保存
    localStorage.setItem('keybinds', JSON.stringify(arr));

    try{
        showToast('Saved Successfully!');
    }catch(e){
    }
}

// localStrageから読み込む関数
function loadKeybinds(){
    // localstorageからkeybindsというキーで保存されているデータを取得
    const data = localStorage.getItem('keybinds');
    if (data) {
        try {
            // JSON文字列をkeybindの配列に変換
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)){
                keybind = parsed.map(obj => {
                    const kb = new Keybind();
                    kb.add_key(obj.key);
                    kb.add_event(obj.event);
                    kb.add_topic(obj.topic);
                    kb.add_massage(obj.massage);
                    return kb;
                });
                // もし配列が空だったら空行を追加
                if (keybind.length === 0) keybind.push(new Keybind());
                return;
            }
        } catch(e){
            // もしtryのプログラムでエラーが出たらコンソールに表示
            console.error('failed to parse keybinds', e);
        }
    }

    // localStrageにkeybindsというキーで保存されているデータがなかった場合の処理
    keybind = [];
    const numericKeys = [];
    // localStrageの全部のキーを探す
    // 数字だけのキーを抽出してnumericKeysに追加
    // もしもlocalStrageのキーがnullや'BrokerIP'だったり，数字でなかったら無視
    for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k) continue;
        if (k === 'BrokerIP' || k === 'BrokerPORT' || k === 'keybinds') continue;
        if (!/^[0-9]+$/.test(k)) continue;
        numericKeys.push(k);
    }
    // numbericKeysを昇順でソート
    // この書き方はJavaとかでも使われる． バブルソートみたいなことしてる
    // 詳しくは調べてください
    numericKeys.sort((a,b) => Number(a) - Number(b));
    // numericKeysの長さ回繰り返す
    for (const k of numericKeys){
        try{
            // localStrageからキーkのデータを取得してJSONをkeybindのインスタンスに変換
            const jsObj = JSON.parse(localStorage.getItem(k));
            const kb = new Keybind();
            kb.add_key(jsObj.key);
            kb.add_event(jsObj.event);
            kb.add_topic(jsObj.topic);
            kb.add_massage(jsObj.massage);
            keybind.push(kb);
        } catch(e){
            // ignore parse errors
        }
    }
    // もしも配列が空だったら空行を追加
    if (keybind.length === 0) keybind.push(new Keybind());
}

// 最下行にスクロールする関数
function scrollToBottom(){
    const obj = tbl.parentElement;
    obj.scrollTop = obj.scrollHeight;
}

// 読み込み時に表を初期化
window.onload = () => {
    loadKeybinds();
    renderTable();
};

// トースト通知を表示する関数
function showToast(message, duration = 3000){
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    // 強制再描画してからクラスを付与（アニメーションのため）
    // eslint-disable-next-line no-unused-expressions
    toast.offsetHeight;
    toast.classList.add('show');

    // 自動で消す
    setTimeout(() => {
        toast.classList.remove('show');
        // アニメーションが終わったらDOMから削除
        setTimeout(() => container.removeChild(toast), 250);
    }, duration);
}
