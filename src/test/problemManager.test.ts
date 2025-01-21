import * as vscode from 'vscode';
import { loadProblems } from '../filterView';
import * as path from 'path';
import * as assert from 'assert';
import { DIFFICULTY_EASY, RECOMMEND_BASIC, STATUS_PLAN } from '../infrastructure/constants/constants';
import { ProblemDataProvider } from '../problemManager';
import { globalCache } from '../infrastructure/cache/globalCache';


suite('ProblemManager Tests', () => {
    let context: vscode.ExtensionContext;
    let problemDataProvider: ProblemDataProvider;


    test('should provide the correct tree items', async () => {
        context = { extensionPath: path.resolve(__dirname, '../../problems') } as vscode.ExtensionContext;
        globalCache.isInit=true;
        loadProblems(path.resolve(__dirname, '../../nonexistent'));
        problemDataProvider = new ProblemDataProvider(context);
        const items = await problemDataProvider.getChildren();
        assert.ok(items.length > 0); 
        assert.strictEqual(items[0] instanceof vscode.TreeItem, true); 
    });

    test('should load problems from the problems directory', () => {
        context = { extensionPath: path.resolve(__dirname, '../../src/test/data') } as vscode.ExtensionContext;
        console.log(path.resolve(__dirname, '../../src/test/data') );
        globalCache.isInit=true;
        problemDataProvider = new ProblemDataProvider(context);
        const problems = loadProblems(path.resolve(__dirname, '../../src/test/data') + "/problems");
        assert.strictEqual(problems.length, 1); 
        assert.strictEqual(problems[0].name, 'Two Sum'); 
    });

    test('should return default problems if the problems directory does not exist', () => {
        context = { extensionPath: path.resolve(__dirname, '../../nonexistent') } as vscode.ExtensionContext;
        globalCache.isInit=true;
        problemDataProvider = new ProblemDataProvider(context);
        const problems = loadProblems(path.resolve(__dirname, '../../nonexistent'));
        assert.strictEqual(problems.length, 5);
        assert.strictEqual(problems[0].name, '问题1'); 
        assert.strictEqual(problems[0].description, '这是问题1的描述'); 
        assert.strictEqual(problems[0].description_zh, '这是问题1的描述'); 
        assert.deepStrictEqual(problems[0].meta, { difficulty: DIFFICULTY_EASY, recommend: RECOMMEND_BASIC }); 
        assert.deepStrictEqual(problems[0].info, { updateTime: '2023-10-01T12:00:00Z', status: STATUS_PLAN }); 
        assert.deepStrictEqual(problems[0].tags, ['数组']); 
    });
});

