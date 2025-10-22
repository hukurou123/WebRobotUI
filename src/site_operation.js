/* 
    site_opeqration.js
    タブ切り替え処理
    画面読み込み時の初期処理
*/


// 任意のタブにURLからリンクするための設定
function GethashID (hashIDName){
    if (hashIDName) {
        const tabs = document.querySelectorAll('.tab li a');
        tabs.forEach(function (tab) {
            const idName = tab.getAttribute('href');
            if (idName === hashIDName) {
                const parentElm = tab.parentElement;
                document.querySelectorAll('.tab li').forEach(function (li) {
                    li.classList.remove("active");
                });
                parentElm.classList.add("active");

                // 表示させるエリア設定
                document.querySelectorAll(".area").forEach(function (area) {
                    area.classList.remove("is-active");
                });
                document.querySelector(hashIDName).classList.add("is-active");
            }
        });
    }
}

// タブをクリックしたら
document.querySelectorAll('.tab a').forEach(function (tab) {
    tab.addEventListener('click', function (event) {
        event.preventDefault();
        const idName = this.getAttribute('href');
        GethashID(idName);
    });
});

// 上記の動きをページが読み込まれたらすぐに動かす
window.addEventListener('load', function () {
    document.querySelector('.tab li:first-of-type').classList.add("active");
    document.querySelector('.area:first-of-type').classList.add("is-active");
    const hashName = location.hash;
    GethashID(hashName);

    // 表をロード時に追加
    add();
});

//ページを読み込んだ時に行を追加しkeyのタブを有効化
window.onload = function(){
    add();
    document.querySelector('#key').classList.add("is-active");
    if (localStorage.hasOwnProperty("BrokerIP")&&localStorage.hasOwnProperty("BrokerPORT")){
        let ipName = document.getElementById("ip_name");
        let portName = document.getElementById("port_name");
        ipName.value = localStorage.getItem("BrokerIP");
        portName.value = localStorage.getItem("BrokerPORT");
    }
    for (let i=0; i<localStorage.length; i++){
        let j=i+1;
        let key = document.getElementById("key"+j);    
        let event = document.getElementById("event"+j);
        let topic = document.getElementById("topic"+j);
        let massage = document.getElementById("massage"+j);
        let jsonObj = localStorage.getItem(i);
        let jsObj = JSON.parse(jsonObj);
        keybind[i].add_key(jsObj.key);
        keybind[i].add_event(jsObj.event);
        keybind[i].add_topic(jsObj.topic);
        keybind[i].add_massage(jsObj.massage);
        key.value = keybind[i].get_key();
        if (keybind[i].get_event() == "down"){
            event.options[0].selected = true;
        }else if(keybind[i].get_event() == "up"){
            event.options[1].selected = true;
        }
        topic.value = keybind[i].get_topic();
        massage.value = keybind[i].get_massage();
        add();
    }
}