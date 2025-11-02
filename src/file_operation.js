// file_operation.js
// localStorageをJSONファイルとしてエクスポート インポートする

// localStrageに保存する関数
function saveKeybinds(){
    // 現在の入力状態を読み取って keybind / gameKeybind / tpBind を個別に更新
    // keybind (main keys)
    for (let i = 0; i < keybind.length; i++){
        const inpKey = document.getElementById(`key${i}`);
        const sl = document.getElementById(`event${i}`);
        const inpTopic = document.getElementById(`topic${i}`);
        const inpMsg = document.getElementById(`message${i}`);
        const kb = keybind[i] || new Keybind();
        if (inpKey && typeof kb.add_key === 'function') kb.add_key(inpKey.value);
        else if (inpKey) kb.key = inpKey.value;
        if (sl && typeof kb.add_event === 'function') kb.add_event(sl.value);
        else if (sl) kb.event = sl.value;
        if (inpTopic && typeof kb.add_topic === 'function') kb.add_topic(inpTopic.value);
        else if (inpTopic) kb.topic = inpTopic.value;
        if (inpMsg && typeof kb.add_message === 'function') kb.add_message(inpMsg.value);
        else if (inpMsg) kb.message = inpMsg.value;
        keybind[i] = kb;
    }

    // gameKeybind (gamepad)
    for (let i = 0; i < gameKeybind.length; i++){
        const prefix = 'gp_';
        const inpKey = document.getElementById(`${prefix}key${i}`);
        const sl = document.getElementById(`${prefix}event${i}`);
        const inpTopic = document.getElementById(`${prefix}topic${i}`);
        const inpMsg = document.getElementById(`${prefix}message${i}`);
        let pb = gameKeybind[i] || { key: GAME_BUTTONS[i] || '', event: 'down', topic: '', message: '' };
        if (inpKey){ pb.key = inpKey.value; }
        if (sl){ pb.event = sl.value; }
        if (inpTopic){ pb.topic = inpTopic.value; }
        if (inpMsg){ pb.message = inpMsg.value; }
        gameKeybind[i] = pb;
    }

    // tpBind (touchpad)
    if (typeof tpBind !== 'undefined'){
        for (let i = 0; i < tpBind.length; i++){
            const prefix = 'tp_';
            const inpKey = document.getElementById(`${prefix}key${i}`);
            const sl = document.getElementById(`${prefix}event${i}`);
            const inpTopic = document.getElementById(`${prefix}topic${i}`);
            const inpMsg = document.getElementById(`${prefix}message${i}`);
            let tb = tpBind[i] || { key: '', event: 'down', topic: '', message: '' };
            if (inpKey){ tb.key = inpKey.value; }
            if (sl){ tb.event = sl.value; }
            if (inpTopic){ tb.topic = inpTopic.value; }
            if (inpMsg){ tb.message = inpMsg.value; }
            tpBind[i] = tb;
        }
    }

    // 配列をオブジェクト配列に変換して保存（Keybind インスタンスとプレーンオブジェクトの両方に対応）
    function toPlain(item){
        if (!item) return { key: '', event: '', topic: '', message: '' };
        if (typeof item.get_key === 'function'){
            return { key: item.get_key(), event: item.get_event(), topic: item.get_topic(), message: item.get_message() };
        }
        return { key: item.key || '', event: item.event || '', topic: item.topic || '', message: item.message || '' };
    }

    const arr = keybind.map(toPlain);
    const gparr = gameKeybind.map(toPlain);
    const tparr = (typeof tpBind !== 'undefined') ? tpBind.map(toPlain) : [];

    // ローカルストレージの数字キーは古い保存形式なので掃除
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++){
        const k = localStorage.key(i);
        if (!k) continue;
        if (/^[0-9]+$/.test(k)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));

    localStorage.setItem('keybinds', JSON.stringify(arr));
    localStorage.setItem('gp_keybinds', JSON.stringify(gparr));
    localStorage.setItem('tp_keybinds', JSON.stringify(tparr));

    try{ showToast('Saved Successfully!'); }catch(e){ }
}

// localStorage 全体を JSON ファイルとしてダウンロード
function exportJSON(filename){
    // localStrageの中身ををオブジェクトで取得
    const data = getAllLocalStorage();
    // オブジェクトをJSON形式の文字列に変換
    const json = JSON.stringify(data, null, 2);
    // JSONデータの入った仮想ファイル（よくわかんない）
    const blob = new Blob([json], { type: 'application/json' });
    // 仮想ファイルにダウンロード用のURLを作る
    const url = URL.createObjectURL(blob);
    // <a>タグ(リンク)を作ってURLを設定
    const a = document.createElement('a');
    a.href = url;
    // ファイル名を指定しない場合は日付を使う
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const name = filename || `localStorage-${year}${month}${day}.json`;
    // クリックしたら設定した名前でダウンロードする
    a.download = name;
    // <a>タグを設定
    document.body.appendChild(a);
    // <a>タグを自動でクリック
    a.click();
    // <a>タグを削除
    document.body.removeChild(a);
    // ダウンロード用URLを削除
    URL.revokeObjectURL(url);
}

