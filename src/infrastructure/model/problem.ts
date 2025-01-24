import { logger } from "../log/logger";
import * as fs from 'fs';
import * as path from 'path';
import { globalCache } from "../cache/globalCache";
import { DIFFICULTY_EASY, RECOMMEND_BASIC, STATUS_PLAN, DIFFICULTY_MEDIUM, RECOMMEND_NEED, DIFFICULTY_HARD, RECOMMEND_CHALLENGE, STATUS_DOING, STATUS_DONE } from "../constants/constants";
import * as vscode from 'vscode';
// 定义 Problem 接口
export class Problem {
    name: string;
    name_zh: string;
    description: string;
    description_zh: string;
    meta: { difficulty: string; recommend: string };
    info: { updateTime: string; status: string };
    tags: string[];
    filePath: string;
    category: string;

    constructor(
        name: string,
        name_zh: string,
        description: string,
        description_zh: string,
        meta: { difficulty: string; recommend: string },
        info: { updateTime: string; status: string },
        tags: string[],
        filePath: string,
        category: string
    ) {
        if (!name) { throw new Error("name cannot be empty"); }
        if (!name_zh) { throw new Error("name_zh cannot be empty"); }
        if (!description) { throw new Error("description cannot be empty"); }
        if (!description_zh) { throw new Error("description_zh cannot be empty"); }
        if (!meta.difficulty) { throw new Error("meta.difficulty cannot be empty"); }
        if (!meta.recommend) { throw new Error("meta.recommend cannot be empty"); }
        if (!info.updateTime) { throw new Error("info.updateTime cannot be empty"); }
        if (!info.status) { throw new Error("info.status cannot be empty"); }
        if (!tags || tags.length === 0) { throw new Error("tags cannot be empty"); }
        if (!filePath) { throw new Error("filePath cannot be empty"); }
        if (!category) { throw new Error("category cannot be empty"); }

        this.name = name;
        this.name_zh = name_zh;
        this.description = description;
        this.description_zh = description_zh;
        this.meta = meta;
        this.info = info;
        this.tags = tags;
        this.filePath = filePath;
        this.category = category;
    }
}



export function LoadProblems(problemsPath: string): Problem[] {
    const problems: Problem[] = [];
    logger.info("path:" + problemsPath);
    if (fs.existsSync(problemsPath)) {
        const files = fs.readdirSync(problemsPath);
        files.forEach(file => {
            const filePath = path.join(problemsPath, file, 'meta.json');
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const problem = JSON.parse(fileContent);
                // 修改问题对象以匹配新的数据结构
                try {
                    problems.push(new Problem( // 修改: 使用 Problem 类的构造函数
                        problem.name,
                        problem.name_zh,
                        problem.description,
                        problem.description_zh,
                        problem.meta,
                        problem.info,
                        problem.tags,
                        path.join(problemsPath, file),
                        problem.category // 假设 meta.json 中有 category 字段
                    ));
                } catch (error) {
                    vscode.window.showErrorMessage(path.join(problemsPath, file)+ " " +error);
                }
            }
        });
    } else {
        // 添加默认的问题列表，修改以匹配新的数据结构
        problems.push(new Problem(
            "问题1",
            "问题1",
            "这是问题1的描述",
            "这是问题1的描述",
            { difficulty: DIFFICULTY_EASY, recommend: RECOMMEND_BASIC },
            { updateTime: "2023-10-01T12:00:00Z", status: STATUS_PLAN },
            ["数组"],
            "path",
            "数组",
        ));
        problems.push(new Problem(
            "问题2",
            "问题2",
            "这是问题2的描述",
            "这是问题2的描述",
            { difficulty: DIFFICULTY_MEDIUM, recommend: RECOMMEND_NEED },
            { updateTime: "2023-10-01T12:00:00Z", status: STATUS_PLAN },
            ["哈希表", "数组"],
            "path",
            "哈希表",
        ));
        problems.push(new Problem(
            "问题3",
            "问题3",
            "这是问题3的描述",
            "这是问题3的描述",
            { difficulty: DIFFICULTY_HARD, recommend: RECOMMEND_CHALLENGE },
            { updateTime: "2023-10-01T12:00:00Z", status: STATUS_DOING },
            ["数组"],
            "path",
            "数组",
        ));
        problems.push(new Problem(
            "问题4",
            "问题4",
            "这是问题4的描述",
            "这是问题4的描述",
            { difficulty: DIFFICULTY_EASY, recommend: RECOMMEND_BASIC },
            { updateTime: "2023-10-01T12:00:00Z", status: STATUS_DONE },
            ["哈希表"],
            "path",
            "数组",
        ));
        problems.push(new Problem(
            "问题5",
            "问题5",
            "这是问题5的描述",
            "这是问题5的描述",
            { difficulty: DIFFICULTY_MEDIUM, recommend: RECOMMEND_NEED },
            { updateTime: "2023-10-01T12:00:00Z", status: STATUS_PLAN },
            ["哈希表"],
            "path",
            "数组",
        ));
    }
    let debuguse = globalCache;
    // 提炼所有 problems 中的 tags 形成一个不重复的 tags 列表
    const allTags = getUniqueTags(problems);
    globalCache.tags = allTags;
    const allCata = getUniqueCatagory(problems);
    globalCache.categorys = allCata;
    if (globalCache.isInit) {
        // 第一次初始化
        globalCache.filterTags = allTags;
        globalCache.filterCategorys = allCata;
        globalCache.isInit = false;
    }

    // 根据 globalCache.filters 过滤问题列表
    const filteredProblems = problems.filter(problem => {
        return (globalCache.filters.recommend_basic || problem.meta.recommend !== RECOMMEND_BASIC) &&
            (globalCache.filters.recommend_need || problem.meta.recommend !== RECOMMEND_NEED) &&
            (globalCache.filters.recommend_challenge || problem.meta.recommend !== RECOMMEND_CHALLENGE) &&
            (globalCache.filters.status_plan || problem.info.status !== STATUS_PLAN) &&
            (globalCache.filters.status_doing || problem.info.status !== STATUS_DOING) &&
            (globalCache.filters.status_done || problem.info.status !== STATUS_DONE) &&
            (globalCache.filters.difficulty_easy || problem.meta.difficulty !== DIFFICULTY_EASY) &&
            (globalCache.filters.difficulty_mid || problem.meta.difficulty !== DIFFICULTY_MEDIUM) &&
            (globalCache.filters.difficulty_hard || problem.meta.difficulty !== DIFFICULTY_HARD) &&
            (problem.tags.some((tag: string) => globalCache.filterTags.includes(tag)))&&
            (globalCache.filterCategorys.includes(problem.category));
    });
    logger.info("cache:" + JSON.stringify(globalCache, null, 2));
    logger.info("result:" + JSON.stringify(filteredProblems, null, 2));
    // 更新 globalCache.tags
    globalCache.problems = filteredProblems;

    const sorted = sortProblems(filteredProblems);


    return sorted;
}

