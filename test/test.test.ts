const assert = require('assert').strict;

describe("Environment test", () => {
    it("just checking test environment", () => {
        const test = 1;
        assert.ok(test, "Test is not ok");
        assert.throws(() => {
            throw new Error("Test error");
        }, "Not throws error");
    });
});
