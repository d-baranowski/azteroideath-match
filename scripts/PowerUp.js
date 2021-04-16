import {Vector} from "./Vector.js";
import {Polygon} from "./Polygon.js";

export class PowerUp extends Polygon {
    constructor(position = new Vector(), magnitude = new Vector()) {
        super();
        this.position = position;
        this.magnitude = magnitude;
        this.radius = 7;
        this.sides = 4;
        this.direction = 0.0;
        this.directionModifier = 0.05;
        this.color = '#00F';
        this.isGoingToDie = false;
    }

    update() {
        this.direction += this.directionModifier;
        this.position.add(this.magnitude);
    }

    markForDeletion() {
        this.isGoingToDie = true;
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

PowerUp.parse = (data) => {
    const parsed = new PowerUp();
    parsed.position = Vector.parse(data.p);
    parsed.direction = parseFloat(data.d);
    parsed.radius = parseFloat(data.r);
    parsed.sides = data.s;
    return parsed;
};
