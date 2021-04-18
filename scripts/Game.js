import {Ship} from "./Ship.js";
import {Asteroid} from "./Asteroid.js";
import {Vector} from "./Vector.js";
import {Bullet} from "./Bullet.js";
import {Particle} from "./Particle.js";
import {Polygon} from "./Polygon.js";
import {PowerUp} from "./PowerUp.js";
import {Pirate} from "./Pirate.js";
import {Starfield} from "./Starfield.js";


export class Game {
    constructor(context, canvas, withLogic, singlePlayer) {
        this.isMobile = mobileAndTabletCheck();
        this.singlePlayer = singlePlayer;
        this.tickCount = 0;
        this.followPlayer = 0;
        this.players = [
            new Ship(),
        ];
        if (singlePlayer) {
            this.players.push(new Pirate(new Vector().random(0, 1000), this.playerController(1), this));
            this.players.push(new Pirate(new Vector().random(0, 1000), this.playerController(2), this));
            // this.players.push(new Pirate(new Vector().random(0, 1000), this.playerController(3), this));
        } else {
            this.players.push(new Ship(new Vector().random(0, 1000)));
        }
        this.singlePlayer = singlePlayer;
        this.asteroids = {};
        this.powerUps = {};
        this.bullets = {};
        this.particles = {};
        this.context = context;
        this.timeLeft = 99;
        this.playerScores = [0, 0];
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

        this.starfield = new Starfield();
        this.starfield.initialise(null, canvas);
        this.starfield.start(true);
    }

    setTimeLeft(duration) {
        this.timeLeft = duration;
    }

