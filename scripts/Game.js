import {Ship} from "./Ship.js";
import {Asteroid} from "./Asteroid.js";
import {Vector} from "./Vector.js";
import {Bullet} from "./Bullet.js";
import {Particle} from "./Particle.js";

export class Game {
  constructor(context, canvas) {
    this.players = [new Ship(), new Ship()];
    this.asteroids = {0: new Asteroid(new Vector(150, 150), new Vector(0.4, 0.4), 80)};
    this.bullets = {};
    this.particles = {};
    this.context = context;
    this.gameLoop = setInterval(() => this.tick(), 20);
    this.playerOneSpawner = setInterval(() => this.spawnAsteroid(this.players[0]), 1200);
    this.playerOneSpawner = setInterval(() => this.spawnAsteroid(this.players[1]), 1200);
    this.canvas = canvas;
  }

  spawnAsteroid(player) {
    if (Object.values(this.asteroids).length > 100) {
      return;
    }

    const moveBy = new Vector(randomBetween(500, 1000) * Math.ceil(randomBetween(0, 1)) ? -1 : 1, randomBetween(500, 1000) * Math.ceil(randomBetween(0, 1)) ? -1 : 1);

    const position = player.position.clone().add(randomBetween(500, 1000));
    this.asteroids[id()] = new Asteroid(
        position,
        position.directionTo(player.position).setMagnitude(randomBetween(1, 5)).turn(randomBetween(-1, 1)),
        randomBetween(30, 100)
    )
  }

  explosionAt(hit, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles[id()] = new Particle(hit.position.clone(), hit.magnitude.turn(randomBetween(-0.5, 0.5)).setMagnitude(6));
    }
  }

  playersAsteroidsCollisions() {
    this.players.forEach(player => {
      const possibleCollisions =
          this.asteroids.filter(asteroid => asteroid.position.directionTo(player.position).magnitude() < 100);

      for (let asteroid of possibleCollisions) {
        if (asteroid.collidesWith(player)) {
          player.die();
          this.explosionAt(asteroid);
          asteroid.markForExplosion();
          break;
        }
      }
    });
  }

  bulletsAsteroidsCollisions() {
    this.bullets.forEach(bullet => {
      const possibleCollisions =
          this.asteroids.filter(asteroid => asteroid.position.directionTo(bullet.position).magnitude() < 100);

      for (let asteroid of possibleCollisions) {
        if (bullet.collidesWith(asteroid)) {
          bullet.die();
          asteroid.markForExplosion();
          this.explosionAt(bullet, asteroid.radius / 8);
          break;
        }
      }
    });
  }

  bulletsPlayersCollisions() {
    this.bullets.forEach(bullet => {
      const possibleCollisions =
          this.players.filter(player => player.position.directionTo(bullet.position).magnitude() < 100);

      for (let player of possibleCollisions) {
        if (bullet.collidesWith(player)) {
          bullet.die();
          player.die();
          this.explosionAt(bullet);
          break;
        }
      }
    });
  }

  splitCollidedAsteroids() {
    Object.entries(this.asteroids).forEach(([key, value]) => {
      if (value.isGoingToExplode) {
        delete this.asteroids[key];

        if ((value.radius / 2) > 5) {
          this.asteroids[id()] = new Asteroid(value.position.clone(), value.magnitude.turn(0.6).multiply(2), value.radius / 2);
          this.asteroids[id()] = new Asteroid(value.position.clone(), value.magnitude.turn(-0.6).multiply(2), value.radius / 2);
        }
      }
    })
  }

  playersShoot() {
    this.players.filter(player => player.isShooting).forEach(player => {
      if (player.canShoot) {
        this.bullets[id()] = new Bullet(player);
        player.canShoot = false;
        setTimeout(() => {
          player.canShoot = true;
        }, 200);
      }
    });
  }

  deleteBullets() {
    Object.entries(this.bullets).forEach(([key, value]) => {
      const {x, y} = value.position;
      if (value.isGoingToDie) {
        delete this.bullets[key];
      }
    })
  }

  removeIfTooFar(list) {
    Object.entries(list).forEach(([key, value]) => {
      if (value.position.clone().directionTo(this.players[0].position).magnitude() > 1000 && value.position.clone().directionTo(this.players[1].position).magnitude() > 1000) {
        delete list[key];
      }
    })
  }

  deleteParticles() {
    Object.entries(this.particles).forEach(([key, value]) => {
      if (value.alpha < 0) {
        delete this.particles[key];
      }
    })
  }

  createThrusterParticles() {
    this.players.forEach(player => {
      if (player.isThrusting) {
        this.particles[id()] =
            new Particle(
                player.position
                    .clone().subtract(player.thrustForce.clone().multiply(70)),
                player.thrustForce
                    .negative()
                    .turn(randomBetween(-1, 1))
                    .multiply(randomBetween(7,20))
            );
      }
      player.update();
    });
  }

  tick() {
    this.createThrusterParticles();
    this.asteroids.forEach(asteroid => asteroid.update());
    this.bullets.forEach(bullet => bullet.update());
    this.particles.forEach(particle => particle.update());
    this.playersAsteroidsCollisions();
    this.bulletsAsteroidsCollisions();
    this.bulletsPlayersCollisions();

    this.deleteBullets();
    this.splitCollidedAsteroids();
    this.deleteParticles();

    this.playersShoot();

    this.removeIfTooFar(this.asteroids);
    this.removeIfTooFar(this.bullets);

  }

  draw() {
    this.context.save();
    this.context.translate(this.canvas.width / 2 - this.players[0].position.x, this.canvas.height / 2 - this.players[0].position.y);

    this.particles.forEach(particle => particle.draw(this.context));
    this.players.forEach(player => player.draw(this.context));
    this.asteroids.forEach(asteroid => asteroid.draw(this.context));
    this.bullets.forEach(bullet => bullet.draw(this.context));

    this.context.restore();
  }

  playerController(index) {
    return {
      thrust: () => { this.players[index].thrust(); },
      releaseThrust: () => { this.players[index].releaseThrust(); },
      left: () => { this.players[index].left(); },
      right: () => { this.players[index].right(); },
      releaseTurn: () => { this.players[index].releaseTurn(); },
      shoot: () => { this.players[index].shoot(); },
      shootRelease: () => { this.players[index].shootRelease(); }
    }
  }
}