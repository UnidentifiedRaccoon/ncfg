import assert from "node:assert/strict";
import test from "node:test";

import { buildBitrix24LeadAddPayload } from "./contact-sink";

test("buildBitrix24LeadAddPayload maps website lead fields to Bitrix24 lead", () => {
  const payload = buildBitrix24LeadAddPayload(
    {
      name: "Иван Петров",
      email: "ivan@example.com",
      phone: "+79990000000",
      company: "NCFG",
      message: "Хочу консультацию",
      sourcePageUrl: "https://ncfg.ru/#lead-form",
    },
    {
      requestId: "req-123",
      clientIp: "203.0.113.10",
      userAgent: "Unit Test Agent",
    },
    {
      webhookUrl: "https://example.bitrix24.ru/rest/1/token/",
      sourceId: "WEB",
      stageId: "10",
      title: "Заявка с сайта NCFG",
      originatorId: "ncfg-website",
      assignedById: 367,
    }
  );

  assert.equal(payload.entityTypeId, 1);
  assert.deepEqual(payload.fields.fm, [
    { typeId: "EMAIL", valueType: "WORK", value: "ivan@example.com" },
    { typeId: "PHONE", valueType: "WORK", value: "+79990000000" },
  ]);
  assert.equal(payload.fields.title, "Заявка с сайта NCFG");
  assert.equal(payload.fields.name, "Иван Петров");
  assert.equal(payload.fields.companyTitle, "NCFG");
  assert.equal(payload.fields.sourceId, "WEB");
  assert.equal(payload.fields.stageId, "10");
  assert.equal(payload.fields.opened, "Y");
  assert.equal(payload.fields.originatorId, "ncfg-website");
  assert.equal(payload.fields.originId, "req-123");
  assert.equal(payload.fields.assignedById, 367);
  assert.equal(payload.fields.ufCrmFormname, "lead");
  assert.equal(payload.fields.ufCrmTranid, "req-123");
  assert.match(payload.fields.comments, /Форма: Заявка с сайта/);
  assert.match(payload.fields.comments, /Сообщение: Хочу консультацию/);
  assert.match(payload.fields.comments, /Страница: https:\/\/ncfg\.ru\/#lead-form/);
  assert.match(payload.fields.comments, /Request ID: req-123/);
});

test("buildBitrix24LeadAddPayload omits phone multifield when it is absent", () => {
  const payload = buildBitrix24LeadAddPayload(
    {
      name: "Иван Петров",
      email: "ivan@example.com",
    },
    {
      requestId: "req-124",
      clientIp: "203.0.113.10",
    },
    {
      webhookUrl: "https://example.bitrix24.ru/rest/1/token/",
      sourceId: "WEB",
      stageId: "10",
      title: "Заявка с сайта NCFG",
      originatorId: "ncfg-website",
    }
  );

  assert.deepEqual(payload.fields.fm, [
    { typeId: "EMAIL", valueType: "WORK", value: "ivan@example.com" },
  ]);
  assert.match(payload.fields.comments, /Телефон: не указан/);
  assert.match(payload.fields.comments, /User-Agent: не указан/);
});
