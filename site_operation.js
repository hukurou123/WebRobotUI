const tbl = document.getElementById("tbl");
let count = 0;
let keybind = [];

function add(){
    keybind[keybind.length] = Keybind;

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
    td1.setAttribute("id", "count");
    td1.setAttribute("name", rw);
    tr.appendChild(td1);

    //キー
    let td2 = document.createElement("td");
    let inp1 = document.createElement("input");
    inp1.setAttribute("id", "key");
    td2.appendChild(inp1);
    td2.setAttribute("name", rw);
    tr.appendChild(td2);

    //イベント
    let td3 = document.createElement("td");
    let sl = document.createElement('select');
    for (let num in iv){
        let op = document.createElement('option');
        op.text = iv[num];
        sl.appendChild(op);
    }
    sl.setAttribute("id", "ivent");
    td3.appendChild(sl);
    td3.setAttribute("name", rw);
    tr.appendChild(td3);

    //トピック
    let td4 = document.createElement("td");
    let inp2 = document.createElement("input");
    inp2.setAttribute("id", "topic");
    td4.appendChild(inp2);
    td4.setAttribute("name", rw);
    tr.appendChild(td4);

    //メッセージ
    let td5 = document.createElement("td");
    let inp3 = document.createElement("input");
    inp3.setAttribute("id", "massage");
    td5.appendChild(inp3);
    td5.setAttribute("name", rw);
    tr.appendChild(td5);

    // 確定ボタン用の列を追加
    let confTd = document.createElement("td");
    let confButton = document.createElement("button");
    let confimg = document.createElement("img");
    confimg.src = 'フロッピーディスクアイコン1.png'
    confimg.alt = '確定';

    //確定ボタンが押された時の処理
    confButton.onclick = function(){
        let rw = tbl.rows.length - 1;
        let key = document.getElementById('key');
        alert(key.value);
        // alert(tr.rowIndex);
        // keybind[tr.rowIndex].add_key()
    }

    confButton.appendChild(confimg);
    confTd.appendChild(confButton);
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

function del(){
    let rw = tbl.rows.length;
    if (rw > 2){
        tbl.deleteRow(rw-1);
    }
    scrollToBottom();
}

function resetRowNumbers(){
    let rows = tbl.rows;
    for (let i = 1; i < rows.length; i++){
        let cell = rows[i].cells[0];
        cell.textContent = i;
        cell.setAttribute("id", "count");
    }
}

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

window.onload = function(){
    add();
    document.querySelector('#aaa').classList.add("is-active");
}