// 新增函数：提炼所有 problems 中的 tags 形成一个不重复的 tags 列表
function getUniqueTags(problems: Problem[]): string[] {
    const tagsSet = new Set<string>();
    problems.forEach(problem => {
        problem.tags.forEach((tag: string) => {
            tagsSet.add(tag);
        });
    });
    return Array.from(tagsSet);
}

// 新增函数：提炼所有 problems 中的 tags 形成一个不重复的 tags 列表
function getUniqueCatagory(problems: Problem[]): string[] {
    const cataSet = new Set<string>();
    problems.forEach(problem => {
        cataSet.add(problem.category);
    });
    return Array.from(cataSet);
}

function sortProblems(problems: Problem[]): Problem[] {
    // 获取排序顺序
    const order = globalCache.filters.order === 'ascending' ? 1 : -1;

    // 定义状态、推荐和难度的排序规则
    const statusOrder: { [key: string]: number } = {
        [STATUS_DONE]: 1,
        [STATUS_DOING]: 2,
        [STATUS_PLAN]: 3
    };

    const recommendOrder: { [key: string]: number } = {
        [RECOMMEND_BASIC]: 1,
        [RECOMMEND_NEED]: 2,
        [RECOMMEND_CHALLENGE]: 3
    };

    const difficultyOrder: { [key: string]: number } = {
        [DIFFICULTY_EASY]: 1,
        [DIFFICULTY_MEDIUM]: 2,
        [DIFFICULTY_HARD]: 3
    };

    // 定义排序规则
    const sortRules = [
        (a: Problem, b: Problem) => {
            const categoryA = statusOrder[a.info.status as keyof typeof statusOrder];
            const categoryB = statusOrder[b.info.status as keyof typeof statusOrder];
            return a.category.localeCompare(b.category);
        },
        (a: Problem, b: Problem) => {
            const statusA = statusOrder[a.info.status as keyof typeof statusOrder];
            const statusB = statusOrder[b.info.status as keyof typeof statusOrder];
            return (statusA - statusB) * order;
        },
        (a: Problem, b: Problem) => {
            const recommendA = recommendOrder[a.meta.recommend as keyof typeof recommendOrder];
            const recommendB = recommendOrder[b.meta.recommend as keyof typeof recommendOrder];
            return (recommendA - recommendB) * order;
        },
        (a: Problem, b: Problem) => {
            const difficultyA = difficultyOrder[a.meta.difficulty as keyof typeof difficultyOrder];
            const difficultyB = difficultyOrder[b.meta.difficulty as keyof typeof difficultyOrder];
            return (difficultyA - difficultyB) * order;
        },
        (a: Problem, b: Problem) => {
            const tagA = a.tags.length > 0 ? a.tags[0] : '';
            const tagB = b.tags.length > 0 ? b.tags[0] : '';
            return tagA.localeCompare(tagB) * order;
        }
    ];

    // 进行排序
    return problems.sort((a, b) => {
        for (const rule of sortRules) {
            const result = rule(a, b);
            if (result !== 0) {
                return result;
            }
        }
        return 0;
    });
}