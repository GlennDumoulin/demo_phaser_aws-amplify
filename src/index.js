import "./style.css";

import Phaser from "phaser";
import React from "react";
import ReactDOM from "react-dom";
import { DataStore } from "@aws-amplify/datastore";
import { Achievement, Userdata, UserdataAchievement } from "./models";
import regeneratorRuntime from "regenerator-runtime";

import skyImg from "./assets/sky.png";
import platformImg from "./assets/platform.png";
import starImg from "./assets/star.png";
import bombImg from "./assets/bomb.png";
import dudeSprite from "./assets/dude.png";

import Register from "./components/Register";
import GameInfo from "./components/GameInfo";

const Game = () => {
    const width = window.innerWidth / 1.25;
    const height = window.innerHeight;

    const currentUser = JSON.parse(window.localStorage.getItem("user"));

    const config = {
        type: Phaser.AUTO,
        width: width,
        height: height,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: height / 1.3 },
                debug: false,
            },
        },
        scene: {
            preload: preload,
            create: create,
            update: update,
        },
    };

    let player;
    let stars;
    let starsCollected = currentUser.stars_collected;
    let upgradedStarChance;
    let superUpgradedStarChance;
    let bombs;
    let upgradedBombChance;
    let platforms;
    let cursors;
    let score = 0;
    let scoreText;
    let highscore = currentUser.highscore;
    let highscoreText;
    let gameOver = false;

    let game = new Phaser.Game(config);

    function preload() {
        this.load.image("sky", skyImg);
        this.load.image("ground", platformImg);
        this.load.image("star", starImg);
        this.load.image("bomb", bombImg);
        this.load.spritesheet("dude", dudeSprite, {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    function create() {
        //  A simple background for our game
        this.add
            .image(width / 2, height / 2, "sky")
            .setScale(width > 1400 ? 3 : 2);

        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        platforms
            .create(
                width / 2,
                width > 1400 ? height - 10 : height - 30,
                "ground"
            )
            .setScale(width > 1400 ? 5.5 : 3.2)
            .refreshBody();

        //  Now let's create some ledges
        platforms
            .create(width / 1.1, height / 1.5, "ground")
            .setScale(width > 1400 ? 2 : 1)
            .refreshBody();
        platforms
            .create(50, height / 1.65, "ground")
            .setScale(width > 1400 ? 2 : 1)
            .refreshBody();
        platforms
            .create(-50, 250, "ground")
            .setScale(width > 1400 ? 2 : 1)
            .refreshBody();
        platforms
            .create(width / 1.8, height / 2.5, "ground")
            .setScale(width > 1400 ? 2 : 1)
            .refreshBody();
        platforms
            .create(width * 1.1, height / 3.25, "ground")
            .setScale(width > 1400 ? 2 : 1)
            .refreshBody();

        // The player and its settings
        player = this.physics.add
            .sprite(100, 500, "dude")
            .setScale(width > 1400 ? 2 : 1.25)
            .refreshBody();

        //  Player physics properties. Give the little guy a slight bounce.
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 5,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });

        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();

        //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
        stars = this.physics.add.group({
            key: "star",
            repeat: 14,
            setXY: { x: 50, y: 0, stepX: width / 15 },
        });

        stars.children.iterate(function (child) {
            //  Give each star a slightly different bounce
            child.setScale(width > 1400 ? 2 : 1.25).refreshBody();
            child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.5));
        });

        bombs = this.physics.add.group();

        //  The score
        scoreText = this.add.text(20, 20, "score: 0", {
            fontSize: width > 1400 ? "80px" : "40px",
            fill: "#000",
        });

        //  The highscore of current user
        highscoreText = this.add.text(
            20,
            width > 1400 ? 100 : 60,
            `highscore: ${highscore}`,
            {
                fontSize: width > 1400 ? "48px" : "24px",
                fill: "#000",
            }
        );

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(player, stars, collectStar, null, this);

        this.physics.add.collider(player, bombs, hitBomb, null, this);
    }

    function update() {
        if (gameOver) {
            return;
        }

        if (cursors.left.isDown) {
            player.setVelocityX(width / -5);

            player.anims.play("left", true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(width / 5);

            player.anims.play("right", true);
        } else {
            player.setVelocityX(0);

            player.anims.play("turn");
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(height / -1.4);
        }

        if (cursors.down.isDown && !player.body.touching.down) {
            player.setVelocityY(height / 1.25);
        }
    }

    function collectStar(player, star) {
        star.disableBody(true, true);

        starsCollected += 1;

        //  Add and update the score
        if (star.data && star.data.superUpgraded) {
            score += 50;
        } else if (star.data && star.data.upgraded) {
            score += 25;
        } else {
            score += 10;
        }
        scoreText.setText("Score: " + score);

        if (stars.countActive(true) === 0) {
            //  A new batch of stars to collect
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);

                upgradedStarChance = Phaser.Math.FloatBetween(0, 1);
                if (upgradedStarChance >= 0.8) {
                    child.setTint(0x00ffff);
                    child.data = {
                        upgraded: true,
                    };

                    superUpgradedStarChance = Phaser.Math.FloatBetween(0, 1);
                    if (superUpgradedStarChance >= 0.9) {
                        child.setTint(0xbb00ee);
                        child.setScale(1.5).refreshBody();
                        child.data = {
                            superUpgraded: true,
                        };
                    }
                }
            });

            let x =
                player.x < width / 2
                    ? Phaser.Math.Between(width / 2, width)
                    : Phaser.Math.Between(0, width / 2);

            let bomb = bombs.create(x, 16, "bomb");
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;

            upgradedBombChance = Phaser.Math.FloatBetween(0, 1);
            if (upgradedBombChance >= 0.7) {
                bomb.setScale(1.5).refreshBody();
                bomb.setVelocity(Phaser.Math.Between(-300, 300), 30);
            }
        }
    }

    function hitBomb(player, bomb) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play("turn");

        gameOver = true;

        updateUserData();

        const gameOverContainer = document.querySelector(
            ".game-over-container"
        );
        gameOverContainer.classList.remove("hidden");
    }

    async function updateUserData() {
        const userdata = await DataStore.query(Userdata, currentUser.id);

        let newHighscore = highscore;
        if (highscore < score) {
            newHighscore = score;
        }

        await DataStore.save(
            Userdata.copyOf(userdata, (updated) => {
                updated.games_played += 1;
                updated.highscore = newHighscore;
                updated.stars_collected = starsCollected;
            })
        );

        const updatedUserdata = await DataStore.query(Userdata, userdata.id);

        window.localStorage.setItem("user", JSON.stringify(updatedUserdata));

        updateAchievements();
    }

    async function updateAchievements() {
        const allAchievements = await DataStore.query(Achievement);
        const userdataAchievements = await DataStore.query(UserdataAchievement);
        const currentUser = JSON.parse(window.localStorage.getItem("user"));

        allAchievements.forEach(async (achievement) => {
            const alreadyAchieved = userdataAchievements.find(
                (userdataAchievement) => {
                    return (
                        userdataAchievement.achievement.id === achievement.id &&
                        userdataAchievement.userdata.id === currentUser.id
                    );
                }
            );

            if (!alreadyAchieved) {
                switch (achievement.target) {
                    case "highscore":
                        if (achievement.value <= currentUser.highscore) {
                            await DataStore.save(
                                new UserdataAchievement({
                                    userdataID: currentUser.id,
                                    achievementID: achievement.id,
                                    userdata: currentUser,
                                    achievement: achievement,
                                })
                            );
                        }
                        break;
                    case "games_played":
                        if (achievement.value <= currentUser.games_played) {
                            await DataStore.save(
                                new UserdataAchievement({
                                    userdataID: currentUser.id,
                                    achievementID: achievement.id,
                                    userdata: currentUser,
                                    achievement: achievement,
                                })
                            );
                        }
                        break;
                    case "stars_collected":
                        if (achievement.value <= currentUser.stars_collected) {
                            await DataStore.save(
                                new UserdataAchievement({
                                    userdataID: currentUser.id,
                                    achievementID: achievement.id,
                                    userdata: currentUser,
                                    achievement: achievement,
                                })
                            );
                        }
                        break;
                    default:
                        break;
                }
            }
        });
    }

    return null;
};

if (!window.localStorage.getItem("user")) {
    ReactDOM.render(<Register />, document.getElementById("root"));
} else {
    ReactDOM.render(<Game />, document.getElementById("root"));
    ReactDOM.render(<GameInfo />, document.getElementById("game-info"));
}
