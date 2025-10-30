/*
    touchpad.js
    タッチパッドに関する処理
*/

const tpTable = () => document.getElementById('tp_tbl');
let tpBind = [];

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

// タッチパッドが押されたときに通信する処理
// function tpPublishFor(buttonName, phase){
//     try{
//         for (let i=0; i<tpLengthGet(); i++){
//             const json = localStorage.getItem(tpStorageKey(i));
//             if (!json) continue;
//             const js = JSON.parse(json);
//             if (js.key === buttonName && js.event === phase){
//                 if (typeof client !== 'undefined' && client){
//                     client.publish(js.topic, js.message);
//                 }
//             }
//         }
//     }catch(e){ console.warn('tp publish error', e); }
// }

// document.addEventListener('keydown', event => {
//     setupKeyPublish(tpBind, 'tp_tbl', 'down', event);
// });

// document.addEventListener('keyup', event => {
//     setupKeyPublish(tpBind, 'tp_tbl', 'up', event);
// });

// タッチパッドが押されたときの処理を設定
function tpBindButtonPress(el){
    const name = el.dataset.button;
    // const down = () => tpPublishFor(name,'down');
    const down = () => setupKeyPublish(tpBind, 'tp_tbl', 'down', name);
    // const up = () => tpPublishFor(name,'up');
    const up = () => setupKeyPublish(tpBind, 'tp_tbl', 'up', name);

    // touch 
    // 3つ目の項目は意図しないタッチの中断があった場合(別アプリに切り替えた時とか)に発火するやつ
    // 安全性としては必要だけど今はいいや
    el.addEventListener('touchstart', e => { e.preventDefault(); down(); }, {passive:false});
    el.addEventListener('touchend', e => { e.preventDefault(); up(); }, {passive:false});
    // el.addEventListener('touchcancel', e => { e.preventDefault(); up(); }, {passive:false});
    // mouse
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseup', up);
    // el.addEventListener('mouseleave', up);
}

// 画面がロードされたときの処理
window.addEventListener('load', () => {
    // bind dpad buttons
    ['tp_up','tp_down','tp_left','tp_right'].forEach(id => {
        const el = document.getElementById(id);
        if (el) tpBindButtonPress(el);
    });
});

