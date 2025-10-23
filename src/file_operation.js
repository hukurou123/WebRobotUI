// file_operation.js
// localStorage を JSON ファイルとしてエクスポート / インポートするユーティリティ

// 全 localStorage をオブジェクトで取得
function getAllLocalStorage(){
    const obj = {};
    for (let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        obj[key] = localStorage.getItem(key);
    }
    return obj;
}

// localStorage 全体を JSON ファイルとしてダウンロード
function exportJSON(filename){
    const data = getAllLocalStorage();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // ファイル名を指定しない場合は日付を使う
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const name = filename || `localStorage-${year}${month}${day}.json`;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 指定した JSON ファイルを読み込んで localStorage を上書き（オプションでマージ）
// file: File オブジェクト
// options: { merge: boolean } - true の場合は既存のキーは上書きされる
function importLocalStorageFile(file, options = { merge: true }){
    if (!file) return Promise.reject(new Error('no file'));
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try{
                const parsed = JSON.parse(reader.result);
                if (typeof parsed !== 'object' || parsed === null) throw new Error('invalid json');
                if (!options.merge){
                    localStorage.clear();
                }
                Object.keys(parsed).forEach(k => {
                    try{ localStorage.setItem(k, parsed[k]); } catch(e) { /* ignore quota errors per-key */ }
                });
                resolve(parsed);
            } catch(e){
                reject(e);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file, 'utf-8');
    });
}

function importJSON(inputEl){
    const file = inputEl.files && inputEl.files[0];
    if (!file) return;
    importLocalStorageFile(file, { merge: true })
        .then(() => {
                showToast && showToast('import successfully!');
                // 読み込んだらテーブルなどを再描画
                if (typeof loadKeybinds === 'function'){
                    try{ loadKeybinds(); renderTable(); } catch(e){}
                }
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
            .catch(err => {
                console.error(err);
                showToast && showToast('import failed: ' + (err && err.message ? err.message : '')); 
            })
        .finally(()=>{ inputEl.value = ''; });
}

document.getElementById('import').addEventListener('click', () => {
    document.getElementById('importFile').click(); // ファイル選択を開く
});

document.getElementById('importFile').addEventListener('change', (e) => {
    importJSON(e.target);
});

// 簡易API: ページロード時にボタンがあれば自動で紐付ける
// window.addEventListener('DOMContentLoaded', () => {
//     const exp = document.getElementById('export_localstorage');
//     const imp = document.getElementById('import_localstorage');
//     const impInput = document.getElementById('import_localstorage_input');
//     if (exp) exp.addEventListener('click', onExportClick);
//     if (imp && impInput) imp.addEventListener('click', () => impInput.click());
//     if (impInput) impInput.addEventListener('change', () => onImportSelected(impInput));
// });
