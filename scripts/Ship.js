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
        this.level = 5;
        this.sides = 3;
        this.canShoot = true;
        this.isDead = false;
        this.ticksUntilRespawn = -1;
    }

    die(respawn) {
        this.level = this.level - 3;
        if (this.level > 1) {
           return false;
        }
        this.respawn = respawn;
        this.ticksUntilRespawn = 200;
        this.isDead = true;
        this.sides = 0;
        this.level = 1;
        this.magnitude = new Vector();
        return true;
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
        if (this.level > 1) {
            const delta = (255 / 5) * this.level;
            const r = Math.max(255 - delta, 0).toString(16)
            const g = Math.max(255 - delta, 0).toString(16)
            const b = Math.min(delta, 255).toString(16)
            context.strokeStyle = `#${r}${g}${b}`;
        } else {
            context.strokeStyle = `#FFFFFF`;
        }
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

    powerUp() {
        if (this.level < 6) {
            this.level++
        }
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

    serialize() {
        return {
            p: this.position.serialize(), // position
            d: this.direction.toFixed(2), // direction
            r: this.radius.toFixed(2), // radius
            s: this.sides, // sides
            l: this.level // level
        };
    }
}


Ship.parse = (data) => {
    const parsed =  new Ship();
    parsed.position = Vector.parse(data.p);
    parsed.direction = parseFloat(data.d);
    parsed.radius = parseFloat(data.r);
    parsed.sides = data.s;
    parsed.level = data.l;
    return parsed;
};
