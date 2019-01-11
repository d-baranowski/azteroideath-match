export class Particle {
    constructor(position, magnitude) {
        this.position = position.clone();
        this.magnitude = magnitude.clone();
        this.radius = 3;
        this.alpha = 1.0;
    }

    update() {
        this.position.add(this.magnitude);
        this.alpha -= 0.03;
    }

    draw(context) {
        context.fillStyle = `rgb(255, 202, 0, ${this.alpha})`;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
        context.lineWidth = 1;
        context.stroke();
    }
}