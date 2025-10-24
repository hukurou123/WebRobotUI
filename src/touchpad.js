// TouchPad settings and operation logic

const tpTable = () => document.getElementById('tp_tbl');
let tpBind = [];

function tpStorageKey(i){ return `tp:${i}`; }
function tpLengthGet(){ return parseInt(localStorage.getItem('tp:length') || '0', 10); }
function tpLengthSet(v){ localStorage.setItem('tp:length', String(v)); }

function tpAdd(){
    tpBind.push(new Keybind());
    renderTouchTable();
}

function renderTouchTable(){
    renderGenericTable({
        tableId: 'tp_tbl',
        data: tpBind,
        options: {
            includeIndex: true,
            includeDelete: true,
            keyEditable: false,
            keySelect: true,
            idPrefix: 'tp_'
        },
    });
}

// function tpLoad(){
//     // ensure at least one row
//     tpAdd();
//     const len = tpLengthGet();
//     for (let i=0; i<len; i++){
//         const json = localStorage.getItem(tpStorageKey(i));
//         if (!json) continue;
//         const js = JSON.parse(json);
//         // ensure row exists
//         if (tpTable().rows.length-1 < i+1) tpAdd();
//         const rowIdx = i+1;
//         document.getElementById(`tp_button${rowIdx}`).value = js.key;
//         const evSel = document.getElementById(`tp_event${rowIdx}`);
//         for (let o of evSel.options){ if (o.text === js.event){ o.selected = true; break; } }
//         document.getElementById(`tp_topic${rowIdx}`).value = js.topic;
//         document.getElementById(`tp_massage${rowIdx}`).value = js.massage;
//         tpBind[i] = js;
//         // add another empty row for convenience
//         if (rowIdx === len) tpAdd();
//     }
// }

function tpToggleViews(){
    const settings = document.getElementById('tp_settings');
    const operate = document.getElementById('tp_operate');
    const btn = document.getElementById('tp-toggle');
    const settingsActive = settings.classList.contains('is-active');
    if (settingsActive){
        settings.classList.remove('is-active');
        operate.classList.add('is-active');
        btn.textContent = 'settings';
    } else {
        operate.classList.remove('is-active');
        settings.classList.add('is-active');
        btn.textContent = 'operate';
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

