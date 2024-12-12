const tbl = document.getElementById("tbl");
let count = 0;
let keybind = [];

function add(){
    keybind[keybind.length] = Keybind;
    let rw = tbl.rows.length;
    let tr = document.createElement("tr");
    let iv = ["down", "up"];
    for(let i=0;i<5;i++){
        if (i==0){
            let td = document.createElement("td");
            let p1 = document.createElement("p");
            let text1 = document.createTextNode(rw);
            p1.appendChild(text1);
            td.appendChild(p1);
            td.setAttribute("id", "count");
            tr.appendChild(td);
        }
        else if (i==2){
            let td = document.createElement("td");
            let sl = document.createElement('select');
            for (let num in iv){
                let op = document.createElement('option');
                op.text = iv[num];
                sl.appendChild(op);
            }
            sl.setAttribute("id", "val");
            td.appendChild(sl);
            tr.appendChild(td);
        } else {
            let td = document.createElement("td");
            let inp = document.createElement("input");
            inp.setAttribute("id", "val");
            td.appendChild(inp);
            tr.appendChild(td);
        }
    }

    // 確定ボタン用の列を追加
    let confTd = document.createElement("td");
    let confButton = document.createElement("button");
    let confimg = document.createElement("img");
    confimg.src = 'icons8-セーブ-48.png'
    confimg.alt = '確定';

    confButton.onclick = function(){
        let rw = tbl.rows.length - 1;
        alert(rw);
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

// 全てのテキストフィールドを取得
const textFields = document.querySelectorAll('input[type="text"], textarea');

// 全てのテキストフィールドにフォーカスが当たっているかどうかを監視
let isAnyFieldFocused = false;

// フォーカスが外れた際の処理
function handleFocusOut() {
    setTimeout(() => {
        if (!isAnyFieldFocused) {
            alert('全てのテキストフィールドからフォーカスが外れました');
        }
    }, 0); // 次のフォーカスが決定されるのを待つ
}

// フォーカスが当たった場合の処理
function handleFocusIn() {
    isAnyFieldFocused = true; // どれかのフィールドにフォーカスがある
}

// テキストフィールドにフォーカスが当たった場合と外れた場合にイベントを設定
textFields.forEach(field => {
    field.addEventListener('focusin', handleFocusIn);
    field.addEventListener('focusout', () => {
        isAnyFieldFocused = false; // フォーカスが外れた
        handleFocusOut();          // フォーカス外れ後の処理を実行
    });
});


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