import axios from "axios";
import { championsIds } from "../commons/champions-ids.mjs";
import { RiotAPI } from "../riot-api/riot-api.mjs";
import { getChampionById } from "../commons/get-champion-by-id.mjs";
import { multikillMapper } from "../commons/multikill.mjs";
import { getTimerInMinutes } from "../commons/get-timer-in-minutes.mjs";

export class OPGGWebScrape {
    constructor() {}

    async getWinrateOnChampion(username, searchedChampion) {
        const riotAPI = new RiotAPI();
        // const encryptedSummonerId = riotAPI.getEncryptedSummonerId(username);
        const encryptedSummonerId =
            "vQssyTDy1PWNsFpRMoap6wUA7bzUinFdr6mBY5ZHIpHpjw0"; // Nako

        const response = await axios.get(
            `https://op.gg/api/v1.0/internal/bypass/summoners/br/${encryptedSummonerId}/most-champions/rank?game_type=RANKED&season_id=23`
        );

        const championStats = response.data.data.champion_stats;

        for (const stats of championStats) {
            if (stats.id === championsIds[searchedChampion.toUpperCase()]) {
                const averageKills =
                    Math.round((stats.kill / stats.play) * 10) / 10;
                const averageDeaths =
                    Math.round((stats.death / stats.play) * 10) / 10;
                const averageAssists =
                    Math.round((stats.assist / stats.play) * 10) / 10;

                return {
                    wins: stats.win,
                    loses: stats.lose,
                    winrate:
                        Math.round((stats.win / stats.play) * 100 * 100) / 100 +
                        "%",
                    kills: averageKills,
                    assists: averageAssists,
                    deaths: averageDeaths,
                    kda:
                        Math.round(
                            ((averageKills + averageAssists - averageDeaths) /
                                3) *
                                100
                        ) /
                            100 +
                        ":1",
                };
            }
        }

        return null;
    }

    async getLastGameInfo() {
        const riotAPI = new RiotAPI();
        // const encryptedSummonerId = riotAPI.getEncryptedSummonerId(username);
        const encryptedSummonerId =
            "vQssyTDy1PWNsFpRMoap6wUA7bzUinFdr6mBY5ZHIpHpjw0"; // Nako

        const response = await axios.get(
            `https://op.gg/api/v1.0/internal/bypass/games/br/summoners/${encryptedSummonerId}?&limit=1&hl=pt_BR&game_type=total`
        );

        const matchStats = response.data.data[0].myData;
        const playerStats = response.data.data[0].myData.stats;
        const creepScore = playerStats.neutral_minion_kill + playerStats.minion_kill;

        return {
            kills: playerStats.kill,
            deaths: playerStats.death,
            assists: playerStats.assist,
            result: playerStats.result,
            champion: getChampionById(matchStats.champion_id),
            largestMultikill: multikillMapper[playerStats.largest_multi_kill],
            creepScore: creepScore,
            matchDuration: getTimerInMinutes(response.data.data[0].game_length_second),
        };
    }

    async getElo(username, tagline) {
        const response = await axios.get(
            `https://www.op.gg/_next/data/eTnBsuBcv-5tJNoO-H4dw/en_US/summoners/br/${username}-${tagline}.json?region=br&summoner=${username}-${tagline}`
        );

        const playerStats = response.data.pageProps.data;

        if (!playerStats.league_stats) {
            return null;
        }

        const soloRankedStats = playerStats.league_stats.find(item => item.queue_info.id === 4);

        if(!soloRankedStats.win && !soloRankedStats.lose) {
            return null;
        }

        return {
            wins: soloRankedStats.win,
            loses: soloRankedStats.lose,
            winrate:
                Math.round((soloRankedStats.win / (soloRankedStats.win + soloRankedStats.lose)) * 100 * 100) / 100 +
                "%",
            rank: `${soloRankedStats.tier_info.tier} ${soloRankedStats.tier_info.division}`,
            leaguePoints: soloRankedStats.tier_info.lp,
        };
    }
}
