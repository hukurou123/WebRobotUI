// TouchPad settings and operation logic

const tpTable = () => document.getElementById('tp_tbl');
let tpBind = [];

function tpStorageKey(i){ return `tp:${i}`; }
function tpLengthGet(){ return parseInt(localStorage.getItem('tp:length') || '0', 10); }
function tpLengthSet(v){ localStorage.setItem('tp:length', String(v)); }

function tpAdd(){
    // 再描画する前に今の入力内容をkeybind配列に保存
    syncInputsToKeybind('tp_tbl', 'tp_', tpBind);
    tpBind.push(new Keybind());
    renderTouchTable();
}

// touchpadの表を描画する
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

// 汎用ロード関数を利用してlocalStrageからロードする
function loadTouchKeybinds(){
    tpBind = loadKeybindArray('tp_keybinds', true);
}

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
                    client.publish(js.topic, js.message);
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
    // if (toggle){ toggle.addEventListener('click', tpToggleViews); }
    // bind dpad buttons
    ['tp_up','tp_down','tp_left','tp_right'].forEach(id => {
        const el = document.getElementById(id);
        if (el) tpBindButtonPress(el);
    });
});

