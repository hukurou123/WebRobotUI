/*
    table_operation.js
    表の行追加、削除、スクロール処理
*/

/*
TODO: 押されているキーを強調表示する機能
    コントローラーのボタン分のインジケーターを表示する
*/


let tbl = document.getElementById("tbl");
let gp_tbl = document.getElementById("gp_tbl");
let tp_tbl = document.getElementById("tp_tbl");
var keybind = [];
var padKeybind = [];
var cellId = ['', 'gp_', 'tp_'];
const GAME_BUTTONS = ['A','B','X','Y','LB','RB','LT','RT','Back','Start','L3','R3','Up','Down','Left','Right', 'Left X', 'Left Y', 'Right X', 'Right Y'];

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
            keySelect: false,
            idPrefix: ''
        }
    });
}


// 汎用的テーブルレンダラ
function renderGenericTable({tableId, data, options = {}, onSaveRow}){
    const { includeIndex = false, includeDelete = false, keyEditable = true, keySelect = false, idPrefix = '' } = options;
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
        } else if(!keyEditable && keySelect){
            const selKey = document.createElement('select');
            ['Up','Down', 'Left', 'Right'].forEach(opt => {
                const option = document.createElement('option');
                option.text = opt;
                // touchpad のキーは bind.key に保存されているはずなので、bind.key を基準に選択を設定
                if ((bind.key || '') === opt) option.selected = true;
                selKey.appendChild(option);
            });
            selKey.id = `${idPrefix}key${i}`;
            selKey.classList.add('cell');
            tdKey.appendChild(selKey);
        } else {
            tdKey.textContent = bind.key || '';
            tdKey.id = `${idPrefix}key${i}`;
            tdKey.classList.add('no-edit-cell');
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
    if (tableId === 'tbl') scrollToBottom(tbl);
    else if (tableId === 'tp_tbl') scrollToBottom(tp_tbl);
}


// localStrageに保存する関数
function saveKeybinds(){
    // 現在の入力状態を読み取って keybind / padKeybind / tpBind を個別に更新
    // keybind (main keys)
    for (let i = 0; i < keybind.length; i++){
        const inpKey = document.getElementById(`key${i}`);
        const sl = document.getElementById(`event${i}`);
        const inpTopic = document.getElementById(`topic${i}`);
        const inpMsg = document.getElementById(`massage${i}`);
        const kb = keybind[i] || new Keybind();
        if (inpKey && typeof kb.add_key === 'function') kb.add_key(inpKey.value);
        else if (inpKey) kb.key = inpKey.value;
        if (sl && typeof kb.add_event === 'function') kb.add_event(sl.value);
        else if (sl) kb.event = sl.value;
        if (inpTopic && typeof kb.add_topic === 'function') kb.add_topic(inpTopic.value);
        else if (inpTopic) kb.topic = inpTopic.value;
        if (inpMsg && typeof kb.add_massage === 'function') kb.add_massage(inpMsg.value);
        else if (inpMsg) kb.massage = inpMsg.value;
        keybind[i] = kb;
    }

    // padKeybind (gamepad)
    for (let i = 0; i < padKeybind.length; i++){
        const prefix = 'gp_';
        const inpKey = document.getElementById(`${prefix}key${i}`);
        const sl = document.getElementById(`${prefix}event${i}`);
        const inpTopic = document.getElementById(`${prefix}topic${i}`);
        const inpMsg = document.getElementById(`${prefix}massage${i}`);
        let pb = padKeybind[i] || { key: GAME_BUTTONS[i] || '', event: 'down', topic: '', massage: '' };
        if (inpKey){ pb.key = inpKey.value; }
        if (sl){ pb.event = sl.value; }
        if (inpTopic){ pb.topic = inpTopic.value; }
        if (inpMsg){ pb.massage = inpMsg.value; }
        padKeybind[i] = pb;
    }

    // tpBind (touchpad)
    if (typeof tpBind !== 'undefined'){
        for (let i = 0; i < tpBind.length; i++){
            const prefix = 'tp_';
            const inpKey = document.getElementById(`${prefix}key${i}`);
            const sl = document.getElementById(`${prefix}event${i}`);
            const inpTopic = document.getElementById(`${prefix}topic${i}`);
            const inpMsg = document.getElementById(`${prefix}massage${i}`);
            let tb = tpBind[i] || { key: '', event: 'down', topic: '', massage: '' };
            if (inpKey){ tb.key = inpKey.value; }
            if (sl){ tb.event = sl.value; }
            if (inpTopic){ tb.topic = inpTopic.value; }
            if (inpMsg){ tb.massage = inpMsg.value; }
            tpBind[i] = tb;
        }
    }

    // 配列をオブジェクト配列に変換して保存（Keybind インスタンスとプレーンオブジェクトの両方に対応）
    function toPlain(item){
        if (!item) return { key: '', event: '', topic: '', massage: '' };
        if (typeof item.get_key === 'function'){
            return { key: item.get_key(), event: item.get_event(), topic: item.get_topic(), massage: item.get_massage() };
        }
        return { key: item.key || '', event: item.event || '', topic: item.topic || '', massage: item.massage || '' };
    }

    const arr = keybind.map(toPlain);
    const padarr = padKeybind.map(toPlain);
    const tparr = (typeof tpBind !== 'undefined') ? tpBind.map(toPlain) : [];

    // ローカルストレージの数字キーは古い保存形式なので掃除
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k) continue;
        if (/^[0-9]+$/.test(k)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));

    localStorage.setItem('keybinds', JSON.stringify(arr));
    localStorage.setItem('gp_keybinds', JSON.stringify(padarr));
    localStorage.setItem('tp_keybinds', JSON.stringify(tparr));

    try{ showToast('Saved Successfully!'); }catch(e){ }
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
function scrollToBottom(scrollTarget){
    const obj = scrollTarget.parentElement;
    obj.scrollTop = obj.scrollHeight;
}




