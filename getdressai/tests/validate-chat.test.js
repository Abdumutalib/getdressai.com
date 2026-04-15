import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateChatCompletionsBody } from "../api/validate-chat.js";

describe("validateChatCompletionsBody", () => {
  test("accepts valid minimal chat body", () => {
    const err = validateChatCompletionsBody({
      model: "mistralai/mixtral-8x7b",
      messages: [{ role: "user", content: "Hello" }],
    });
    assert.equal(err, null);
  });

  test("rejects null body", () => {
    assert.ok(validateChatCompletionsBody(null));
  });

  test("rejects empty messages", () => {
    const err = validateChatCompletionsBody({
      messages: [],
    });
    assert.ok(err);
  });

  test("rejects invalid message role", () => {
    const err = validateChatCompletionsBody({
      messages: [{ role: "system", content: "x" }],
    });
    assert.equal(err, null);
    const err2 = validateChatCompletionsBody({
      messages: [{ role: "invalid", content: "x" }],
    });
    assert.ok(err2);
  });

  test("rejects oversized model id", () => {
    const err = validateChatCompletionsBody({
      model: "x".repeat(200),
      messages: [{ role: "user", content: "hi" }],
    });
    assert.ok(err);
  });
});