// 指定した JSON ファイルを読み込んで localStorage を上書き（オプションでマージ）
// file: File オブジェクト
// options: { merge: boolean } - true の場合は既存のキーは上書きされる
function importLocalStorageFile(file, options = { merge: true }){
    // ファイルが指定されていなかった場合
    if (!file) return Promise.reject(new Error('no file'));
    // FileReaderは時間がかかる(非同期処理)ので読み込みが終わったらresolve，失敗したらrejectを返す
    return new Promise((resolve, reject) => {
        // FileReaderはJavaScriptの組込みオブジェクト
        // ローカルファイルの内容を読み取ることができる
        const reader = new FileReader();
        reader.onload = () => {
            try{
                // JSON形式のオブジェクトに変換
                const parsed = JSON.parse(reader.result);
                // 変換できてるか確認
                if (typeof parsed !== 'object' || parsed === null) throw new Error('invalid json');
                // margeがfalseだったらlocalStrageを一回全部削除
                if (!options.merge){
                    localStorage.clear();
                }
                // JSONの中身をlocalStrageに保存
                Object.keys(parsed).forEach(k => {
                    try{ localStorage.setItem(k, parsed[k]); } catch(e) { /* ignore quota errors per-key */ }
                });
                // 成功
                resolve(parsed);
            } catch(e){
                // 失敗
                reject(e);
            }
        };
        // エラー
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file, 'utf-8');
    });
}

// JSONファイルをインポートする関数
function importJSON(inputEl){
    // 選択されたファイル(fileList)を取得して，それの１番目をfileに入れる
    // &&はもし左が存在すれば右を実行する 
    const file = inputEl.files && inputEl.files[0];
    // ファイルが選択されていなければ終了
    if (!file) return;
    importLocalStorageFile(file, { merge: true })
        // インポートが成功したときの処理
        .then(() => {
                showToast && showToast('import successfully!');
                // 読み込んだらテーブルなどを再描画
                // 再描画: 可能ならまとめて復元する関数を呼ぶ（loadAllKeybinds を優先）
                try{
                    loadAllKeybinds();
                    renderTable();
                    renderGameTable();
                    renderTouchTable();
                }catch(e){ console.warn('post-import render error', e); }
                // BrokerIP / BrokerPORT があればフォームに反映
                try{
                    const ip = localStorage.getItem('BrokerIP');
                    const port = localStorage.getItem('BrokerPORT');
                    const ipEl = document.getElementById('ip_name');
                    const portEl = document.getElementById('port_name');
                    if (ip && ipEl) ipEl.value = ip;
                    if (port && portEl) portEl.value = port;
                } catch(e){}
        })
        // JSONが読み込めない場合
        .catch(err => {
            console.error(err);
            showToast && showToast('import failed: ' + (err && err.message ? err.message : '')); 
        })
        // 同じファイルをもう一度選べるようにファイル入力欄を空白に
        .finally(()=>{ inputEl.value = ''; });
}

// importボタンを押すことで非表示にしていたimportFileのダイアログが開く
document.getElementById('import').addEventListener('click', () => {
    document.getElementById('importFile').click(); // ファイル選択を開く
});

// ファイルが選択されたらそのファイルをインポートする
document.getElementById('importFile').addEventListener('change', (e) => {
    importJSON(e.target);
});

async function default_setting() {
    try {
    const response = await fetch("./default_settings.json");
    if (!response.ok) throw new Error("failed to load default_settings.json");

    const data = await response.json();

    // 読み込んだ設定を localStorage に保存（importLocalStorageFile と同じような処理を再現）
    for (const [key, value] of Object.entries(data)) {
        if(typeof value === "string"){
            localStorage.setItem(key, value);
        }else{
            localStorage.setItem(key, JSON.stringify(value));
        }
    }

    showToast && showToast("default settings loaded!");

    // UI再描画
    try {
      loadAllKeybinds();
      renderTable();
      renderGameTable();
      renderTouchTable();
    } catch (e) {
        console.warn("post-load render error", e);
    }

    } catch (err) {
        console.error(err);
        showToast && showToast("default settings load failed: " + err.message);
    }
}
