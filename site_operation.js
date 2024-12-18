const tbl = document.getElementById("tbl");
let count = 0;
let keybind = [];

function add(){
    keybind[keybind.length] = new Keybind();
    console.log(keybind);

    //表を作るとこ
    let rw = tbl.rows.length;
    let tr = document.createElement("tr");
    let iv = ["down", "up"];
    
    //行番号
    let td1 = document.createElement("td");
    let p1 = document.createElement("p");
    let text1 = document.createTextNode(rw);
    p1.appendChild(text1);
    td1.appendChild(p1);
    p1.setAttribute("id", "count");
    tr.appendChild(td1);

    //キー
    let td2 = document.createElement("td");
    let inp1 = document.createElement("input");
    inp1.setAttribute("id", "key"+rw);
    inp1.setAttribute("class", "cell");
    td2.appendChild(inp1);
    tr.appendChild(td2);

    //イベント
    let td3 = document.createElement("td");
    let sl = document.createElement('select');
    for (let num in iv){
        let op = document.createElement('option');
        op.text = iv[num];
        sl.appendChild(op);
    }
    sl.setAttribute("id", "event"+rw);
    sl.setAttribute("class", "cell");
    td3.appendChild(sl);
    tr.appendChild(td3);

    //トピック
    let td4 = document.createElement("td");
    let inp2 = document.createElement("input");
    inp2.setAttribute("id", "topic"+rw);
    inp2.setAttribute("class", "cell");
    td4.appendChild(inp2);
    tr.appendChild(td4);

    //メッセージ
    let td5 = document.createElement("td");
    let inp3 = document.createElement("input");
    inp3.setAttribute("id", "massage"+rw);
    inp3.setAttribute("class", "cell");
    td5.appendChild(inp3);
    tr.appendChild(td5);

    // 確定ボタン用の列を追加
    let confTd = document.createElement("td");
    let confButton = document.createElement("button");
    let confimg = document.createElement("img");
    confimg.src = 'フロッピーディスクアイコン1.png'
    confimg.alt = '確定';

    //確定ボタンが押された時の処理
    confButton.onclick = function(){
        let rw = tr.rowIndex;
        let key = document.getElementById("key"+rw);
        let event = document.getElementById("event"+rw);
        let topic = document.getElementById("topic"+rw);
        let massage = document.getElementById("massage"+rw);
        console.log(key.value);
        console.log(event.value);
        console.log(topic.value);
        console.log(massage.value);
        console.log(tr.rowIndex);
        keybind[tr.rowIndex-1].add_key(key.value);
        keybind[tr.rowIndex-1].add_event(event.value);
        keybind[tr.rowIndex-1].add_topic(topic.value);
        keybind[tr.rowIndex-1].add_massage(massage.value);
    }

    confButton.appendChild(confimg);
    confTd.appendChild(confButton);
    confButton.setAttribute("id", "confButton"+rw);
    confTd.classList.add("conf-btn");
    confButton.classList.add("confirmedbtn");
    tr.appendChild(confTd);

    // 削除ボタン用の列を追加
    let delTd = document.createElement("td");
    let delButton = document.createElement("button");
    delButton.textContent = "−";
    
    // ボタンにクリックイベントを設定
    delButton.onclick = function() {
        let rw = tbl.rows.length;
        if (rw > 2){
            tbl.deleteRow(tr.rowIndex); // 行のインデックスを元に削除
            resetRowNumbers();
        }
    };
    
    delTd.appendChild(delButton);
    delTd.classList.add("delete-btn");
    tr.appendChild(delTd);

    tbl.appendChild(tr);
    scrollToBottom();
}

//削除機能
function del(){
    let rw = tbl.rows.length;
    if (rw > 2){
        tbl.deleteRow(rw-1);
    }
    scrollToBottom();
}

//番号の振り直し
function resetRowNumbers(){
    let rows = tbl.rows;
    for (let i = 1; i < rows.length; i++){
        let cell = rows[i].cells[0];
        let key = document.getElementById("key"+cell.textContent);
        let event = document.getElementById("event"+cell.textContent);
        let topic = document.getElementById("topic"+cell.textContent);
        let massage = document.getElementById("massage"+cell.textContent);
        cell.textContent = i;
        cell.setAttribute("id", "count");
        key.setAttribute("id", "key"+i);
        event.setAttribute("id", "event"+i);
        topic.setAttribute("id", "topic"+i);
        massage.setAttribute("id", "massage"+i);
    }
}

//キーが押された時
document.addEventListener('keydown', event => {
    if (event.key == keybind[0].get_key()){
        console.log(event.key+"です");
    }
})


//表を追加したら表の一番下に移動する
function scrollToBottom(){
    var obj = tbl.parentElement;
    obj.scrollTop = obj.scrollHeight;
}

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

//ページを読み込んだ時に行を追加しaaaのタブを有効化
window.onload = function(){
    add();
    document.querySelector('#aaa').classList.add("is-active");
}