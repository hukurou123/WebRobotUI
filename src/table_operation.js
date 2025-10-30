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

// 汎用的テーブルレンダラ
function renderGenericTable({tableId, data, options = {}, onSaveRow}){
    const { includeIndex = false, includeDelete = false, keyEditable = true, keySelect = false, idPrefix = '' } = options;
    // tableIdの要素をとってくる．なければ終了
    const tblEl = document.getElementById(tableId);
    if (!tblEl) return;

    // ヘッダは既存のものを利用する前提。行をすべて削除してから再描画
    while (tblEl.rows.length > 1) tblEl.deleteRow(1);

    // dataの分だけ繰り返し仮変数bindは設定されているキー情報
    data.forEach((bind, i) => {
        const tr = document.createElement('tr');

    // 行番号
        if (includeIndex){
            const tdIndex = document.createElement('td');
            tdIndex.textContent = i + 1;
            tdIndex.classList.add('count');
            tr.appendChild(tdIndex);
        }

    // keyの列
        const tdKey = document.createElement('td');
        // keyの列が編集可能な場合
        if (keyEditable){
            const inpKey = document.createElement('input');
            inpKey.id = `${idPrefix}key${i}`;
            inpKey.classList.add('cell');
            // 三項演算子と論理和演算子を使っていろいろ
            // bind.get_keyが関数型ならvalueにbind.get_key()(それがなければ'')を入れる
            // bind.get_keyが関数型でないならvalueにbind.key(それがなければ'')を入れる
            inpKey.value = (typeof bind.get_key === 'function') ? bind.get_key() || '' : (bind.key || '');
            tdKey.appendChild(inpKey);
        // keyの列が編集不可能な場合(選択)
        } else if(!keyEditable && keySelect){
            const selKey = document.createElement('select');
            // 本当はここも引数にして拡張性を高めるべきなんだけど面倒くさいなー
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
        // keyの列が編集不可能な場合(ゲームパッド)
        } else {
            // 論理和演算子 bind.keyがあるならそれを入れて，なければ''を入れる
            tdKey.textContent = bind.key || '';
            tdKey.id = `${idPrefix}key${i}`;
            tdKey.classList.add('no-edit-cell');
        }
        tr.appendChild(tdKey);

    // eventの列
        const tdEvent = document.createElement('td');
        const sl = document.createElement('select');
        // down,upの配列を仮変数optで繰り返す
        ['down','up'].forEach(opt => {
            const option = document.createElement('option'); 
            option.text = opt; 
            // すでに保存されている選択肢を表示
            // bind.eventあるいは''がoptと完全一致したなら option.selectedをtrueに
            if ((bind.event || '') === opt) option.selected = true; 
            sl.appendChild(option);
        });
        sl.id = `${idPrefix}event${i}`;
        sl.classList.add('cell');
        tdEvent.appendChild(sl);
        tr.appendChild(tdEvent);

    // topicの列
        const tdTopic = document.createElement('td');
        const inpTopic = document.createElement('input'); 
        inpTopic.id = `${idPrefix}topic${i}`; 
        inpTopic.classList.add('cell'); 
        inpTopic.value = bind.topic || '';
        tdTopic.appendChild(inpTopic); tr.appendChild(tdTopic);

    // messageの列
        const tdMsg = document.createElement('td');
        const inpMsg = document.createElement('input'); 
        inpMsg.id = `${idPrefix}message${i}`; 
        inpMsg.classList.add('cell'); 
        inpMsg.value = bind.message || '';
        tdMsg.appendChild(inpMsg); tr.appendChild(tdMsg);

    // deleteの列(optional)
        if (includeDelete){
            const tdDel = document.createElement('td');
            tdDel.classList.add('delete-btn');
            const btnDel = document.createElement('button'); 
            btnDel.textContent = '−'; 
            // ラムダ式 delボタンがクリックされたときの処理
            btnDel.onclick = () => { 
                if (typeof data.splice === 'function') {
                    // splice : つなぎ合わせる 
                    // javascriptのArreyインスタンスメソッド
                    data.splice(i,1); 
                    // 再描画
                    renderGenericTable({tableId, data, options, onSaveRow}); 
                } 
            };
            tdDel.appendChild(btnDel);
            tr.appendChild(tdDel);
        }

        tblEl.appendChild(tr);
    });

    // scroll (if this table is the main one, keep legacy behavior)
    if (tableId === 'tbl') scrollToBottom(tbl);
    else if (tableId === 'tp_tbl') scrollToBottom(tp_tbl);
}

// 最下行にスクロールする関数
function scrollToBottom(scrollTarget){
    // scrollTargetの親の要素を取得
    const obj = scrollTarget.parentElement;
    // 親オブジェクトの高さだけ下に？？ここはよくわかんない
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
                        kb.add_message(obj.message);
                        return kb;
                    }catch(e){
                        return { key: obj.key, event: obj.event, topic: obj.topic, message: obj.message };
                    }
                });
            }
        } catch(e){ console.error('failed to parse gp_keybinds', e); }
    }
    // ensure we have entries for all GAME_BUTTONS
    for (let i = 0; i < GAME_BUTTONS.length; i++){
        if (!padKeybind[i]) padKeybind[i] = { key: GAME_BUTTONS[i], event: 'down', topic: '', message: '' };
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
            kb.add_message('');
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
                        kb.add_message(obj.message);
                        return kb;
                    }catch(e){
                        return { key: obj.key, event: obj.event, topic: obj.topic, message: obj.message };
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
        if (!padKeybind[i]) padKeybind[i] = { key: GAME_BUTTONS[i], event: 'down', topic: '', message: '' };
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
