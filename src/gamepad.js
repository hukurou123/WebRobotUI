    const canvas = document.getElementById('canvas');
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
        }

        requestAnimationFrame(updateGamepadStatus);
    }

    requestAnimationFrame(updateGamepadStatus);