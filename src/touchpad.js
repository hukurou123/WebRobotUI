// TouchPad settings and operation logic

const tpTable = () => document.getElementById('tp_tbl');
let tpBind = [];

function tpStorageKey(i){ return `tp:${i}`; }
function tpLengthGet(){ return parseInt(localStorage.getItem('tp:length') || '0', 10); }
function tpLengthSet(v){ localStorage.setItem('tp:length', String(v)); }

function tpAdd(){
    const tbl = tpTable();
    const rw = tbl.rows.length; // header is row 0
    const tr = document.createElement('tr');
    const events = ['down','up'];
    const buttons = ['Up','Down','Left','Right'];

    // index
    const td1 = document.createElement('td');
    const p1 = document.createElement('p');
    p1.textContent = rw; // display index
    p1.setAttribute('id','tp_count');
    td1.appendChild(p1);
    tr.appendChild(td1);

    // button select
    const tdBtn = document.createElement('td');
    const selBtn = document.createElement('select');
    buttons.forEach(b => { const op=document.createElement('option'); op.text=b; selBtn.appendChild(op); });
    selBtn.setAttribute('id', `tp_button${rw}`);
    selBtn.setAttribute('class','cell');
    tdBtn.appendChild(selBtn);
    tr.appendChild(tdBtn);

    // event select
    const tdEvent = document.createElement('td');
    const selEv = document.createElement('select');
    events.forEach(e => { const op=document.createElement('option'); op.text=e; selEv.appendChild(op); });
    selEv.setAttribute('id', `tp_event${rw}`);
    selEv.setAttribute('class','cell');
    tdEvent.appendChild(selEv);
    tr.appendChild(tdEvent);

    // topic input
    const tdTopic = document.createElement('td');
    const inpTopic = document.createElement('input');
    inpTopic.setAttribute('id', `tp_topic${rw}`);
    inpTopic.setAttribute('class','cell');
    tdTopic.appendChild(inpTopic);
    tr.appendChild(tdTopic);

    // massage input
    const tdMsg = document.createElement('td');
    const inpMsg = document.createElement('input');
    inpMsg.setAttribute('id', `tp_massage${rw}`);
    inpMsg.setAttribute('class','cell');
    tdMsg.appendChild(inpMsg);
    tr.appendChild(tdMsg);

    // confirm button
    const tdConf = document.createElement('td');
    const btnConf = document.createElement('button');
    btnConf.textContent = 'OK';
    btnConf.onclick = function(){
        const index = tr.rowIndex - 1; // zero-based
        const btn = document.getElementById(`tp_button${tr.rowIndex}`);
        const ev = document.getElementById(`tp_event${tr.rowIndex}`);
        const topic = document.getElementById(`tp_topic${tr.rowIndex}`);
        const msg = document.getElementById(`tp_massage${tr.rowIndex}`);
        const obj = { key: btn.value, event: ev.value, topic: topic.value, massage: msg.value };
        tpBind[index] = obj;
        localStorage.setItem(tpStorageKey(index), JSON.stringify(obj));
        const maxLen = Math.max(tpLengthGet(), index+1);
        tpLengthSet(maxLen);
        console.log('tp saved', index, obj);
    };
    tdConf.classList.add('conf-btn');
    btnConf.classList.add('confirmedbtn');
    tdConf.appendChild(btnConf);
    tr.appendChild(tdConf);

    // delete button
    const tdDel = document.createElement('td');
    const btnDel = document.createElement('button');
    btnDel.textContent = '×';
    btnDel.onclick = function(){
        const idx = tr.rowIndex; // 1-based incl header
        const table = tpTable();
        if (table.rows.length > 2){
            table.deleteRow(idx);
            tpResetRowNumbers();
        }
    };
    tdDel.classList.add('delete-btn');
    tdDel.appendChild(btnDel);
    tr.appendChild(tdDel);

    tpTable().appendChild(tr);
    tpScrollToBottom();
}

