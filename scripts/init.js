import {startGame} from "./startGame.js";
import {createScaledroneRoom} from "./createScaledroneRoom.js";
import {createConnection} from "./createConnection.js";


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

window.id = () => {
    return crypto.getRandomValues(new Uint32Array(2)).join('');
};

window.coinFlip = function  () {
    return (Math.floor(Math.random() * 2) === 0);
};


export const init = async () => {
    /*document.getElementById("btnFullScreen").addEventListener("click", function() {
        var el = document.documentElement,
            rfs = el.requestFullscreen
                || el.webkitRequestFullScreen
                || el.mozRequestFullScreen
                || el.msRequestFullscreen
        ;

        rfs.call(el);
        startGame();
    });*/

    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            document.getElementById('game-placeholder').innerText = JSON.parse(event.acceleration);
        });
    }
    /*
    const formPlaceholder = document.getElementById('form-placeholder');

    function initialForm() {
        formPlaceholder.innerHTML =
            `
             <button id="btnHostGameSubmit">Start</button>
             <label for="txtGameName">Game Name</label>
             <div id="txtGameName" />
            `;
    }

    document.getElementById("btnHostGame").addEventListener('click', () => {
        initialForm();

        document.getElementById('btnHostGameSubmit').addEventListener('click', async () => {
            const rtcConnectionRoomName = crypto.getRandomValues(new Uint32Array(3)).join('');
            document.getElementById('txtGameName').innerText = rtcConnectionRoomName;

            const matchMaker = await createScaledroneRoom({channelId: 'tbrd6Bv7LyXeG8xX', roomName: 'azteroideath-matchmaker'});
            matchMaker.subscribe('LIST_MATCHES', (message) => {
                if (message.type === 'LIST_MATCHES') {
                    matchMaker.publish({type: 'MATCH_AVAILABLE', paylaod: {gameName: rtcConnectionRoomName}})
                }
            });

            const webRtcConnectionPromise = createConnection('tbrd6Bv7LyXeG8xX', rtcConnectionRoomName);
            let openConnection;

            webRtcConnectionPromise.then((con) => {
                openConnection = con;
            });

            formPlaceholder.innerHTML = `<button id="btnCloseGame">Close</button>`;
            document.getElementById('btnCloseGame').addEventListener('click', () => {
                matchMaker.close();
                openConnection && openConnection.close();
                initialForm();
            })
        });
    });*/
};