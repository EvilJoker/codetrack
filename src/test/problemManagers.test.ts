import * as vscode from 'vscode';
import { ProblemDataProvider, loadProblems } from '../problemManager';
import * as path from 'path';
import * as assert from 'assert';

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
        context = { extensionPath: path.resolve(__dirname, '../../problems') } as vscode.ExtensionContext;
        problemDataProvider = new ProblemDataProvider(context);
        const problems = loadProblems(path.resolve(__dirname, '../../problems'));
        assert.ok(problems.length > 0); // 修改: assert.isTrue(problems.length > 0);
        assert.ok(problems[0].hasOwnProperty('name')); // 修改: assert.property(problems[0], 'name');
        assert.ok(problems[0].hasOwnProperty('description')); // 修改: assert.property(problems[0], 'description');
        assert.ok(problems[0].hasOwnProperty('description_zh')); // 修改: assert.property(problems[0], 'description_zh');
        assert.ok(problems[0].hasOwnProperty('meta')); // 修改: assert.property(problems[0], 'meta');
        assert.ok(problems[0].hasOwnProperty('info')); // 修改: assert.property(problems[0], 'info');
        assert.ok(problems[0].hasOwnProperty('tags')); // 修改: assert.property(problems[0], 'tags');
    });

    test('should return default problems if the problems directory does not exist', () => {
        context = { extensionPath: path.resolve(__dirname, '../../nonexistent') } as vscode.ExtensionContext;
        problemDataProvider = new ProblemDataProvider(context);
        const problems = loadProblems(path.resolve(__dirname, '../../nonexistent'));
        assert.strictEqual(problems.length, 5); // 修改: assert.equal(problems.length, 5);
        assert.strictEqual(problems[0].name, '问题1'); // 修改: assert.propertyVal(problems[0], 'name', '问题1');
        assert.strictEqual(problems[0].description, '这是问题1的描述'); // 修改: assert.propertyVal(problems[0], 'description', '这是问题1的描述');
        assert.strictEqual(problems[0].description_zh, '这是问题1的描述'); // 修改: assert.propertyVal(problems[0], 'description_zh', '这是问题1的描述');
        assert.deepStrictEqual(problems[0].meta, { difficulty: '简单', recommend: '初学者' }); // 修改: assert.deepEqual(problems[0].meta, { difficulty: '简单', recommend: '初学者' });
        assert.deepStrictEqual(problems[0].info, { updateTime: '2023-10-01T12:00:00Z', status: '计划' }); // 修改: assert.deepEqual(problems[0].info, { updateTime: '2023-10-01T12:00:00Z', status: '计划' });
        assert.deepStrictEqual(problems[0].tags, ['数组']); // 修改: assert.deepEqual(problems[0].tags, ['数组']);
    });
});