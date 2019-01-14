import {createScaledroneRoom} from "./createScaledroneRoom.js";
import {createConnection} from "./createConnection.js";

export const joinGameForm = (formPlaceholder, startGame) => {
    document.getElementById('btnJoinGame').addEventListener('click', async () => {
        const matchMaker = await createScaledroneRoom({channelId: 'tbrd6Bv7LyXeG8xX', roomName: 'azteroideath-matchmaker'});
        matchMaker.subscribe('MATCH_AVAILABLE', (message) => {
            if (message.type === 'MATCH_AVAILABLE') {
                const webRtcConnectionPromise = createConnection('tbrd6Bv7LyXeG8xX', message.paylaod.gameName);
                let openConnection;

                webRtcConnectionPromise.then((con) => {
                    openConnection = con;

                    const makeRemoteController = () => ({
                        thrust: () => { openConnection.publish({type: "CONTROLLER", action: "thrust"}); },
                        releaseThrust: () => { openConnection.publish({type: "CONTROLLER", action: "releaseThrust"}); },
                        left: (mod) => { openConnection.publish({type: "CONTROLLER", action: "left", mod}); },
                        right: (mod) => { openConnection.publish({type: "CONTROLLER", action: "right", mod}); },
                        releaseTurn: () => { openConnection.publish({type: "CONTROLLER", action: "releaseTurn"}); },
                        shoot: () => { openConnection.publish({type: "CONTROLLER", action: "shoot"}); },
                        shootRelease: () => { openConnection.publish({type: "CONTROLLER", action: "shootRelease"}); },
                    });

                    const game = startGame(false, makeRemoteController);
                    game.followPlayer = 1;

                    openConnection.subscribe("GAME_STATE_UPDATE", (message) => {
                        if (message.type === "GAME_STATE_UPDATE") {
                            game.setState(message.payload.data);
                        }
                    })

                });

                formPlaceholder.innerHTML = `<button id="btnCloseGame">Close</button>`;
                document.getElementById('btnCloseGame').addEventListener('click', () => {
                    matchMaker.close();
                    openConnection && openConnection.close();
                })
            }
        });

        matchMaker.publish({type: "LIST_MATCHES"})
    });
};