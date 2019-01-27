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
    }

    die(respawn) {
        this.isDead = true;
        this.sides = 0;
        this.magnitude = new Vector();

        setTimeout(() => {
            respawn();
        }, 500);

        setTimeout(() => {
            this.sides = 3;
            this.isDead = false;
        }, 3000)
    }

    update() {
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