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
    // remove the element and persist
    if (index < 0 || index >= keybind.length) return;
    keybind.splice(index, 1);
    // ensure at least one empty row remains
    if (keybind.length === 0) keybind.push(new Keybind());
    saveKeybinds();
    renderTable();
}

function renderTable(){
    // 表の初期化
    while (tbl.rows.length > 1) {
        tbl.deleteRow(1);
    }

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
        inpKey.value = bind.get_key() || "";
        tdKey.appendChild(inpKey);
        tr.appendChild(tdKey);

        // イベント
        const tdEvent = document.createElement("td");
        const sl = document.createElement('select');
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

        // 確定ボタン
        const tdSave = document.createElement("td");
        const btnSave = document.createElement("button");
        const img = document.createElement("img");
        img.src = 'フロッピーディスクアイコン1.png';
        img.alt = '確定';
        btnSave.appendChild(img);
        tdSave.classList.add('conf-btn');
        btnSave.onclick = () => {
            bind.add_key(inpKey.value);
            bind.add_event(sl.value);
            bind.add_topic(inpTopic.value);
            bind.add_massage(inpMsg.value);
            bind.change_json(i);
            bind.get_json(i);
            saveKeybinds();
        };
        tdSave.appendChild(btnSave);
        tr.appendChild(tdSave);

        // 削除ボタン
        const tdDel = document.createElement("td");
        const btnDel = document.createElement("button");
        btnDel.textContent = "−";
        tdDel.classList.add('delete-btn');
        btnDel.onclick = () => remove(i);
        tdDel.appendChild(btnDel);
        tr.appendChild(tdDel);

        tbl.appendChild(tr);
    });

    scrollToBottom();
}

// localStrage操作
function saveKeybinds(){
    const arr = keybind.map(k => ({ key: k.get_key(), event: k.get_event(), topic: k.get_topic(), massage: k.get_massage() }));
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k) continue;
        if (/^[0-9]+$/.test(k)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('keybinds', JSON.stringify(arr));
}

function loadKeybinds(){
    const data = localStorage.getItem('keybinds');
    if (data) {
        try {
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
                if (keybind.length === 0) keybind.push(new Keybind());
                return;
            }
        } catch(e){
            console.error('failed to parse keybinds', e);
        }
    }

    keybind = [];
    const numericKeys = [];
    for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k) continue;
        if (k === 'BrokerIP' || k === 'BrokerPORT' || k === 'keybinds') continue;
        if (!/^[0-9]+$/.test(k)) continue;
        numericKeys.push(k);
    }
    numericKeys.sort((a,b) => Number(a) - Number(b));
    for (const k of numericKeys){
        try{
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
    if (keybind.length === 0) keybind.push(new Keybind());
}

// スクロール
function scrollToBottom(){
    const obj = tbl.parentElement;
    obj.scrollTop = obj.scrollHeight;
}

// 初期化
window.onload = () => {
    loadKeybinds();
    renderTable();
};
