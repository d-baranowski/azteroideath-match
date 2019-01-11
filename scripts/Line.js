export class Line {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    length() {
        return this.start.directionTo(this.end).magnitude;
    }

    intersects(lineX) {
        return Line.intersect(this, lineX);
    }
}

function ccw(pointA,pointB,pointC) {
    return (pointC.y-pointA.y) * (pointB.x-pointA.x) > (pointB.y-pointA.y) * (pointC.x-pointA.x)
}

Line.intersect = (lineA, lineX) => {
    const A = lineA.start;
    const B = lineA.end;
    const C = lineX.start;
    const D = lineX.end;

    return ccw(A,C,D) !== ccw(B,C,D) && ccw(A,B,C) !== ccw(A,B,D)
};