function tpResetRowNumbers(){
    const table = tpTable();
    const rows = table.rows;
    // reindex IDs and persist order
    tpBind = [];
    for (let i=1; i<rows.length; i++){
        const cell = rows[i].cells[0];
        const oldIdx = parseInt(cell.textContent, 10);
        const btn = document.getElementById(`tp_button${oldIdx}`);
        const ev = document.getElementById(`tp_event${oldIdx}`);
        const topic = document.getElementById(`tp_topic${oldIdx}`);
        const msg = document.getElementById(`tp_massage${oldIdx}`);

        cell.textContent = i; // display index
        btn.setAttribute('id', `tp_button${i}`);
        ev.setAttribute('id', `tp_event${i}`);
        topic.setAttribute('id', `tp_topic${i}`);
        msg.setAttribute('id', `tp_massage${i}`);

        const obj = { key: btn.value, event: ev.value, topic: topic.value, massage: msg.value };
        tpBind[i-1] = obj;
        localStorage.setItem(tpStorageKey(i-1), JSON.stringify(obj));
    }
    // trim storage
    const newLen = rows.length - 1;
    tpLengthSet(newLen);
    for (let i=newLen; ; i++){
        const k = tpStorageKey(i);
        if (!localStorage.getItem(k)) break;
        localStorage.removeItem(k);
    }
}

function tpScrollToBottom(){
    const obj = tpTable().parentElement;
    obj.scrollTop = obj.scrollHeight;
}

function tpLoad(){
    // ensure at least one row
    tpAdd();
    const len = tpLengthGet();
    for (let i=0; i<len; i++){
        const json = localStorage.getItem(tpStorageKey(i));
        if (!json) continue;
        const js = JSON.parse(json);
        // ensure row exists
        if (tpTable().rows.length-1 < i+1) tpAdd();
        const rowIdx = i+1;
        document.getElementById(`tp_button${rowIdx}`).value = js.key;
        const evSel = document.getElementById(`tp_event${rowIdx}`);
        for (let o of evSel.options){ if (o.text === js.event){ o.selected = true; break; } }
        document.getElementById(`tp_topic${rowIdx}`).value = js.topic;
        document.getElementById(`tp_massage${rowIdx}`).value = js.massage;
        tpBind[i] = js;
        // add another empty row for convenience
        if (rowIdx === len) tpAdd();
    }
}

function tpToggleViews(){
    const settings = document.getElementById('tp_settings');
    const operate = document.getElementById('tp_operate');
    const btn = document.getElementById('tp_toggle');
    const settingsActive = settings.classList.contains('is-active');
    if (settingsActive){
        settings.classList.remove('is-active');
        operate.classList.add('is-active');
        btn.textContent = '設定';
    } else {
        operate.classList.remove('is-active');
        settings.classList.add('is-active');
        btn.textContent = '操作';
    }
}

function tpPublishFor(buttonName, phase){
    try{
        for (let i=0; i<tpLengthGet(); i++){
            const json = localStorage.getItem(tpStorageKey(i));
            if (!json) continue;
            const js = JSON.parse(json);
            if (js.key === buttonName && js.event === phase){
                if (typeof client !== 'undefined' && client){
                    client.publish(js.topic, js.massage);
                }
            }
        }
    }catch(e){ console.warn('tp publish error', e); }
}

function tpBindButtonPress(el){
    const name = el.dataset.button;
    const down = () => tpPublishFor(name,'down');
    const up = () => tpPublishFor(name,'up');

    // touch
    el.addEventListener('touchstart', e => { e.preventDefault(); down(); }, {passive:false});
    el.addEventListener('touchend', e => { e.preventDefault(); up(); }, {passive:false});
    el.addEventListener('touchcancel', e => { e.preventDefault(); up(); }, {passive:false});
    // mouse
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseup', up);
    el.addEventListener('mouseleave', up);
}

window.addEventListener('load', () => {
    // prepare settings table
    tpLoad();
    const toggle = document.getElementById('tp_toggle');
    if (toggle){ toggle.addEventListener('click', tpToggleViews); }
    // bind dpad buttons
    ['tp_up','tp_down','tp_left','tp_right'].forEach(id => {
        const el = document.getElementById(id);
        if (el) tpBindButtonPress(el);
    });
});

