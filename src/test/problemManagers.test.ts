import * as vscode from 'vscode';
import { ProblemDataProvider, loadProblems } from '../problemManager';
import * as path from 'path';
import * as assert from 'assert';
import { DIFFICULTY_EASY, RECOMMEND_BASIC, STATUS_PLAN } from '../infrastructure/constants/constants';

suite('ProblemManager Tests', () => {
    let context: vscode.ExtensionContext;
    let problemDataProvider: ProblemDataProvider;


    test('should provide the correct tree items', async () => {
        context = { extensionPath: path.resolve(__dirname, '../../problems') } as vscode.ExtensionContext;
        problemDataProvider = new ProblemDataProvider(context);
        const items = await problemDataProvider.getChildren();
        assert.ok(items.length > 0); // 修改: assert.isTrue(items.length > 0);
        assert.strictEqual(items[0] instanceof vscode.TreeItem, true); // 修改: assert.instanceOf(items[0], vscode.TreeItem);
    });

    test('should load problems from the problems directory', () => {
        context = { extensionPath: path.resolve(__dirname, '../../src/test/data') } as vscode.ExtensionContext;
        // console.log(path.resolve(__dirname, '../../src/test/data') );
        problemDataProvider = new ProblemDataProvider(context);
        const problems = loadProblems(path.resolve(__dirname, '../../src/test/data'));
        assert.strictEqual(problems.length, 1); // 修改: assert.equal(problems.length, 5);
        assert.strictEqual(problems[0].name, 'Two Sum'); // 修改: assert.propertyVal(problems[0], 'name', '问题1')
    });

    test('should return default problems if the problems directory does not exist', () => {
        context = { extensionPath: path.resolve(__dirname, '../../nonexistent') } as vscode.ExtensionContext;
        problemDataProvider = new ProblemDataProvider(context);
        const problems = loadProblems(path.resolve(__dirname, '../../nonexistent'));
        assert.strictEqual(problems.length, 5); // 修改: assert.equal(problems.length, 5);
        assert.strictEqual(problems[0].name, '问题1'); // 修改: assert.propertyVal(problems[0], 'name', '问题1');
        assert.strictEqual(problems[0].description, '这是问题1的描述'); // 修改: assert.propertyVal(problems[0], 'description', '这是问题1的描述');
        assert.strictEqual(problems[0].description_zh, '这是问题1的描述'); // 修改: assert.propertyVal(problems[0], 'description_zh', '这是问题1的描述');
        assert.deepStrictEqual(problems[0].meta, { difficulty: DIFFICULTY_EASY, recommend: RECOMMEND_BASIC }); // 修改: assert.deepEqual(problems[0].meta, { difficulty: '简单', recommend: '初学者' });
        assert.deepStrictEqual(problems[0].info, { updateTime: '2023-10-01T12:00:00Z', status: STATUS_PLAN }); // 修改: assert.deepEqual(problems[0].info, { updateTime: '2023-10-01T12:00:00Z', status: '计划' });
        assert.deepStrictEqual(problems[0].tags, ['数组']); // 修改: assert.deepEqual(problems[0].tags, ['数组']);
    });
});