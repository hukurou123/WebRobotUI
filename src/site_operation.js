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
    const firstTabLi = document.querySelector('.tab li:first-of-type');
    if (firstTabLi) firstTabLi.classList.add("active");
    const firstArea = document.querySelector('.area:first-of-type');
    if (firstArea) firstArea.classList.add("is-active");
    const hashName = location.hash;
    if (hashName && hashName.length > 0) {
        GethashID(hashName);
    } else {
        GethashID('#key');
    }
});