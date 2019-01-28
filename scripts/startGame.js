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

const mapOver = (value, istart, istop, ostart, ostop) =>
    ostart + (ostop - ostart) * ((value - istart) / (istop - istart));

function attachDeviceTiltToController(controller) {
    function onTilt(event) {
        const x = event.beta;  // In degree in the range [-180,180]
        const y = event.gamma; // In degree in the range [-90,90]


        if (x < -6) {
            controller.releaseTurn();
            controller.left(mapOver(x, -6, -180, 0.5 , 2));
        }

        if (x > 6) {
            controller.releaseTurn();
            controller.right(mapOver(x, 6, 180, 0.5, 2));
        }

        if (x < 5 && x > -5) {
            controller.releaseTurn();
        }

        if (y > 5) {
            controller.thrust();
        } else {
            controller.releaseThrust();
        }
    }

    window.addEventListener("touchstart", () => {
        controller.shoot();
    }, false);
    window.addEventListener("touchend", () => {
        controller.shootRelease();
    }, false);

    window.addEventListener('deviceorientation', onTilt);
}

export const startGame = (withLogic = true, makeRemoteController, otherCanvas) => {
    let canvas = otherCanvas;

    if (!canvas) {
        document.getElementById('game-placeholder').innerHTML =
            `<canvas class="onTop" width="${window.screen.width}px" height="${window.screen.height}px" id="canvas"></canvas>`;

        canvas = document.getElementById('canvas');

        const rfs = canvas.requestFullscreen
            || canvas.webkitRequestFullScreen
            || canvas.mozRequestFullScreen
            || canvas.msRequestFullscreen;

        rfs.call(canvas);
    }

    const context = canvas.getContext("2d");

    const game = new Game(context, canvas, withLogic);
    const controller = withLogic ? game.playerController(0) : makeRemoteController();
    attachKeybaordToController(controller);
    attachDeviceTiltToController(controller);

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        game.draw();

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    return game;
};