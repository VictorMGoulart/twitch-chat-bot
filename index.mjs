import * as tmi from "tmi.js";
import { COMMANDS } from "./constants.mjs";
import { RiotAPI } from "./riot-api/riot-api.mjs";
import { OPGGWebScrape } from "./opgg-webscraper/opgg-webscraper.mjs";

const botConfig = {
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.BOT_PASSWORD,
    },
    channels: process.env.CHANNELS.split(" "),
};

const client = new tmi.client(botConfig);

client.on("message", onMessageHandler);

await client.connect();

async function onMessageHandler(channel, tags, message, self) {
    const riotAPI = new RiotAPI();
    const opggWS = new OPGGWebScrape();

    if (self || !message.startsWith("!")) {
        return;
    }

    const commandName = message.split(" ")[0];
    const chatter = tags.username;

    if (commandName === COMMANDS.RANK.command) {
        const username = message.split(" ")[1] || "Artilharia";
        const tagline = message.split(" ")[2] || "BR1";

        const response = await opggWS.getElo(username, tagline);

        if (!response) {
            await sendMessage(
                channel,
                `Não foi possível encontrar informações sobre ${username.toUpperCase()}, tente novamente`,
                chatter
            );
            return;
        }

        await sendMessage(
            channel,
            `${username.toUpperCase()} ${response.rank} - ${
                response.leaguePoints
            } PDLs - ${response.wins}V ${response.loses}D ${
                response.winrate
            } WR`,
            chatter
        );
    }

    if (commandName === COMMANDS.WINRATE.command) {
        // const username = message.split(" ")[1].split("#")[0];
        const username = "Artilharia";
        // const tagline = username.split("#")[1] || "BR1";
        const champion = message.split(" ")[1];
        console.log(champion);

        if (!champion) {
            await sendMessage(channel, COMMANDS.WINRATE.tip, chatter);
            return;
        }

        const response = await opggWS.getWinrateOnChampion(username, champion);
        console.log(response);

        if (!response) {
            await sendMessage(
                channel,
                `Não foi encontrado nenhum jogo com ${champion.toUpperCase()}`,
                chatter
            );
            return;
        }

        await sendMessage(
            channel,
            `===================================
            ${username.toUpperCase()} - ${response.wins}V ${
                response.loses
            }D - ${response.winrate} WR com ${champion.toUpperCase()}
            ====================================
            ${response.kills} K ${response.deaths} D ${
                response.assists
            } A - KDA de ${response.kda}
            ===================================`,
            chatter
        );
    }

    if (commandName === COMMANDS.LASTGAME.command) {
        // const username = message.split(" ")[1].split("#")[0];
        const username = "Artilharia";
        // const tagline = username.split("#")[1] || "BR1";

        // if (!username) {
        //     await sendMessage(target, COMMANDS.LASTGAME.tip, chatter);
        //     return;
        // }

        const response = await opggWS.getLastGameInfo(username);

        console.log(response);
        if (!response) {
            await sendMessage(
                channel,
                `Não foi encontrado nenhum jogo recentemente :\\`,
                chatter
            );
            return;
        }

        await sendMessage(
            channel,
            `===================================
            Informações da última partida de
            ${username.toUpperCase()} - ${response.kills} Abates - ${
                response.deaths
            } Mortes - ${response.assists} Assistências com ${response.champion}
            levou ${response.matchDuration} ${response.creepScore} CS ${
                response.largestMultikill
            } ${response.result}
            ===================================`,
            chatter
        );
    }
}

async function sendMessage(channel, message, chatter) {
    await client.say(channel, `@${chatter} ${message}`);
}
