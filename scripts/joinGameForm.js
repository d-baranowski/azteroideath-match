import {createScaledroneRoom} from "./createScaledroneRoom.js";
import {createConnection} from "./createConnection.js";

const startRemoteGame = (openConnection, startGame, canvas) => {
    const makeRemoteController = () => ({
        thrust: () => { openConnection.publish({type: "CONTROLLER", action: "thrust"}); },
        releaseThrust: () => { openConnection.publish({type: "CONTROLLER", action: "releaseThrust"}); },
        left: (mod) => { openConnection.publish({type: "CONTROLLER", action: "left", mod}); },
        right: (mod) => { openConnection.publish({type: "CONTROLLER", action: "right", mod}); },
        releaseTurn: () => { openConnection.publish({type: "CONTROLLER", action: "releaseTurn"}); },
        shoot: () => { openConnection.publish({type: "CONTROLLER", action: "shoot"}); },
        shootRelease: () => { openConnection.publish({type: "CONTROLLER", action: "shootRelease"}); },
    });

    const game = startGame(false, makeRemoteController, canvas);
    game.followPlayer = 1;

    openConnection.subscribe("GAME_STATE_UPDATE", (message) => {
        if (message.type === "GAME_STATE_UPDATE") {
            game.setState(message.payload.data);
        }
    })
};

const renderAwailableMatches = (availableMatches, onElementPress) => {
    document.getElementById('available-placeholder').innerHTML = Object.values(availableMatches).reduce((accumulator, value) => {
        console.log(value);
        return accumulator + `<div class="neon button" data-roomId="${value.roomId}">${value.roomName}</div>`
    }, "");

    document.querySelectorAll('div[data-roomId]').forEach(elem => {
        elem.addEventListener('click', onElementPress);
    })
};

export let availableMatches = {};

let intervalIds = [];

export const joinGameForm = async (formPlaceholder, startGame) => {
    document.getElementById('menuContainer').innerHTML = `
        <div class="elements">
            <div class="neon">Available Matches</div>
            <div id="available-placeholder"></div>
        </div>`;

    const matchMaker = await createScaledroneRoom({channelId: 'tbrd6Bv7LyXeG8xX', roomName: 'azteroideath-matchmaker'});
    const unsubscribe = matchMaker.subscribe('MATCH_AVAILABLE', (message) => {
        if (message.type === 'MATCH_AVAILABLE') {
            availableMatches[message.paylaod.roomId] = message.paylaod;
            renderAwailableMatches(availableMatches, (event) => {
                const roomId = event.target.getAttribute('data-roomId');

                document.getElementById('game-placeholder').innerHTML =
                    `<canvas class="onTop" width="${window.screen.width}px" height="${window.screen.height}px" id="canvas"></canvas>`;

                const canvas = document.getElementById('canvas');

                const rfs = canvas.requestFullscreen
                    || canvas.webkitRequestFullScreen
                    || canvas.mozRequestFullScreen
                    || canvas.msRequestFullscreen;

                rfs.call(canvas);

                const webRtcConnectionPromise = createConnection('tbrd6Bv7LyXeG8xX', roomId);
                webRtcConnectionPromise.then((connection) => {
                    connection.publish({type: 'PLAYER_JOINED'});
                    const unsubscribe = connection.subscribe("GAME_START", (msg) => {
                        if (msg.type === "GAME_START") {
                            startRemoteGame(connection, startGame, canvas);
                            unsubscribe();
                        }
                    })
                });

                unsubscribe();
                intervalIds.forEach((intervalId) => clearInterval(intervalId));
            });
        }
    });

    intervalIds.push(setInterval(() => {
        matchMaker.publish({type: "LIST_MATCHES"})
    }, 2 * 1000));

    intervalIds.push(setInterval(() => {
        availableMatches = {};
    }, 7 * 1000));
};