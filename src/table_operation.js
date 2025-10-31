/*
    table_operation.js
    表の行追加、削除、スクロール処理
    localStrageのセーブ・ロード
*/

/*
TODO: 押されているキーを強調表示する機能
    コントローラーのボタン分のインジケーターを表示する
*/


let tbl = document.getElementById("tbl");
let gp_tbl = document.getElementById("gp_tbl");
let tp_tbl = document.getElementById("tp_tbl");
var keybind = [];
var gameKeybind = [];
var cellId = ['', 'gp_', 'tp_'];

// 保存前のキーを配列に同期させる関数
function syncInputsToKeybind(tableId, cellId, targetArray){
    // tableIdの要素を取得
    const tblEl = document.getElementById(tableId);
    const rows = tblEl.querySelectorAll('tr');
    // 新しい配列を作って今表に入力してある要素をすべて配列に入れる
    // 既存の配列にそのままやるとうまくいかないみたい
    const newArray = Array.from(rows).slice(1).map((row, i) => {
        const kb = new Keybind();
        const keyEl = row.querySelector(`#${cellId}key${i}`);
        const eventEl = row.querySelector(`#${cellId}event${i}`);
        const topicEl = row.querySelector(`#${cellId}topic${i}`);
        const msgEl = row.querySelector(`#${cellId}message${i}`);
        kb.add_key(keyEl?.value || '');
        kb.add_event(eventEl?.value || '');
        kb.add_topic(topicEl?.value || '');
        kb.add_message(msgEl?.value || '');
        return kb;
    });

    // 既存の配列をいったん削除
    targetArray.length = 0;
    // 既存の配列に新しく作った配列を入れなおす
    // ...newArrayはスプレッド構文
    targetArray.push(...newArray);
}


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
        const keyName = bind.key || '';  
        if (['Left X', 'Left Y', 'Right X', 'Right Y'].includes(keyName)) {
            inpMsg.disabled = true;
            inpMsg.placeholder = '(stick input)';
            // inpMsg.classList.add('disabled-cell'); // CSSで見た目変えたいなら
            inpMsg.dataset.axisName = keyName;
        }
        tdMsg.appendChild(inpMsg); 
        tr.appendChild(tdMsg);

    // deleteの列(optional)
        if (includeDelete){
            const tdDel = document.createElement('td');
            tdDel.classList.add('delete-btn');
            const btnDel = document.createElement('button'); 
            btnDel.textContent = '−'; 
            // ラムダ式 delボタンがクリックされたときの処理
            btnDel.onclick = () => {
                if (typeof data.splice === 'function') {
                    data.splice(i, 1);
                    // 再描画せずにその行だけ削除
                    const row = btnDel.closest('tr');
                    if (row) row.remove();
                    // もし入力内容とdataの同期が必要なら、ここで呼ぶ
                    syncInputsToKeybind(tableId, idPrefix, data);
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

// 汎用ロード
function loadKeybindArray(keyName, addDefaults = true) {
    // keyNameの要素をhtmlから取得
    const data = localStorage.getItem(keyName);
    let arr = [];
    // dataがあれば
    if (data) {
        try {
            // dataをJSON形式の文字列に変換
            const parsed = JSON.parse(data);
            // 文字列を配列に変換できるなら
            if (Array.isArray(parsed)) {
                // map型に変換．中身はKeybindのインスタンス
                arr = parsed.map(obj => {
                    try {
                        // Keybindのインスタンスを作成，初期化
                        const kb = new Keybind();
                        kb.add_key(obj.key);
                        kb.add_event(obj.event);
                        kb.add_topic(obj.topic);
                        kb.add_message(obj.message);
                        return kb;
                    } catch (e) {
                        // エラーキャッチ
                        console.warn(`Invalid Keybind entry in ${keyName}`, e);
                        return { key: obj.key, event: obj.event, topic: obj.topic, message: obj.message };
                    }
                });
            }
        } catch (e) {
            // エラーキャッチ
            console.error(`Failed to parse ${keyName}`, e);
        }
    }
    // 何も保存されていないデフォルト状態で1行追加する必要がある場合追加
    // KeybindとTouchPadの場合(GamePadはボタン数だけ標準で作成されるので必要ない)
    if (addDefaults && arr.length === 0) {
        arr.push(new Keybind());
    }
    return arr;
}

// 全localStorageをオブジェクトで取得
function getAllLocalStorage(){
    const obj = {};
    for (let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        obj[key] = localStorage.getItem(key);
    }
    return obj;
}

// すべてのキーバインドをロードする(key, game, touch)
function loadAllKeybinds(){
    loadKeybinds();
    loadGameKeybinds();
    loadTouchKeybinds();
}

// ページ読み込み時に表を初期化
window.onload = () => {
    // localStrage通りに表を復元
    loadAllKeybinds();
    renderTable();
    renderGameTable();
    renderTouchTable();
    // ipとポート番号をlocalStrageに保存されてる通りに復元
    const ip = localStorage.getItem('BrokerIP');
    const port = localStorage.getItem('BrokerPORT');
    const ipEl = document.getElementById('ip_name');
    const portEl = document.getElementById('port_name');
    if (ip && ipEl) ipEl.value = ip;
    if (port && portEl) portEl.value = port;
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
