/*
    table_operation.js
    表の行追加、削除、スクロール処理
*/


let tbl = document.getElementById("tbl");
let pad_tbl = document.getElementById("pad_tbl");
var keybind = [];
var padKeybind = [];
const PAD_BUTTONS = ['A','B','X','Y','LB','RB','LT','RT','Back','Start','L3','R3','Up','Down','Left','Right'];

// 行を追加する関数
function add(){
    keybind.push(new Keybind());
    renderTable();
}

// 行を削除する関数 (キー用)
function remove(index){
    // リストの範囲外だったら何もしない
    if (index < 0 || index >= keybind.length) return;

    keybind.splice(index, 1);
    // リストが空になったら空行を追加
    if (keybind.length === 0) keybind.push(new Keybind());

    renderTable();
}

// 表を描画する関数 (キー用)
function renderTable(){
    // 抽象化された共通レンダラを利用して描画
    renderGenericTable({
        tableId: 'tbl',
        data: keybind,
        options: {
            includeIndex: true,
            includeDelete: true,
            keyEditable: true,
            idPrefix: ''
        }
    });
}

// 表を描画する関数 (ゲームパッド用)
function renderPadTable(){
    renderGenericTable({
        tableId: 'pad_tbl',
        data: padKeybind,
        options: {
            includeIndex: false,
            includeDelete: false,
            keyEditable: false,
            idPrefix: 'pad_'
        },
    });
}


// 汎用的テーブルレンダラ
function renderGenericTable({tableId, data, options = {}, onSaveRow}){
    const { includeIndex = false, includeDelete = false, keyEditable = true, idPrefix = '' } = options;
    const tblEl = document.getElementById(tableId);
    if (!tblEl) return;

    // ヘッダは既存のものを利用する前提。行をすべて削除してから再描画
    while (tblEl.rows.length > 1) tblEl.deleteRow(1);

    data.forEach((bind, i) => {
        const tr = document.createElement('tr');

        if (includeIndex){
            const tdIndex = document.createElement('td');
            tdIndex.textContent = i + 1;
            tdIndex.classList.add('count');
            tr.appendChild(tdIndex);
        }

        // key cell
        const tdKey = document.createElement('td');
        if (keyEditable){
            const inpKey = document.createElement('input');
            inpKey.id = `${idPrefix}key${i}`;
            inpKey.classList.add('cell');
            inpKey.value = (typeof bind.get_key === 'function') ? bind.get_key() || '' : (bind.key || '');
            tdKey.appendChild(inpKey);
        } else {
            tdKey.textContent = bind.key || '';
            tdKey.id = `${idPrefix}key${i}`;
            tdKey.classList.add('no-edit-cell');
            // tdKey.classList.add('count');
        }
        tr.appendChild(tdKey);

        // event select
        const tdEvent = document.createElement('td');
        const sl = document.createElement('select');
        ['down','up'].forEach(opt => {
            const option = document.createElement('option'); option.text = opt; if ((bind.event || '') === opt) option.selected = true; sl.appendChild(option);
        });
        sl.id = `${idPrefix}event${i}`;
        sl.classList.add('cell');
        tdEvent.appendChild(sl);
        tr.appendChild(tdEvent);

        // topic
        const tdTopic = document.createElement('td');
        const inpTopic = document.createElement('input'); inpTopic.id = `${idPrefix}topic${i}`; inpTopic.classList.add('cell'); inpTopic.value = bind.topic || '';
        tdTopic.appendChild(inpTopic); tr.appendChild(tdTopic);

        // message
        const tdMsg = document.createElement('td');
        const inpMsg = document.createElement('input'); inpMsg.id = `${idPrefix}massage${i}`; inpMsg.classList.add('cell'); inpMsg.value = bind.massage || '';
        tdMsg.appendChild(inpMsg); tr.appendChild(tdMsg);

        // delete (optional)
        if (includeDelete){
            const tdDel = document.createElement('td');
            tdDel.classList.add('delete-btn');
            const btnDel = document.createElement('button'); btnDel.textContent = '−'; btnDel.onclick = () => { if (typeof data.splice === 'function') { data.splice(i,1); /* re-render */ renderGenericTable({tableId, data, options, onSaveRow}); } };
            tdDel.appendChild(btnDel);
            tr.appendChild(tdDel);
        }

        tblEl.appendChild(tr);
    });

    // scroll (if this table is the main one, keep legacy behavior)
    if (tableId === 'tbl') scrollToBottom();
}


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




// --- pad table handling (fixed rows, no add/remove) -------------------------
function loadPadKeybinds(){
    const data = localStorage.getItem('pad_keybinds');
    padKeybind = [];
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                padKeybind = parsed.map(obj => ({ key: obj.key, event: obj.event, topic: obj.topic, massage: obj.massage }));
            }
        } catch(e){ console.error('failed to parse pad_keybinds', e); }
    }
    // ensure we have entries for all PAD_BUTTONS
    for (let i = 0; i < PAD_BUTTONS.length; i++){
        if (!padKeybind[i]) padKeybind[i] = { key: PAD_BUTTONS[i], event: 'down', topic: '', massage: '' };
        else padKeybind[i].key = PAD_BUTTONS[i];
    }
}

// ページ初期化時に padKeybind を PAD_BUTTONS の数だけ用意する（未保存ならデフォルト）
function initializePadKeybinds(){
    // 既に loadPadKeybinds() を使っている場合はそれを呼ぶ
    loadPadKeybinds();
    // 追加の安全措置: もし localStorage に何もなくても PAD_BUTTONS に合わせる
    for (let i = 0; i < PAD_BUTTONS.length; i++){
        if (!padKeybind[i]) padKeybind[i] = { key: PAD_BUTTONS[i], event: 'down', topic: '', massage: '' };
        else padKeybind[i].key = PAD_BUTTONS[i];
    }
}

function savePadKeybinds(){
    localStorage.setItem('pad_keybinds', JSON.stringify(padKeybind));
}

// 読み込み時に表を初期化
window.onload = () => {
    loadKeybinds();
    renderTable();
    // initialize padKeybinds to the controller buttons and render
    initializePadKeybinds();
    renderPadTable();
    // loadPadKeybinds();
    // renderPadTable();
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
