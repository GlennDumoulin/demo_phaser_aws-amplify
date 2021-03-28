import React from "react";
import { DataStore } from "@aws-amplify/datastore";
import { Achievement, Userdata } from "../models";
import regeneratorRuntime from "regenerator-runtime";

export default class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            registerErr: "",
            allAchievements: [],
            allUserdata: [],
            defaultData: {},
        };
    }

    async componentDidMount() {
        this.setState({ allAchievements: await DataStore.query(Achievement) });

        this.setState({ allUserdata: await DataStore.query(Userdata) });

        this.getDefaultData();
    }

    async componentDidUpdate() {
        this.state.allAchievements = await DataStore.query(Achievement);

        this.state.allUserdata = await DataStore.query(Userdata);
    }

    async getDefaultData() {
        this.state.defaultData = await fetch("./src/data/defaultData.json", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                return myJson.defaultData;
            });
    }

    async addDefaultData() {
        const allAchievements = await DataStore.query(Achievement);
        const allUserdata = await DataStore.query(Userdata);

        this.state.defaultData.achievements.forEach(async (achievement) => {
            const achievementAlreadyExists = allAchievements.find(
                (existingAchievement) => {
                    return existingAchievement.title === achievement.title;
                }
            );

            if (!achievementAlreadyExists) {
                await DataStore.save(
                    new Achievement({
                        title: achievement.title,
                        description: achievement.description,
                        value: achievement.value,
                        achieved_by: [],
                        target: achievement.target,
                    })
                );
            }
        });

        this.state.defaultData.userdata.forEach(async (user) => {
            const userAlreadyExists = allUserdata.find((existingUser) => {
                return existingUser.username === user.username;
            });

            if (!userAlreadyExists) {
                await DataStore.save(
                    new Userdata({
                        username: user.username,
                        highscore: user.highscore,
                        games_played: 0,
                        achievements: [],
                        stars_collected: 0,
                    })
                );
            }
        });
    }

    async registerUser(ev) {
        ev.preventDefault();

        await this.addDefaultData();

        const userAlreadyExists = this.state.allUserdata.find((user) => {
            return user.username === this.state.username;
        });

        if (!userAlreadyExists) {
            this.setState({ registerErr: "" });

            await DataStore.save(
                new Userdata({
                    username: this.state.username,
                    highscore: 0,
                    games_played: 0,
                    achievements: [],
                    stars_collected: 0,
                })
            );

            this.setState({ allUserdata: await DataStore.query(Userdata) });

            const currentUser = this.state.allUserdata.find((user) => {
                return user.username === this.state.username;
            });

            window.localStorage.setItem("user", JSON.stringify(currentUser));

            window.location.reload();
        } else {
            this.setState({ registerErr: "This username is already taken." });
        }
    }

    render() {
        return (
            <div className="register">
                <form
                    id="add-achievement"
                    name="add-achievement"
                    onSubmit={(ev) => this.registerUser(ev)}
                >
                    <label htmlFor="username">Choose a username</label>
                    <br />
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter username"
                        required
                        value={this.state.username}
                        onChange={(e) => {
                            this.setState({ username: e.target.value });
                        }}
                    />
                    <br />
                    <input
                        type="submit"
                        id="register-btn"
                        value="Ready, Set, Play!"
                    />
                    <br />
                    <span>{this.state.registerErr}</span>
                </form>
            </div>
        );
    }
}
