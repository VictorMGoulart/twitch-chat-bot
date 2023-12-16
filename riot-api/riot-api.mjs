import axios from "axios";
import { QUEUE_TYPE } from "../constants.mjs";

export const axiosConfig = {
    headers: {
        "X-Riot-Token": process.env.RIOT_TOKEN,
    },
};

export class RiotAPI {
    constructor() {}

    async getEncryptedSummonerId(username) {
        const responseUser = await axios.get(
            `https://br1.api.riotgames.com/tft/summoner/v1/summoners/by-name/${username}`,
            axiosConfig
        );
        const encryptedSummonerId = responseUser.data.id;

        return encryptedSummonerId;
    }

    async getRank(username, tagline) {
        const encryptedSummonerId = this.getEncryptedSummonerId(username);

        const responseLeague = await axios.get(
            `https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`,
            axiosConfig
        );

        const userData = responseLeague.data.find(
            (data) => data.queueType === QUEUE_TYPE.SOLO
        );

        const responseData = {
            summonerName: userData.summonerName,
            winrate:
                Math.ceil(
                    (userData.wins / (userData.wins + userData.losses)) * 100
                ) + "%",
            leaguePoints: userData.leaguePoints,
            rank: userData.tier,
            division: userData.rank,
        };

        return responseData;
    }
}
