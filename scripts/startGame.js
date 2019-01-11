import {Game} from "./Game.js";

function attachKeybaordToController(controller)
{
    window.onkeydown = function(e)
    {
        switch(e.keyCode)
        {
            //key A or LEFT
            case 65:
            case 37:

                controller.left();

                break;

            //key W or UP
            case 87:
            case 38:

                controller.thrust();

                break;

            //key D or RIGHT
            case 68:
            case 39:

                controller.right();

                break;

            //key Space
            case 32:
            case 75:

                controller.shoot();

                break;
        }

        e.preventDefault();
    };

    window.onkeyup = function(e)
    {
        switch(e.keyCode)
        {
            //key A or LEFT
            case 65:
            case 37:
            //key D or RIGHT
            case 68:
            case 39:

                controller.releaseTurn();
                break;

            //key W or UP
            case 87:
            case 38:

                controller.releaseThrust();

                break;


            //key Space
            case 75:
            case 32:
                controller.shootRelease();

                break;
        }

        e.preventDefault();
    };
};

function launchFullScreen(element) {
    if(element.requestFullScreen) {
        element.requestFullScreen();
    } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
};

function attachDeviceTiltToController(controller) {
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            document.getElementById('game-placeholder').innerText = JSON.parse(event.acceleration);
        });
    }
}

export const startGame = () => {
    document.getElementById('game-placeholder').innerHTML =
        `<canvas width="${window.innerWidth -15}px" height="${window.innerHeight - 45}" id="canvas"></canvas>`;

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext("2d");

    const game = new Game(context, canvas);
    const controller = game.playerController(0);
    attachKeybaordToController(controller);
    attachDeviceTiltToController(controller);

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        game.draw();

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
};