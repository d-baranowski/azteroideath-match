import {Game} from "./Game.js";

var audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);

//duration of the tone in milliseconds. Default is 500
//frequency of the tone in hertz. default is 440
//volume of the tone. Default is 1, off is 0.
//type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
//callback to use on end of tone
function beep(duration, frequency, volume, type, callback) {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (volume){gainNode.gain.value = volume;}
    if (frequency){oscillator.frequency.value = frequency;}
    if (type){oscillator.type = type;}
    if (callback){oscillator.onended = callback;}

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + ((duration || 500) / 1000));
};

const thrust = new Audio('sounds/thrust.wav');
const battle = new Audio('sounds/battle.wav');
battle.volume = 0.5
thrust.volume = 0.7

var firingInterval;
var thrustingInterval;
var isThrusting;

function playThrustSound() {
    if (!thrustingInterval) {
        isThrusting = true
        thrust.loop = true;
        thrust.currentTime = 0;
        thrust.play()
        thrustingInterval = setInterval(function() {
            thrust.currentTime = 150;
        }, 300);
    }
}

function playShootSound() {
    if (!firingInterval) {
        beep(60, 350, 0.2, 'sawtooth');
        firingInterval = setInterval(function() {
            beep(60, 350, 0.2, 'sawtooth');
        }, 250);
    }
}

function stopThrustSound() {
    if (thrustingInterval) {
        clearInterval(thrustingInterval)
        thrustingInterval = null;
        thrust.pause();
    }
}

function stopShootingSound() {
    if (firingInterval) {
        clearInterval(firingInterval);
        firingInterval = null;
    }
}

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
                playThrustSound();
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
                playShootSound();
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
                stopThrustSound();
                controller.releaseThrust();

                break;


            //key Space
            case 75:
            case 32:
                stopShootingSound();
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
            playThrustSound();
            controller.thrust();
        } else {
            stopThrustSound();
            controller.releaseThrust();
        }
    }

    window.addEventListener("touchstart", () => {
        playShootSound();
        controller.shoot();
    }, false);
    window.addEventListener("touchend", () => {
        stopShootingSound();
        controller.shootRelease();
    }, false);

    window.addEventListener('deviceorientation', onTilt);
}

export const startGame = ({ withLogic = true, makeRemoteController, otherCanvas, singlePlayer }) => {
    let canvas = otherCanvas;
    battle.loop = true;
    battle.play()

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

    const game = new Game(context, canvas, withLogic, singlePlayer);
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
