import {createScaledroneRoom} from "./createScaledroneRoom.js";
import {createConnection} from "./createConnection.js";
import {randomNames} from "./randomNames.js";

function initialForm(formPlaceholder) {
    formPlaceholder.innerHTML =
        `<button id="btnHostGameSubmit">Start</button><label for="txtGameName">Game Name</label><div id="txtGameName" />`;
}

const beginGame = (openConnection, startGame, duration) => {
    openConnection.publish({type: "GAME_START"});

    const game = startGame();
    game.setTimeLeft(duration);

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
};

const displayGameCreatorForm = async () => {
  return new Promise((resolve, reject) => {
      const roomName = randomNames();

      document.getElementById('menuContainer').innerHTML =
          `<div class="elements">
            <div class="neon">${roomName}</div>
            <div class="gameForm">
                <label for="gameDuration">Game Duration</label>
                <input id="gameDuration" min="1" max="60" type="number">
            </div>
            <div id="btnCreateGame" class="neon button">Create Game</div>
        </div>`;

      document.getElementById('btnCreateGame').onclick = () => {
          resolve({
              roomName,
              gameDuration: parseInt(document.getElementById("gameDuration").value)
          });
      };
  })
};

const displayAwaitingPlayersForm = (roomName) => {
    document.getElementById('menuContainer').innerHTML =
        `<div class="elements">
            <div class="neon">${roomName}</div>
            <div class="playerInfo">You are player one</div>
            <div id="playerTwoPlaceholder" class="playerInfo">Player Two: Awaiting</div>
            <div id="btnStartGame" class="neon button">Start Game</div>
        </div>`;
};

export const hostGameForm = (formPlaceholder, startGame) => {
    initialForm(formPlaceholder);

    (async () => {
        const roomId = crypto.getRandomValues(new Uint32Array(3)).join('');
        const {...options} = await displayGameCreatorForm();
        displayAwaitingPlayersForm(options.roomName);

        const matchMaker = await createScaledroneRoom({
            channelId: 'tbrd6Bv7LyXeG8xX',
            roomName: 'azteroideath-matchmaker'
        });

        const stopListing = matchMaker.subscribe('LIST_MATCHES', (message) => {
            if (message.type === 'LIST_MATCHES') {
                matchMaker.publish({type: 'MATCH_AVAILABLE', paylaod: {roomId, roomName: options.roomName, options}})
            }
        });

        const webRtcConnectionPromise = createConnection('tbrd6Bv7LyXeG8xX', roomId);
        let openConnection;

        webRtcConnectionPromise.then((con) => {
            openConnection = con;

            openConnection.subscribe('PLAYER_JOINED', (msg) => {
                if (msg.type === 'PLAYER_JOINED') {
                    document.getElementById('playerTwoPlaceholder').innerText = `Player Two Joined`
                }
            });

            document.getElementById('btnStartGame').onclick = () => {
                beginGame(openConnection, startGame, options.gameDuration);
                stopListing();
            };
        });
    })();
};