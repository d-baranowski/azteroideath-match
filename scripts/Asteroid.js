import {Vector} from "./Vector.js";
import {Polygon} from "./Polygon.js";

export class Asteroid extends Polygon {
    constructor(position, magnitude, radius = 50) {
        super();
        this.color = '#F00';
        this.position = position;
        this.magnitude = magnitude;
        this.direction = 0.0;
        this.directionModifier = 0.009;

        this.sides = 5;
        this.radius = radius;
    }

    markForExplosion() {
        this.isGoingToExplode = true;
    }

    update() {
        this.direction += this.directionModifier;
        this.position.add(this.magnitude);
    }
}