const tbl = document.getElementById("tbl");
let count = 0;
let keybind = [];

// 行を追加する関数
function add(){
    //インスタンスを配列内に新規作成
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
        //押された確定ボタンが何行目か
        let rw = tr.rowIndex;
        let index = tr.rowIndex-1;
        //押された行番目の要素を取得
        let key = document.getElementById("key"+rw);    
        let event = document.getElementById("event"+rw);
        let topic = document.getElementById("topic"+rw);
        let massage = document.getElementById("massage"+rw);
        //配列内のインスタンスに入力情報を登録
        keybind[index].add_key(key.value);
        keybind[index].add_event(event.value);
        keybind[index].add_topic(topic.value);
        keybind[index].add_massage(massage.value);
        keybind[index].change_json(index);
        keybind[index].get_json(index);
    }

    //確定ボタン作成つづき
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
        //表の長さを取得
        let rw = tbl.rows.length;
        //表の要素が2個以上あるなら
        if (rw > 2){
            tbl.deleteRow(tr.rowIndex); // 行のインデックスを元に削除
            resetRowNumbers();          //行番号の振り直し
        }
    };
    
    //削除ボタン作成つづき
    delTd.appendChild(delButton);
    delTd.classList.add("delete-btn");
    tr.appendChild(delTd);

    tbl.appendChild(tr);
    scrollToBottom();
}


//番号の振り直しをする関数
function resetRowNumbers(){
    //表の各番号を取得
    let rows = tbl.rows;
    //1番目から表の最後まで
    for (let i = 1; i < rows.length; i++){
        let cell = rows[i].cells[0];    //行番号の要素を取得
        //行の各入力フォームの要素を取得
        let key = document.getElementById("key"+cell.textContent);
        let event = document.getElementById("event"+cell.textContent);
        let topic = document.getElementById("topic"+cell.textContent);
        let massage = document.getElementById("massage"+cell.textContent);
        //配列を入れ替え
        keybind[i-1] = keybind[cell.textContent-1];
        cell.textContent = i;   //行番号を振り直し
        //行の各入力フォームのidを振り直し
        cell.setAttribute("id", "count");
        key.setAttribute("id", "key"+i);
        event.setAttribute("id", "event"+i);
        topic.setAttribute("id", "topic"+i);
        massage.setAttribute("id", "massage"+i);
    }
    keybind.pop();
    for (let i=0; i<keybind.length; i++){
        if (isEmpty(keybind[i])){
            localStorage.removeItem(i);
            continue;
        }
        localStorage.setItem(i, JSON.stringify(keybind[i]));
        console.log(i, keybind[i]);
    }
    console.log(keybind.length);
    localStorage.removeItem(keybind.length);
}


//表を追加したら表の一番下に移動する
function scrollToBottom(){
    var obj = tbl.parentElement;
    obj.scrollTop = obj.scrollHeight;
}
