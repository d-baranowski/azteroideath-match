import {startGame} from "./startGame.js";
import {hostGameForm} from "./hostGameForm.js";
import {joinGameForm} from "./joinGameForm.js";

window.randomBetween = function(minVal , maxVal)
{
    return Math.random() * (maxVal-minVal) + minVal ;
};

Object.prototype.forEach = function (callback) {
    return Object.values(this).forEach(callback)
};

Object.prototype.filter = function (callback) {
    return Object.values(this).filter(callback)
};

Object.prototype.map = function (callback) {
    return Object.entries(this).reduce((aggregate, [key, val]) => {
        aggregate[key] = callback(val);
        return aggregate;
    }, {})
};

window.id = () => {
    return crypto.getRandomValues(new Uint32Array(2)).join('').slice(0, 4);
};

window.coinFlip = function  () {
    return (Math.floor(Math.random() * 2) === 0);
};


export const init = async (starfield) => {
    /*document.getElementById("btnFullScreen").addEventListener("click", function() {
        const game = startGame();
        var el = document.getElementById('canvas'),
            rfs = el.requestFullscreen
                || el.webkitRequestFullScreen
                || el.mozRequestFullScreen
                || el.msRequestFullscreen
        ;

        // rfs.call(el);
    });*/

    const formPlaceholder = document.getElementById('form-placeholder');


    document.getElementById("btnHostGame").addEventListener('click', () => {
        hostGameForm(formPlaceholder, startGame);
    });

    document.getElementById("btnJoinGame").addEventListener('click', () => {
        joinGameForm(formPlaceholder, startGame);
    });

    document.getElementById("btnSinglePlayer").addEventListener('click', () => {
        startGame();
    })
};