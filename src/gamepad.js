    // const canvas = document.getElementById('canvas');
    // const context = canvas.getContext('2d');

    // function draw_text_center(text) {
    //     context.fillStyle = "#fff";
    //     context.font = '24px Consolas';
    //     context.textAlign = 'left';
    //     let text_w = context.measureText(text).width;
    //     context.fillText(text, canvas.width/2-text_w/2, canvas.height/2);
    // }

    function updateGamepadStatus() {
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[0];
        let text = document.getElementById('gamepad').textContent;

        if (gamepad) {
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    // context.clearRect(0,0,canvas.width, canvas.height);
                    // draw_text_center(`button ${index} pressed`);
                    document.getElementById('gamepad').textContent = `button ${index} pressed`;
                }
            });
            // 軸表示は個別のコンテナに表示する
            updateAxesDisplay(gamepad);
        }

        requestAnimationFrame(updateGamepadStatus);
    }

    requestAnimationFrame(updateGamepadStatus);

//     class GamePad {
//     constructor(no) {
//         this.no = no;
//         this.prev_pressed = [];
//         this.listener_list = { 'pressed': [], 'released': [] }

//         this.updateGamepadStatus = this.updateGamepadStatus.bind(this);
//         requestAnimationFrame(this.updateGamepadStatus);
//     }

//     addEventListener(type, listener) {
//         this.listener_list[type].push(listener);
//     }

//     notify_event(type, e) {
//         let listeners = this.listener_list[type];
//         for (let func of listeners) {
//             func(e);
//         }
//     }

//     updateGamepadStatus() {
//         const gamepads = navigator.getGamepads();
//         const gamepad = gamepads[this.no];

//         if (gamepad) {
//             // ボタンの状態をチェック
//             gamepad.buttons.forEach((button, index) => {
//                 if (button.pressed) {
//                     if(!this.prev_pressed[index]) {
//                     // 押されていない状態から押された状態になった場合にpressedイベントを発信する 
//                         this.notify_event("pressed", { index: index });
//                         this.prev_pressed[index] = true;
//                     }
//                 } else {
//                     if(this.prev_pressed[index]) {
//                         // 押されていた状態から押されていない状態になった場合にreleasedイベントを発信する 
//                         this.notify_event("released", { index: index });
//                         this.prev_pressed[index] = false;
//                     }
//                 }
//             });
//             gamepad.axes.forEach((axis, index) => {
//                 // 軸の状態をここで処理することも可能
//             });
//         }

//         // 次のフレームでまたポーリングを実行
//         requestAnimationFrame(this.updateGamepadStatus);
//     }
// }

// --- axes 表示用ユーティリティ ------------------------------------------------
function applyDeadzone(v, deadzone = 0.12){
    if (Math.abs(v) < deadzone) return 0;
    const sign = Math.sign(v);
    return ((Math.abs(v) - deadzone) / (1 - deadzone)) * sign;
}

function ensureAxesContainer(){
    let c = document.getElementById('axes-container');
    if (!c) {
        c = document.createElement('div');
        c.id = 'axes-container';
        c.style.position = 'fixed';
        c.style.right = '12px';
        c.style.top = '80px';
        c.style.background = 'rgba(0,0,0,0.6)';
        c.style.color = '#fff';
        c.style.padding = '8px';
        c.style.borderRadius = '6px';
        c.style.fontFamily = 'monospace';
        c.style.zIndex = '9999';
        document.body.appendChild(c);
    }
    return c;
}

// 各フレームで axes の表示を更新する関数
function updateAxesDisplay(gamepad){
    if (!gamepad || !gamepad.axes) return;
    const axes = gamepad.axes;
    const container = ensureAxesContainer();
    const labels = ['LX','LY','RX','RY'];

    for (let i = 0; i < axes.length; i++){
        const raw = axes[i];
        const v = applyDeadzone(raw, 0.12);
        const disp = v.toFixed(2);
        const id = `axis-${i}`;
        let el = document.getElementById(id);
        if (!el){
            el = document.createElement('div');
            el.id = id;
            el.style.marginBottom = '4px';
            el._prev = NaN;
            container.appendChild(el);
        }
        const prev = el._prev;
        if (Number.isNaN(prev) || Math.abs(prev - v) > 0.01){
            const label = labels[i] || `A${i}`;
            el.textContent = `${label}: ${disp}`;
            el._prev = v;
        }
    }
}


// let gamepad = new GamePad(0) // 0番目のゲームパッドを対象とするオブジェクトを生成する
// let text = document.getElementById('gamepad').textContent;

// // ボタンが押された時のイベントハンドラーを登録する
// gamepad.addEventListener("pressed", btnDownHandler);

// // ボタンが離された時のイベントハンドラーを登録する
// gamepad.addEventListener("released", btnUpHandler);

// function btnDownHandler(event) {
//     switch(event.index) {
//         case 0:
//             document.getElementById('gamepad').textContent = `A pressed`;
//             break;
//         case 1:
//             document.getElementById('gamepad').textContent = `B pressed`;
//             break;
//         case 2:
//             document.getElementById('gamepad').textContent = `Y pressed`;
//             break;
//         case 3:
//             document.getElementById('gamepad').textContent = `X pressed`;
//             break;
//         case 4:
//             document.getElementById('gamepad').textContent = `LB pressed`;
//             break;
//         case 5:
//             document.getElementById('gamepad').textContent = `RB pressed`;
//             break;
//         case 6:
//             document.getElementById('gamepad').textContent = `LT pressed`;
//             break;
//         case 7:
//             document.getElementById('gamepad').textContent = `RT pressed`;
//             break;
//         case 8:
//             document.getElementById('gamepad').textContent = `Back pressed`;
//             break;
//         case 9:
//             document.getElementById('gamepad').textContent = `Start pressed`;
//             break;
//         case 10:
//             document.getElementById('gamepad').textContent = `L3 pressed`;
//             break;
//         case 11:
//             document.getElementById('gamepad').textContent = `R3 pressed`;
//             break;
//         case 12:
//             document.getElementById('gamepad').textContent = `Up pressed`;
//             break;
//         case 13:
//             document.getElementById('gamepad').textContent = `Down pressed`;
//             break;
//         case 14:
//             document.getElementById('gamepad').textContent = `Left pressed`;
//             break;
//         case 15:
//             document.getElementById('gamepad').textContent = `Right pressed`;
//             break;
//         default:
//             // その他のボタンは無視
//             break;
//     }
// }

// function btnUpHandler(event) {
//     document.getElementById('gamepad').textContent = `released`;
// }

