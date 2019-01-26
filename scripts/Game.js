import {Ship} from "./Ship.js";
import {Asteroid} from "./Asteroid.js";
import {Vector} from "./Vector.js";
import {Bullet} from "./Bullet.js";
import {Particle} from "./Particle.js";
import {Polygon} from "./Polygon.js";


export class Game {
  constructor(context, canvas, withLogic) {
    this.followPlayer = 0;
    this.players = [new Ship(), new Ship()];
    this.asteroids = {0: new Asteroid(new Vector(150, 150), new Vector(0.4, 0.4), 80)};
    this.bullets = {};
    this.particles = {};
    this.context = context;
    this.timeLeft = 99;
    this.playerOneSpawner = setInterval(() => this.spawnAsteroid(this.players[0]), 1200);
    this.playerOneSpawner = setInterval(() => this.spawnAsteroid(this.players[1]), 1200);
    this.playerScores = [0,0];
    this.canvas = canvas;

    if (withLogic) {
      this.tickInterval = setInterval(() => this.tick(), 20);
      this.countdown = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.countdown);
          clearInterval(this.tickInterval);
        }
      }, 1000);
    }
  }

  setTimeLeft(duration) {
    this.timeLeft = duration;
  }

  spawnAsteroid(player) {
    if (Object.values(this.asteroids).length > 100) {
      return;
    }

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
    this.players.forEach((player, index) => {
      const possibleCollisions =
          this.asteroids.filter(asteroid => asteroid.position.directionTo(player.position).magnitude() < 100);

      for (let asteroid of possibleCollisions) {
        if (asteroid.collidesWith(player)) {
          player.die();
          this.playerScores[index]--;
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
      this.players.forEach((player, index) => {
        if ((player) => player.position.directionTo(bullet.position).magnitude() < 300) {
          if (bullet.collidesWith(player)) {
            bullet.die();
            player.die();
            this.playerScores[this.playerScores.length - 1 - index]++;
            this.explosionAt(bullet);
          }
        }
      });
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
    this.context.translate(this.canvas.width / 2 - this.players[this.followPlayer].position.x, this.canvas.height / 2 - this.players[this.followPlayer].position.y);

    this.particles.forEach(particle => particle && particle.draw(this.context));
    this.players.forEach(player => player && player.draw(this.context));
    this.asteroids.forEach(asteroid => asteroid && asteroid.draw(this.context));
    this.bullets.forEach(bullet => bullet && bullet.draw(this.context));

    this.context.restore();

    this.context.fillStyle = 'white';
    this.context.font = '30px Impact';

    this.context.fillText(this.timeLeft, this.canvas.width / 2, 50);
    this.context.fillText(this.playerScores[0], 50, 50);
    this.context.fillText(this.playerScores[1], this.canvas.width - 50, 50);
  }

  playerController(index) {
    return {
      thrust: () => { this.players[index].thrust(); },
      releaseThrust: () => { this.players[index].releaseThrust(); },
      left: (mod) => { this.players[index].left(mod); },
      right: (mod) => { this.players[index].right(mod); },
      releaseTurn: () => { this.players[index].releaseTurn(); },
      shoot: () => { this.players[index].shoot(); },
      shootRelease: () => { this.players[index].shootRelease(); }
    }
  }

  serialize() {
    return {
      p:  this.players.map(x => x.serialize()), // players
      a:  this.asteroids.map(x => x.serialize()), // asteroids
      b:  this.bullets.map(x => x.serialize()), // bullets
      pa:  this.particles.map(x => x.serialize()), //particles
      t: this.timeLeft
    };
  }

  setState(data) {
    const gameState = Game.parse(data);
    this.players = gameState.players;
    gameState.asteroids.forEach(x => {
      x.color = '#F00';
    });
    this.asteroids = gameState.asteroids;
    this.bullets = gameState.bullets;
    this.particles = gameState.particles;
    this.timeLeft = gameState.timeLeft;
  }
}

Game.parse = (data) => {
  const decoded = msgpack.decode(data);
  return {
    players: decoded.p.map(x => Polygon.parse(x)),
    asteroids: decoded.a.map(x => Polygon.parse(x)),
    bullets: decoded.b.map(x => Bullet.parse(x)),
    particles: decoded.pa.map(x => Particle.parse(x)),
    timeLeft: decoded.t
  }
};