import { championsIds } from "./champions-ids.mjs";

export function getChampionById(id) {
    return Object.keys(championsIds).find((key) => championsIds[key] === id);
}
