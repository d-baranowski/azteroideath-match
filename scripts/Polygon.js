import {Vector} from "./Vector.js";
import {Line} from "./Line.js";

export class Polygon {
    constructor() {
        this.position = new Vector();
        this.direction = 0.0;
        this.radius = 0;
        this.sides = 0;
        this.color = '#FFF';
    }

    generateCoordinates() {
        const coordinates = [];
        for (let i = 0; i < this.sides; i++) {
            coordinates.push({
                x: parseFloat((this.position.x + this.radius * Math.cos(this.direction + (i * 2 * Math.PI / this.sides))).toFixed(4)),
                y: parseFloat((this.position.y + this.radius * Math.sin(this.direction + (i * 2 * Math.PI / this.sides))).toFixed(4))
            })
        }
        return coordinates;
    };

    getLines() {
        const coordinates = this.generateCoordinates();
        return coordinates.reduce((accumulator, value, index, array) => {
            if (index === array.length - 1) {
                accumulator.push(new Line(value, array[0]))
            } else {
                accumulator.push(new Line(value, array[index + 1]));
            }

            return accumulator;
        }, []);
    }

    collidesWith(polygon) {
        for (const line of polygon.getLines()) {
            for (let myLine of this.getLines()) {
                if (myLine.intersects(line)) {
                    return true;
                }
            }
        }

        return false;
    }


    draw(context) {
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.beginPath();

        this.generateCoordinates().forEach((coordinate, index) => {
            if (index === 0) {
                context.moveTo(coordinate.x, coordinate.y);
            } else {
                context.lineTo(coordinate.x, coordinate.y);
            }
        });
        context.closePath();
        context.stroke();
    }

    serialize() {
        return {
            p: this.position.serialize(), // position
            d: this.direction.toFixed(2), // direction
            r: this.radius.toFixed(2), // radius
            s: this.sides // sides
        };
    }
}

Polygon.parse = (data) => {
    const parsed =  new Polygon();
    parsed.position = Vector.parse(data.p);
    parsed.direction = parseFloat(data.d);
    parsed.radius = parseFloat(data.r);
    parsed.sides = data.s;
    return parsed;
};