    spawnAsteroid(player) {
        if (Object.values(this.asteroids).length > 100) {
            return;
        }

        let minDistance = 9999999999999999;
        const position = player.position.clone().add(new Vector().random(1000, 2000));
        this.players.forEach(p => {
            const distanceToPlayer = p.position.distanceTo(position);
            if (minDistance > distanceToPlayer) {
                minDistance = distanceToPlayer;
            }
        })

        if (minDistance > 150) {
            this.asteroids[id()] = new Asteroid(
                position,
                position.directionTo(player.position).setMagnitude(randomBetween(1, 8)).turn(randomBetween(-1, 1)),
                randomBetween(30, 100)
            )
        } else {
            this.spawnAsteroid(player)
        }
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

    playersPowerUpsCollisions() {
        this.players.forEach((player, index) => {
            const possibleCollisions =
                this.powerUps.filter(powerUp => powerUp.position.directionTo(player.position).magnitude() < 100);

            for (let powerUp of possibleCollisions) {
                if (powerUp.collidesWith(player)) {
                    player.powerUp(powerUp);
                    powerUp.markForDeletion();
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
                if (bullet.collidesWith(player)) {
                    bullet.die();
                    const isKilled = player.die(() => {
                        player.position =
                            this.players[this.players.length - 1 - index]
                                .position.clone().add(new Vector(randomBetween(500, 1000), randomBetween(500, 1000)));
                    });
                    if (isKilled) {
                        this.playerScores[this.playerScores.length - 1 - index]++;
                        this.powerUps[id()] = new PowerUp({position: bullet.position.clone(), game: this})
                    }
                    this.explosionAt(bullet);
                    this.explosionAt(bullet);
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
                } else {
                    this.powerUps[id()] = new PowerUp({
                        position: value.position.clone(),
                        magnitude: value.magnitude.turn(0.6).multiply(0.5).clone(),
                        game: this
                    })
                }
            }
        })
    }

    playersShoot() {
        this.players.filter(player => player.isShooting).forEach(player => {
            if (player.canShoot && !player.isDead) {
                this.bullets[id()] = new Bullet(player);
                if (player.level > 2) {
                    const l1 = new Bullet(player)
                    l1.magnitude = new Vector(8, 8).setAngle(player.direction - 0.2);
                    this.bullets[id()] = l1;
                    const l2 = new Bullet(player)
                    l2.magnitude = new Vector(8, 8).setAngle(player.direction + 0.2);
                    this.bullets[id()] = l2;
                }
                player.canShoot = false;
                setTimeout(() => {
                    player.canShoot = true;
                }, 200);
            }
        });
    }

    deleteBullets() {
        Object.entries(this.bullets).forEach(([key, value]) => {
            if (value.isGoingToDie) {
                delete this.bullets[key];
            }
        })
    }

    deletePowerUps() {
        Object.entries(this.powerUps).forEach(([key, value]) => {
            if (value.isGoingToDie) {
                delete this.powerUps[key];
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
                            .multiply(randomBetween(7, 20))
                    );
            }
            player.update();
        });
    }

    tick() {
        this.tickCount = (this.tickCount + 1) % 350;
        if (this.tickCount % 90 === 0) {
            this.players.forEach(p => {
                this.spawnAsteroid(p);
                this.spawnAsteroid(p);
                this.spawnAsteroid(p);
                this.spawnAsteroid(p);
            })
        }

        this.stateRadarActive = this.tickCount > 300;

        this.createThrusterParticles();
        this.asteroids.forEach(asteroid => asteroid.update());
        this.bullets.forEach(bullet => bullet.update());
        this.particles.forEach(particle => particle.update());
        this.powerUps.forEach(p => p.update());
        this.playersAsteroidsCollisions();
        this.playersPowerUpsCollisions();
        this.bulletsAsteroidsCollisions();
        this.bulletsPlayersCollisions();

        this.deleteBullets();
        this.deletePowerUps();
        this.splitCollidedAsteroids();
        this.deleteParticles();

        this.playersShoot();
        if (this.tickCount % 10 === 0) {
            this.starfield.update();
        }

        this.removeIfTooFar(this.asteroids);
        this.removeIfTooFar(this.bullets);
        this.removeIfTooFar(this.powerUps);
    }

    showRadar(player, index) {
        this.players.forEach((p, i) => {
            if (index === i) {
                return;
            }
            const dotLocation =
                player.position.clone().add(player.position.directionTo(p.position).setMagnitude(80));

            this.context.fillStyle = '#F00';
            this.context.fillRect(dotLocation.x, dotLocation.y, 4, 4);
        })

    }

    draw() {
        this.context.save();
        this.starfield.draw();
        const scale = this.isMobile ? 0.5 : 1;
        const originx = this.players[this.followPlayer].position.x;
        const originy = this.players[this.followPlayer].position.y;
        this.context.translate(this.canvas.width / 2 - originx * scale, this.canvas.height / 2 - originy * scale);
        this.context.scale(scale, scale);


        this.particles.forEach(particle => particle && particle.draw(this.context));
        this.players.forEach(player => player && player.draw(this.context));
        this.asteroids.forEach(asteroid => asteroid && asteroid.draw(this.context));
        this.bullets.forEach(bullet => bullet && bullet.draw(this.context));
        this.powerUps.forEach(powerUp => powerUp && powerUp.draw(this.context));

        if (this.stateRadarActive) {
            this.showRadar(this.players[this.followPlayer], this.followPlayer);
        }

        this.context.restore();

        this.context.fillStyle = 'white';
        this.context.font = '30px Impact';

        this.context.fillText(this.timeLeft, this.canvas.width / 2, 50);
        this.context.fillText('P1: ' + this.playerScores[0], 150, 50);
        if (!this.singlePlayer) {
            this.context.fillText('P2: ' + this.playerScores[1], this.canvas.width - 150, 50);
        }
    }

    playerController(index) {
        return {
            thrust: () => {
                this.players[index].thrust();
            },
            releaseThrust: () => {
                this.players[index].releaseThrust();
            },
            left: (mod) => {
                this.players[index].left(mod);
            },
            right: (mod) => {
                this.players[index].right(mod);
            },
            releaseTurn: () => {
                this.players[index].releaseTurn();
            },
            shoot: () => {
                this.players[index].shoot();
            },
            shootRelease: () => {
                this.players[index].shootRelease();
            }
        }
    }

    serialize() {
        return {
            p: this.players.map(x => x.serialize()), // players
            a: this.asteroids.map(x => x.serialize()), // asteroids
            b: this.bullets.map(x => x.serialize()), // bullets
            pa: this.particles.map(x => x.serialize()), //particles
            po: this.powerUps.map(x => x.serialize()), // powerUps
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
        this.powerUps = gameState.powerUps;
    }
}

Game.parse = (data) => {
    const decoded = msgpack.decode(data);
    console.log('decoded', decoded);
    return {
        players: decoded.p.map(x => Ship.parse(x)),
        asteroids: decoded.a.map(x => Polygon.parse(x)),
        bullets: decoded.b.map(x => Bullet.parse(x)),
        particles: decoded.pa.map(x => Particle.parse(x)),
        powerUps: decoded.po.map(x => PowerUp.parse(x)),
        timeLeft: decoded.t,
        playerScores: decoded.ps,
        stateRadarActive: decoded.sra
    }
};
