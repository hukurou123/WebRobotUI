// lightweight GamePad helper — robust to unplug/replug
// - automatically adopts first connected gamepad if target index missing
// - listens to gamepadconnected/gamepaddisconnected to reset state
// - provides events: 'pressed', 'released', 'axis_changed'

class GamePad {
    constructor(no) {
        this.no = no;
        this.prev_pressed = [];
        this.prev_axes = [];
        this.listener_list = { 'pressed': [], 'released': [], 'axis_changed': [] };

        this.updateGamepadStatus = this.updateGamepadStatus.bind(this);

        // react to connect/disconnect so we can recover when device is unplugged
        window.addEventListener('gamepadconnected', (e) => {
            // adopt the device if we don't have an active one
            if (typeof this.no !== 'number' || !navigator.getGamepads()[this.no]) {
                this.no = e.gamepad.index;
            }
            this.prev_pressed = [];
            this.prev_axes = [];
            console.log('gamepad connected index=', e.gamepad.index);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            if (e.gamepad && e.gamepad.index === this.no) {
                this.no = undefined;
            }
            this.prev_pressed = [];
            this.prev_axes = [];
            console.log('gamepad disconnected index=', e.gamepad && e.gamepad.index);
        });

        requestAnimationFrame(this.updateGamepadStatus);
    }

    addEventListener(type, listener) {
        if (!this.listener_list[type]) this.listener_list[type] = [];
        this.listener_list[type].push(listener);
    }

    notify_event(type, e) {
        const listeners = this.listener_list[type];
        if (!listeners || !listeners[Symbol.iterator]) return;
        for (const func of listeners) {
            try { func(e); } catch (err) { console.error('listener error', err); }
        }
    }

    updateGamepadStatus() {
        const gamepads = navigator.getGamepads();
        let gamepad = (typeof this.no === 'number') ? gamepads[this.no] : null;

        // if target not available, try to find any connected gamepad and adopt it
        if (!gamepad) {
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    gamepad = gamepads[i];
                    if (this.no !== i) {
                        this.no = i;
                        this.prev_pressed = [];
                        this.prev_axes = [];
                        console.log('adopting gamepad index=', i);
                    }
                    break;
                }
            }
        }

        if (gamepad) {
            // buttons
            gamepad.buttons.forEach((button, index) => {
                const pressed = !!button.pressed;
                if (pressed) {
                    if (!this.prev_pressed[index]) {
                        this.notify_event('pressed', { index });
                        this.prev_pressed[index] = true;
                    }
                } else {
                    if (this.prev_pressed[index]) {
                        this.notify_event('released', { index });
                        this.prev_pressed[index] = false;
                    }
                }
            });

            // axes
            gamepad.axes.forEach((axis, index) => {
                const prev = (typeof this.prev_axes[index] === 'number') ? this.prev_axes[index] : axis;
                if (Math.abs(prev - axis) > 0.01) {
                    this.notify_event('axis_changed', { index, value: axis });
                }
                this.prev_axes[index] = axis;
            });

            // update minimal UI if present
            const el = document.getElementById('connection-gamepad');
            if (el) el.textContent = `Gamepad #${this.no}`;
        } else {
            // no device: set UI placeholders
            const el = document.getElementById('connection-gamepad');
            if (el) el.textContent = 'No gamepad';
            const b = document.getElementById('buttonstatus');
            if (b) b.textContent = '---';
            const s = document.getElementById('stickstatus');
            if (s) s.textContent = '---';
        }

        requestAnimationFrame(this.updateGamepadStatus);
    }
}



// --------- instance + handlers ------------------------------------------------
const gamepad = new GamePad(0);

// safe DOM helper
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// register handlers
gamepad.addEventListener('pressed', btnDownHandler);
gamepad.addEventListener('released', btnUpHandler);
gamepad.addEventListener('axis_changed', stickHandler);

function stickHandler(event) {
    const v = (typeof event.value === 'number') ? event.value.toFixed(2) : '0.00';
    switch (event.index) {
        case 0: safeSetText('stickstatus', `Left Stick X: ${v}`); break;
        case 1: safeSetText('stickstatus', `Left Stick Y: ${v}`); break;
        case 2: safeSetText('stickstatus', `Right Stick X: ${v}`); break;
        case 3: safeSetText('stickstatus', `Right Stick Y: ${v}`); break;
        default: safeSetText('stickstatus', `A${event.index}: ${v}`); break;
    }
}

function btnDownHandler(event) {
    // console.log('Button pressed', event.index);
    switch (event.index) {
        case 0: safeSetText('buttonstatus', 'A pressed'); break;
        case 1: safeSetText('buttonstatus', 'B pressed'); break;
        case 2: safeSetText('buttonstatus', 'Y pressed'); break;
        case 3: safeSetText('buttonstatus', 'X pressed'); break;
        case 4: safeSetText('buttonstatus', 'LB pressed'); break;
        case 5: safeSetText('buttonstatus', 'RB pressed'); break;
        case 6: safeSetText('buttonstatus', 'LT pressed'); break;
        case 7: safeSetText('buttonstatus', 'RT pressed'); break;
        case 8: safeSetText('buttonstatus', 'Back pressed'); break;
        case 9: safeSetText('buttonstatus', 'Start pressed'); break;
        case 10: safeSetText('buttonstatus', 'L3 pressed'); break;
        case 11: safeSetText('buttonstatus', 'R3 pressed'); break;
        case 12: safeSetText('buttonstatus', 'Up pressed'); break;
        case 13: safeSetText('buttonstatus', 'Down pressed'); break;
        case 14: safeSetText('buttonstatus', 'Left pressed'); break;
        case 15: safeSetText('buttonstatus', 'Right pressed'); break;
        default: safeSetText('buttonstatus', `Btn ${event.index} pressed`); break;
    }
}

function btnUpHandler(/* event */) {
    safeSetText('buttonstatus', 'released');
}

// 表を描画する関数 (ゲームパッド用)
function renderPadTable(){
    renderGenericTable({
        tableId: 'pad_tbl',
        data: padKeybind,
        options: {
            includeIndex: false,
            includeDelete: false,
            keyEditable: false,
            keySelect: false,
            idPrefix: 'pad_'
        },
    });
}
