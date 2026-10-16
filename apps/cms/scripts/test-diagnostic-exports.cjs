const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const { queryParams: { createTransformer } } = require('@strapi/utils');

function loadService(name, strapi) {
  const filename = path.join(__dirname, `../src/api/${name}/services/${name}.ts`);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: () => ({ factories: { createCoreService: (_uid, factory) => factory({ strapi }) } }),
  });
  return exports.default;
}

for (const name of ['diagnostic-submission', 'hr-diagnostic-submission']) {
  for (const count of [0, 1, 99, 100, 101, 141, 200, 372]) {
    test(`${name}: exports ${count} results exactly once`, async () => {
      const records = Array.from({ length: count }, (_, id) => ({
        id, email: `respondent-${id}@example.test`, submittedAt: '2026-10-16T07:00:00Z',
        answers: [],
      }));
      const schema = { attributes: { submittedAt: { type: 'datetime' } } };
      const transformer = createTransformer({ getModel: () => schema });
      let calls = 0;
      const strapi = {
        documents: () => ({
          findFirst: async () => ({ slug: 'test', test: { questions: [] } }),
          findMany: async (params) => {
            assert.ok(++calls <= Math.floor(count / 100) + 1, 'export must terminate');
            // Use the installed Strapi transformer, which ignores nested pagination.
            const query = transformer.transformQueryParams('test', params);
            assert.equal(query.offset, (calls - 1) * 100);
            assert.equal(query.limit, 100);
            assert.deepEqual(JSON.parse(JSON.stringify(query.orderBy)), [
              { submittedAt: 'desc' }, { id: 'desc' },
            ]);
            assert.equal(params.filters.submittedAt.$gte, '2026-10-01T00:00:00.000Z');
            if (name === 'diagnostic-submission') {
              assert.equal(params.filters.campaign.documentId.$eq, 'campaign-id');
              assert.equal(params.populate.answers, true);
            }
            return records.slice(query.offset, query.offset + query.limit);
          },
        }),
        service: () => ({ findBySlug: async () => ({ groups: [] }) }),
      };
      const service = loadService(name, strapi);
      const input = { campaignDocumentId: 'campaign-id', from: '2026-10-01' };
      const result = name === 'diagnostic-submission'
        ? await service.exportCampaignCsv(input)
        : await service.exportHrCsv(input);
      const rows = result.csv.trimStart().split('\n');
      assert.equal(rows.length, count + 1);
      assert.equal(new Set(rows.slice(1)).size, count);
      assert.equal(calls, Math.floor(count / 100) + 1);
    });
  }
}
