import {Ship} from "./Ship.js";
import {Asteroid} from "./Asteroid.js";
import {Vector} from "./Vector.js";
import {Bullet} from "./Bullet.js";
import {Particle} from "./Particle.js";
import {Polygon} from "./Polygon.js";


export class Game {
  constructor(context, canvas, withLogic) {
    this.tickCount = 0;
    this.followPlayer = 0;
    this.players = [new Ship(), new Ship(new Vector().add(new Vector(randomBetween(500, 1000), randomBetween(500, 1000))))];
    this.asteroids = {0: new Asteroid(new Vector(150, 150), new Vector(0.4, 0.4), 80)};
    this.bullets = {};
    this.particles = {};
    this.context = context;
    this.timeLeft = 99;
    this.playerScores = [0,0];
    this.stateRadarActive = false;
    this.canvas = canvas;

    if (withLogic) {
      this.tickInterval = setInterval(() => this.tick(), 20);
      this.countdown = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.countdown);
          clearInterval(this.tickInterval);
          setTimeout(() => {
            window.location.reload();
          }, 7 * 1000)
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

    const position = player.position.clone().add(new Vector(randomBetween(500, 1000), randomBetween(500, 1000)));
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
          player.die(() => {
            player.position =
                this.players[this.players.length - 1 - index]
                    .position.clone().add(new Vector(randomBetween(500, 1000), randomBetween(500, 1000)));
          });
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
            player.die(() => {
              player.position =
                  this.players[this.players.length - 1 - index]
                      .position.clone().add(new Vector(randomBetween(500, 1000), randomBetween(500, 1000)));
            });
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
      if (player.canShoot && !player.isDead) {
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
      if (player.isThrusting && !player.isDead) {
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
    this.tickCount = (this.tickCount + 1) % 500;
    if (this.tickCount === 499) {
      this.spawnAsteroid(this.players[0]);
      this.spawnAsteroid(this.players[1]);
    }

    this.stateRadarActive = this.tickCount > 300;

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

  showRadar(player, index) {
    const dotLocation =
        player.position.clone().add(player.position.directionTo(this.players[this.players.length - 1 - index].position).setMagnitude(80));

    this.context.fillStyle = '#F00';
    this.context.fillRect(dotLocation.x,dotLocation.y,4,4);
  }

  draw() {
    this.context.save();
    this.context.translate(this.canvas.width / 2 - this.players[this.followPlayer].position.x, this.canvas.height / 2 - this.players[this.followPlayer].position.y);

    this.particles.forEach(particle => particle && particle.draw(this.context));
    this.players.forEach(player => player && player.draw(this.context));
    this.asteroids.forEach(asteroid => asteroid && asteroid.draw(this.context));
    this.bullets.forEach(bullet => bullet && bullet.draw(this.context));

    if (this.stateRadarActive) {
      this.showRadar(this.players[this.followPlayer], this.followPlayer);
    }

    this.context.restore();

    this.context.fillStyle = 'white';
    this.context.font = '30px Impact';

    this.context.fillText(this.timeLeft, this.canvas.width / 2, 50);
    this.context.fillText('P1: ' + this.playerScores[0], 150, 50);
    this.context.fillText('P2: ' + this.playerScores[1], this.canvas.width - 150, 50);
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
      t: this.timeLeft,
      ps: this.playerScores,
      sra: this.stateRadarActive
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
    this.playerScores = gameState.playerScores;
    this.stateRadarActive = gameState.stateRadarActive;
  }
}

Game.parse = (data) => {
  const decoded = msgpack.decode(data);
  return {
    players: decoded.p.map(x => Polygon.parse(x)),
    asteroids: decoded.a.map(x => Polygon.parse(x)),
    bullets: decoded.b.map(x => Bullet.parse(x)),
    particles: decoded.pa.map(x => Particle.parse(x)),
    timeLeft: decoded.t,
    playerScores: decoded.ps,
    stateRadarActive: decoded.sra
  }
};