// --- pad table handling (fixed rows, no add/remove) -------------------------
function loadPadKeybinds(){
    const data = localStorage.getItem('gp_keybinds');
    padKeybind = [];
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                // restore as Keybind instances if possible
                padKeybind = parsed.map(obj => {
                    try{
                        const kb = new Keybind();
                        kb.add_key(obj.key);
                        kb.add_event(obj.event);
                        kb.add_topic(obj.topic);
                        kb.add_massage(obj.massage);
                        return kb;
                    }catch(e){
                        return { key: obj.key, event: obj.event, topic: obj.topic, massage: obj.massage };
                    }
                });
            }
        } catch(e){ console.error('failed to parse gp_keybinds', e); }
    }
    // ensure we have entries for all GAME_BUTTONS
    for (let i = 0; i < GAME_BUTTONS.length; i++){
        if (!padKeybind[i]) padKeybind[i] = { key: GAME_BUTTONS[i], event: 'down', topic: '', massage: '' };
        else padKeybind[i].key = GAME_BUTTONS[i];
    }
}

// load all three kinds of bindings from localStorage (key, pad, touch)
function loadAllKeybinds(){
    // main keybinds (existing logic)
    loadKeybinds();

    // pad keybinds
    loadPadKeybinds();
    // ensure entries exist for all GAME_BUTTONS
    for (let i = 0; i < GAME_BUTTONS.length; i++){
        if (!padKeybind[i]){
            const kb = new Keybind();
            kb.add_key(GAME_BUTTONS[i]);
            kb.add_event('down');
            kb.add_topic('');
            kb.add_massage('');
            padKeybind[i] = kb;
        } else {
            // if plain object, ensure key matches button label
            if (typeof padKeybind[i].get_key !== 'function') padKeybind[i].key = GAME_BUTTONS[i];
        }
    }

    // touchpad bindings: try to restore tp_keybinds if present
    const tpData = localStorage.getItem('tp_keybinds');
    if (tpData){
        try{
            const parsed = JSON.parse(tpData);
            if (Array.isArray(parsed)){
                // ensure tpBind exists (touchpad.js defines tpBind but it's global)
                if (typeof tpBind === 'undefined') window.tpBind = [];
                tpBind = parsed.map(obj => {
                    try{
                        const kb = new Keybind();
                        kb.add_key(obj.key);
                        kb.add_event(obj.event);
                        kb.add_topic(obj.topic);
                        kb.add_massage(obj.massage);
                        return kb;
                    }catch(e){
                        return { key: obj.key, event: obj.event, topic: obj.topic, massage: obj.massage };
                    }
                });
            }
        }catch(e){ console.error('failed to parse tp_keybinds', e); }
    }
    // ensure at least one touch row exists so UI has something
    if (typeof tpBind === 'undefined' || tpBind.length === 0){
        if (typeof tpBind === 'undefined') tpBind = [];
        tpBind.push(new Keybind());
    }
}

// ページ初期化時に padKeybind を GAME_BUTTONS の数だけ用意する（未保存ならデフォルト）
function initializePadKeybinds(){
    // 既に loadPadKeybinds() を使っている場合はそれを呼ぶ
    loadPadKeybinds();
    // 追加の安全措置: もし localStorage に何もなくても GAME_BUTTONS に合わせる
    for (let i = 0; i < GAME_BUTTONS.length; i++){
        if (!padKeybind[i]) padKeybind[i] = { key: GAME_BUTTONS[i], event: 'down', topic: '', massage: '' };
        else padKeybind[i].key = GAME_BUTTONS[i];
    }
}

function savePadKeybinds(){
    localStorage.setItem('gp_keybinds', JSON.stringify(padKeybind));
}

// 読み込み時に表を初期化
window.onload = () => {
    // load all bindings then render
    loadAllKeybinds();
    renderTable();
    renderPadTable();
    renderTouchTable();
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
