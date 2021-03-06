import {Vector} from "./Vector.js";
import {Line} from "./Line.js";

export class Bullet {
    constructor(player) {
        if (player) {
            this.position = player.position.clone();
            this.magnitude = new Vector(8, 8).setAngle(player.direction);
            this.position.add(this.magnitude);
            this.position.add(this.magnitude);
            this.position.add(this.magnitude);
        }
    }

    update() {
        this.position.add(this.magnitude);
    }

    draw(context) {
        context.fillStyle = '#00F';
        context.fillRect(this.position.x,this.position.y,4,4);
    }

    collidesWith(polygon) {
        const intersectLine = new Line(this.position, this.position.clone().add(this.magnitude));

        for (let line of polygon.getLines()) {
            if (intersectLine.intersects(line)) {
                return true
            }
        }

        return false
    }

    die() {
        this.isGoingToDie = true;
    }

    serialize() {
        return {
            p: this.position.serialize()
        };
    }
}

Bullet.parse = (data) => {
    const parsed = new Bullet();
    parsed.position = Vector.parse(data.p);
    return parsed;
};
