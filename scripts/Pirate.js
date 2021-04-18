import {Ship} from "./Ship.js";
import {Vector} from "./Vector.js";


export class Pirate extends Ship {
    constructor(position = new Vector(), controller, game) {
        super(position);
        this.controller = controller;
        this.game = game;
    }

    update() {
        super.update();
        if (this.ticksUntilRespawn > 0) {
            return;
        }
        this.shoot();
        const distanceToPlayer = this.position.distanceTo(this.game.players[0].position);
        if (this.game.stateRadarActive || distanceToPlayer < 800) {
            const directionToPlayer = this.position.directionTo(this.game.players[0].position).angle();
            const unlucky = randomBetween(0, 1)
            if (directionToPlayer < this.direction) {
                this.controller.left();
            } else if (directionToPlayer > this.direction) {
                this.controller.right();
            } else {
                this.controller.releaseTurn();
            }
        } else {
            this.controller.releaseTurn();
        }

        if (distanceToPlayer > 150) {
            this.controller.thrust();
        } else {
            this.controller.releaseThrust();
        }
    }
}
