import {createScaledroneRoom} from "./createScaledroneRoom.js";
import {createConnection} from "./createConnection.js";

function initialForm(formPlaceholder) {
    formPlaceholder.innerHTML =
        `<button id="btnHostGameSubmit">Start</button><label for="txtGameName">Game Name</label><div id="txtGameName" />`;
}

export const hostGameForm = (formPlaceholder, startGame) => {
    initialForm(formPlaceholder);

    (async () => {
        const rtcConnectionRoomName = crypto.getRandomValues(new Uint32Array(3)).join('');
        document.getElementById('txtGameName').innerText = rtcConnectionRoomName;

        const matchMaker = await createScaledroneRoom({
            channelId: 'tbrd6Bv7LyXeG8xX',
            roomName: 'azteroideath-matchmaker'
        });
        matchMaker.subscribe('LIST_MATCHES', (message) => {
            if (message.type === 'LIST_MATCHES') {
                matchMaker.publish({type: 'MATCH_AVAILABLE', paylaod: {gameName: rtcConnectionRoomName}})
            }
        });

        const webRtcConnectionPromise = createConnection('tbrd6Bv7LyXeG8xX', rtcConnectionRoomName);
        let openConnection;

        webRtcConnectionPromise.then((con) => {
            openConnection = con;

            const game = startGame();

            const playerTwoController = game.playerController(1);
            const {
                thrust,
                releaseThrust,
                left,
                right,
                releaseTurn,
                shoot,
                shootRelease
            } = playerTwoController;

            openConnection.subscribe('CONTROLLER', (message) => {
                if (message.type === 'CONTROLLER') {
                    switch (message.action) {
                        case "thrust":
                            thrust();
                            break;
                        case "releaseThrust":
                            releaseThrust();
                            break;
                        case "left":
                            left(message.mod);
                            break;
                        case "right":
                            right(message.mod);
                            break;
                        case "releaseTurn":
                            releaseTurn();
                            break;
                        case "shoot":
                            shoot();
                            break;
                        case "shootRelease":
                            shootRelease();
                            break;
                    }
                }
            });


            setInterval(() => {
                const buffer = msgpack.encode(game.serialize());
                openConnection.publish({type: "GAME_STATE_UPDATE", payload: buffer})
            }, 20)
        });

        formPlaceholder.innerHTML = `<button id="btnCloseGame">Close</button>`;
        document.getElementById('btnCloseGame').addEventListener('click', () => {
            matchMaker.close();
            openConnection && openConnection.close();
            initialForm();
        })
    })();
};