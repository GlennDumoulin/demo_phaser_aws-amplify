import React from "react";
import { DataStore } from "@aws-amplify/datastore";
import { Achievement, Userdata, UserdataAchievement } from "../models";
import regeneratorRuntime from "regenerator-runtime";

export default class GameInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameInfoItems: [],
            currentUser: {},
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                gameInfoItems: document.querySelectorAll(".game-info-item"),
            });
        }, 1000);

        this.state.currentUser = JSON.parse(
            window.localStorage.getItem("user")
        );
    }

    componentDidUpdate() {
        // Get all game info items on the page
        const allGameInfoItems = document.querySelectorAll(".game-info-item");

        for (let i = 0; i < allGameInfoItems.length; i++) {
            // Get the current game info item
            const gameInfoItem = allGameInfoItems[i].childNodes[0];

            gameInfoItem.addEventListener("click", (ev) => {
                // When a game info item is clicked, close all others and open/close the current item
                ev.stopPropagation();
                closeAllGameInfoItems(ev.target);
                ev.target.classList.toggle("active");
                ev.target.nextSibling.classList.toggle("closed");

                // When a game info item is clicked, reload the data if necessary
                fetchData(ev.target, this.state.currentUser);
            });
        }

        /**
         * A function that will close all select boxes in the document except the current select box
         * @param EventTarget target
         */
        function closeAllGameInfoItems(target) {
            // Set an empty array for all game info items except the current one
            const arrNo = [];

            const gameInfoLabel = document.querySelectorAll(".game-info-label");
            const gameInfoContent = document.querySelectorAll(
                ".game-info-content"
            );

            // Add all game info items to array except the current one
            for (let i = 0; i < gameInfoLabel.length; i++) {
                if (target === gameInfoLabel[i]) {
                    arrNo.push(i);
                } else {
                    gameInfoLabel[i].classList.remove("active");
                }
            }
            // Close all game info items from the array
            for (let i = 0; i < gameInfoContent.length; i++) {
                if (arrNo.indexOf(i)) {
                    gameInfoContent[i].classList.add("closed");
                }
            }
        }

        /**
         * A function that will refetch the data from the leaderboard or achievements
         * @param EventTarget target
         * @param Object currentUser
         */
        async function fetchData(target, currentUser) {
            if (
                target.id === "leaderboard" &&
                !target.nextSibling.classList.contains("closed")
            ) {
                const userdata = await DataStore.query(Userdata);
                userdata.sort((a, b) => b.highscore - a.highscore);

                let leaderboardHTML = "";

                userdata.forEach((user) => {
                    leaderboardHTML += `
                    <div class="leaderboard-content-item">
                        <h1>${user.username} - ${user.highscore}</h1>
                    </div>
                    `;
                });

                const leaderboardContainer = document.getElementById(
                    "leaderboard-content"
                );
                leaderboardContainer.innerHTML = leaderboardHTML;
            }

            if (
                target.id === "achievements" &&
                !target.nextSibling.classList.contains("closed")
            ) {
                const achievements = await DataStore.query(Achievement);
                const userdataAchievements = await DataStore.query(
                    UserdataAchievement
                );

                let achievementsHTML = "";

                achievements.forEach((achievement) => {
                    let achieved = false;

                    userdataAchievements.forEach((userdataAchievement) => {
                        if (
                            userdataAchievement.achievement.id ===
                                achievement.id &&
                            userdataAchievement.userdata.id === currentUser.id
                        ) {
                            achieved = true;
                        }
                    });

                    achievementsHTML += `
                    <div class="achievements-content-item${
                        achieved ? " achieved" : ""
                    }">
                        <h1>${achievement.title}</h1>
                        <p>${achievement.description}</p>
                    </div>
                    `;
                });

                const achievementsContainer = document.getElementById(
                    "achievements-content"
                );
                achievementsContainer.innerHTML = achievementsHTML;
            }
        }

        // If the user clicks anywhere outside the game info item, then close all game info items
        document.addEventListener("click", (ev) =>
            closeAllGameInfoItems(ev.target)
        );
    }

    render() {
        return (
            <div className="game-container">
                <div className="game-over-container hidden">
                    <div className="game-over-content">
                        <h1>Game over</h1>
                        <a href="" id="play-again-btn">
                            Play again
                        </a>
                    </div>
                </div>
                <div className="game-info-container">
                    <div className="game-info-item">
                        <div className="game-info-label" id="leaderboard">
                            Leaderboard
                        </div>
                        <div
                            className="game-info-content closed"
                            id="leaderboard-content"
                        >
                            The leaderboard is loading...
                        </div>
                    </div>
                    <div className="game-info-item">
                        <div className="game-info-label" id="achievements">
                            Achievements
                        </div>
                        <div
                            className="game-info-content closed"
                            id="achievements-content"
                        >
                            The achievements are loading...
                        </div>
                    </div>
                    <div className="game-info-item">
                        <div className="game-info-label" id="research">
                            My research
                        </div>
                        <div className="game-info-content closed">
                            <div>
                                <h1>Phaser</h1>
                                <a
                                    href="https://github.com/glendumo/demo_phaser_aws-amplify/blob/master/src/assets/Phaser_DumoulinGlenn.pdf"
                                    target="_blank"
                                    className="download-btn"
                                >
                                    Download my research
                                </a>
                                <a
                                    href="https://www.phaser.io/"
                                    target="_blank"
                                >
                                    Try it out yourself!
                                </a>
                            </div>
                            <div>
                                <h1>AWS Amplify</h1>
                                <a
                                    href="https://github.com/glendumo/demo_phaser_aws-amplify/blob/master/src/assets/AWS-Amplify_DumoulinGlenn.pdf"
                                    target="_blank"
                                    className="download-btn"
                                >
                                    Download my research
                                </a>
                                <a
                                    href="https://sandbox.amplifyapp.com/"
                                    target="_blank"
                                >
                                    Try it out yourself!
                                </a>
                            </div>
                            <div>
                                <h1>TypeScript for APIS</h1>
                                <a
                                    href="https://github.com/glendumo/demo_phaser_aws-amplify/blob/master/src/assets/TypeScript-For-APIS_DumoulinGlenn.pdf"
                                    target="_blank"
                                    className="download-btn"
                                >
                                    Download my research
                                </a>
                            </div>
                            <div>
                                <h1>My GitHub repo</h1>
                                <a
                                    href="https://github.com/glendumo/demo_phaser_aws-amplify"
                                    target="_blank"
                                    className="github-link"
                                >
                                    View code
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
