// lightweight GamePad helper — robust to unplug/replug
// - automatically adopts first connected gamepad if target index missing
// - listens to gamepadconnected/gamepaddisconnected to reset state
// - provides events: 'pressed', 'released', 'axis_changed'

class GamePad {
    // コンストラクタ
    constructor(no) {
        // 監視するゲームパッドの番号
        this.no = no;
        // 前フレームのボタン状態を記憶しておく配列
        this.prev_pressed = [];
        // 前フレームのスティックの状態を記憶しておく配列
        this.prev_axes = [];
        // 各イベントに対応する関数を登録しておく配列
        this.listener_list = { 'pressed': [], 'released': [], 'axis_changed': [] };

        // this.updateGamepadStatusを読んだときthisがGamePadインスタンスを指すようにする
        this.updateGamepadStatus = this.updateGamepadStatus.bind(this);

        // ゲームパッドが新しく接続されたとき
        window.addEventListener('gamepadconnected', (e) => {
            // まだゲームパッドが接続されていない状態なら今接続されたものを採用する
            if (typeof this.no !== 'number' || !navigator.getGamepads()[this.no]) {
                this.no = e.gamepad.index;
            }
            // ボタンとスティックの状態を初期化
            this.prev_pressed = [];
            this.prev_axes = [];

            console.log('gamepad connected index=', e.gamepad.index);
        });

        // ゲームパッドが切断されたとき
        window.addEventListener('gamepaddisconnected', (e) => {
            // ゲームパッドの番号をundefinedにする．
            if (e.gamepad && e.gamepad.index === this.no) {
                this.no = undefined;
            }
            // ボタンとスティックの状態を初期化
            this.prev_pressed = [];
            this.prev_axes = [];

            console.log('gamepad disconnected index=', e.gamepad && e.gamepad.index);
        });

        // ブラウザが描画するたびにゲームパッドの状態をチェックする．
        requestAnimationFrame(this.updateGamepadStatus);
    }

    // イベントを登録する関数
    addEventListener(type, listener) {
        // listener_listのtype番目がなかったら空で作る
        if (!this.listener_list[type]) this.listener_list[type] = [];
        // listener_listのtype番目にlistener関数を登録する
        this.listener_list[type].push(listener);
    }

    // イベントを発火させる関数
    notify_event(type, e) {
        // listeners変数にlistener_listのtype番目の関数を入れる
        const listeners = this.listener_list[type];
        // listenersが存在しない場合は終了
        if (!listeners || !listeners[Symbol.iterator]) return;
        // listener_listの中身を仮変数funcで回す
        // eはイベント（ボタン）情報
        for (const func of listeners) {
            try { func(e); } catch (err) { console.error('listener error', err); }
        }
    }

    // ゲームパッドがどうなっているかの処理
    updateGamepadStatus() {
        // すべてのゲームパッドの配列を取得
        const gamepads = navigator.getGamepads();
        // もしもthis.noが設定済みならそのパッドを参照 そうでなければnull
        let gamepad = (typeof this.no === 'number') ? gamepads[this.no] : null;

        // ゲームパッドが見つからなければ，gamepadsを探して最初に見つかったパッドを採用
        if (!gamepad) {
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    gamepad = gamepads[i];
                    if (this.no !== i) {
                        // パッド番号とボタン・スティック状態を初期化
                        this.no = i;
                        this.prev_pressed = [];
                        this.prev_axes = [];

                        console.log('adopting gamepad index=', i);
                    }
                    break;
                }
            }
        }

        const keyMap = ['A','B','X','Y','LB','RB','LT','RT','Back','Start','L3','R3','Up','Down','Left','Right'];
        // 前フレームと比較してボタンが押されているか・離されているかどうかを監視
        if (gamepad) {
            // buttons
            gamepad.buttons.forEach((button, index) => {
                // !!(二重否定演算子) 真偽はそのままboolean型に直したいときに使われる
                const pressed = !!button.pressed;
                if (pressed) {
                    if (!this.prev_pressed[index]) {
                        // 登録されたリスナーにボタンが押されたと通知する関数
                        this.notify_event('pressed', {key: keyMap[index] || `Btn${index}`});
                        this.prev_pressed[index] = true;
                    }
                } else {
                    if (this.prev_pressed[index]) {
                        this.notify_event('released', {key: keyMap[index] || `Btn${index}`});
                        this.prev_pressed[index] = false;
                    }
                }
            });

            // 前フレームと比較してスティックが倒されているかどうかを監視
            gamepad.axes.forEach((axis, index) => {
                // すでにprev_axesにnumberが入っていたらそのまま．undefinedだったら今のaxisの値を入れる
                const prev = (typeof this.prev_axes[index] === 'number') ? this.prev_axes[index] : axis;
                // 0.01以上動いたら変化ありとして発火する
                if (Math.abs(prev - axis) > 0.01) {
                    this.notify_event('axis_changed', { index, value: axis });
                }
                this.prev_axes[index] = axis;
            });

            // 接続中のパッド番号を表示
            const el = document.getElementById('connection-gamepad');
            if (el) el.textContent = `Gamepad #${this.no}`;
        } else {
            // 接続されていない場合は表示をリセット
            const el = document.getElementById('connection-gamepad');
            if (el) el.textContent = 'No gamepad';
            const b = document.getElementById('buttonstatus');
            if (b) b.textContent = '---';
            const s = document.getElementById('stickstatus');
            if (s) s.textContent = '---';
        }

        // ブラウザが描画するたびにゲームパッドの状態をチェックする．
        requestAnimationFrame(this.updateGamepadStatus);
    }
}



