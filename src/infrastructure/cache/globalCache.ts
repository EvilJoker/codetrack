import { ORDER_ASC } from "../constants/constants";

export const globalCache = {
    filters:  {
        recommend_basic: true,
        recommend_need: true,
        recommend_challenge: true,
        status_plan: true,
        status_doing: true,
        status_done: true,
        difficulty_easy: true,
        difficulty_mid: true,
        difficulty_hard: true,
        order: ORDER_ASC
    } ,
    tags:[] as string[],
    filtertags:[] as string[],
    isInit: true,
    problems:[] as any[],
    path: "" 
};

