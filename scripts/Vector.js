export class Vector {
    constructor(x,y) {
        this.x = x || 0.0;
        this.y = y || 0.0;
    }

    add(v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        } else {
            this.x += v;
            this.y += v;
        }
        return this;
    }

    subtract(v) {
        if (v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        } else {
            this.x -= v;
            this.y -= v;
        }

        return this;
    }

    multiply(v) {
        if (v instanceof Vector) {
            this.x *= v.x;
            this.y *= v.y;
        } else {
            this.x *= v;
            this.y *= v;
        }
        return this;
    }

    divide(v) {
        if (v instanceof Vector) {
            if(v.x !== 0) this.x /= v.x;
            if(v.y !== 0) this.y /= v.y;
        } else {
            if(v !== 0) {
                this.x /= v;
                this.y /= v;
            }
        }
        return this;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    setMagnitude(magnitude)
    {
        const angle = this.angle();
        this.x = Math.cos(angle) * magnitude;
        this.y = Math.sin(angle) * magnitude;
        return this;
    }

    normalize() {
        return this.divide(this.magnitude());
    }

    directionTo(v) {
        return new Vector(v.x - this.x, v.y - this.y);
    }

    angle()
    {
        return Math.atan2(this.y, this.x);
    }

    setAngle(angle)
    {
        const length = this.magnitude();
        const x = Math.cos(angle) * length;
        const y = Math.sin(angle) * length;
        return new Vector(x, y);
    }

    negative() {
        const x = -this.x;
        const y = -this.y;
        return new Vector(x, y);
    }

    equals(v) {
        return this.x === v.x && this.y === v.y;
    }

    clone() {
        return Vector.clone(this);
    }

    turn(angle) {
        return this.setAngle(this.angle() + angle % 1.0).clone()
    }
}

Vector.clone = function (vector) {
    return new Vector(Number(vector.x), Number(vector.y));
};