// --------- instance + handlers ------------------------------------------------

// インスタンス作成
const gamepad = new GamePad(0);
const GAME_BUTTONS = ['A','B','X','Y','LB','RB','LT','RT','Back','Start','L3','R3','Up','Down','Left','Right', 'Left X', 'Left Y', 'Right X', 'Right Y'];

// htmlに安全にテキストをセットする関数
// idがなかった場合にエラーが出ないようにする
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// ハンドラーを設定する
gamepad.addEventListener('pressed', btnDownHandler);
gamepad.addEventListener('released', btnUpHandler);
gamepad.addEventListener('axis_changed', stickHandler);

// スティックが倒されたときに実行される関数
function stickHandler(event) {
    // event.valueが数値なら小数点以下2桁に収めて文字列に変換，そうでなければ0.00に設定
    const v = (typeof event.value === 'number') ? event.value.toFixed(2) : '0.00';
    // event.indexによって入れるテキストを変える
    switch (event.index) {
        case 0: safeSetText('stickstatus', `Left Stick X: ${v}`); break;
        case 1: safeSetText('stickstatus', `Left Stick Y: ${v}`); break;
        case 2: safeSetText('stickstatus', `Right Stick X: ${v}`); break;
        case 3: safeSetText('stickstatus', `Right Stick Y: ${v}`); break;
        default: safeSetText('stickstatus', `A${event.index}: ${v}`); break;
    }
}

// ボタンが押されたときに実行される関数
function btnDownHandler(event) {
    const keyName = event.key;
    safeSetText('buttonstatus', `${event.key} pressed`);
    setupKeyPublish(gameKeybind, 'gp_tbl', 'down', keyName);
}

// ボタンが離されたときに実行される関数
function btnUpHandler(event) {
    const keyName = event.key;
    setupKeyPublish(gameKeybind, 'gp_tbl', 'up', keyName);
    // releasedと表示する
    safeSetText('buttonstatus', 'released');
    
}

// 表を描画する関数 (ゲームパッド用)
function renderGameTable(){
    renderGenericTable({
        tableId: 'gp_tbl',
        data: gameKeybind,
        options: {
            includeIndex: false,
            includeDelete: false,
            keyEditable: false,
            keySelect: false,
            idPrefix: 'gp_'
        },
    });
}

// 汎用ロード関数を利用してlocalStrageから読み出す
function loadGameKeybinds() {
    gameKeybind = loadKeybindArray('gp_keybinds', false);

    // GAME_BUTTONSの長さ分だけ繰り返し
    for (let i = 0; i < GAME_BUTTONS.length; i++) {
        if (!gameKeybind[i]) {
            gameKeybind[i] = { key: GAME_BUTTONS[i], event: 'down', topic: '', message: '' };
        } else {
            gameKeybind[i].key = GAME_BUTTONS[i];
        }
    }
}

// localStrageにgp_keybindsを保存する
function saveGameKeybinds(){
    localStorage.setItem('gp_keybinds', JSON.stringify(gameKeybind));
}
