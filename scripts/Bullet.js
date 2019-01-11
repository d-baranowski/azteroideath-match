import {Vector} from "./Vector.js";
import {Line} from "./Line.js";

export class Bullet {
    constructor(player) {
        this.position = player.position.clone();
        this.magnitude = new Vector(8, 8).setAngle(player.direction).clone();
        this.position.add(this.magnitude);
        this.position.add(this.magnitude);
        this.position.add(this.magnitude);
    }

    update() {
        this.position.add(this.magnitude);
    }

    draw(context) {
        context.fillStyle = '#00F';
        context.fillRect(this.position.x,this.position.y,4,4);
    }

    collidesWith(polygon) {
        const intersectLine = new Line(this.position, new Vector(100000, this.position.y));

        let count = 0;
        for (let line of polygon.getLines()) {
            if (intersectLine.intersects(line)) {
                count++
            }
        }

        return !!(count % 2)
    }

    die() {
        this.isGoingToDie = true;
    }
}