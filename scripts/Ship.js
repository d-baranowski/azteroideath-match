import {Vector} from "./Vector.js";
import {Polygon} from "./Polygon.js";

export class Ship extends Polygon {
    constructor(position = new Vector()) {
        super();
        this.position = position;
        this.magnitude = new Vector(/*1, 1*/);
        this.direction = 0.0;
        this.directionModifier = 0.0;
        this.thrustMagnitude = 0.1;
        this.thrustForce = new Vector();
        this.radius = 10;
        this.sides = 3;
        this.color = '#FFF';
        this.canShoot = true;
        this.isDead = false;
        this.ticksUntilRespawn = -1;
    }

    die(respawn) {
        this.respawn = respawn;
        this.ticksUntilRespawn = 200;
        this.isDead = true;
        this.sides = 0;
        this.magnitude = new Vector();
    }

    update() {
        this.ticksUntilRespawn--;


        if (this.ticksUntilRespawn === 100) {
            this.respawn();
        }

        if (this.ticksUntilRespawn === 0) {
            this.sides = 3;
            this.isDead = false;
        }


        if (this.isThrusting) {
            this.thrustForce =
                new Vector()
                    .setMagnitude(this.thrustMagnitude)
                    .setAngle(this.direction)
        } else {
            this.thrustForce = new Vector();
        }

        this.direction += this.directionModifier;
        this.magnitude.add(this.thrustForce);
        this.position.add(this.magnitude);
        this.magnitude = this.magnitude.multiply(0.988);
    }

    thrust() {
        this.isThrusting = true;
    }

    releaseThrust() {
        this.isThrusting = false;
    }

    left(mod = 1) {
        this.directionModifier = -0.1 * mod;
    }

    draw(context) {
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.beginPath();
        const coords = this.generateCoordinates();
        if (!coords || coords.length < 3) {
            return;
        }
        context.moveTo(coords[0].x, coords[0].y);
        context.lineTo(coords[1].x, coords[1].y);
        context.lineTo(this.position.x, this.position.y);
        context.lineTo(coords[2].x, coords[2].y);
        context.closePath();
        context.stroke();
    }

    right(mod = 1) {
        this.directionModifier = 0.1 * mod;
    }

    releaseTurn() {
        this.directionModifier = 0;
    }

    shoot() {
        this.isShooting = true;
    }

    shootRelease() {
        this.isShooting = false;
    }
}
