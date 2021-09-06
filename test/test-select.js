require("mocha");
const assert = require("assert")
const delay = require("delay");
const Select = require("../src/prompts/select");
const {render} = require("../src/patch/ink-testing-library-patch");
const {press, keys} = require("../src/test-utils")

describe("Select", function(){
    var items = ["a1", "a2", "a3"];

    describe("unit tests", function(){
        it("items are listed", async function(){
            var prompt = new Select({items: items});
            prompt.render = render;
            prompt.run();
            await delay(100);
            prompt.app.unmount();
            var lines = prompt.app.lastFrame().split("\n");
            assert.strictEqual(lines[0], "\x1B[36m◉ \x1B[4ma1\x1B[24m\x1B[39m");
            assert.strictEqual(lines[1], "◯ a2");
            assert.strictEqual(lines[2], "◯ a3");
        });
        it("can select an item", async function(){
            var prompt = new Select({items: items});
            prompt.render = render;
            var result = prompt.run();
            var app = prompt.app;
            await press(keys.ENTER, app);
            app.unmount();
            result = await result;
            assert.strictEqual(result, "a1");
            assert.strictEqual(app.lastFrame(), "\x1B[36m◉ \x1B[4ma1\x1B[24m\x1B[39m")
        });
        it("should cancel on escape", async function(){
            var prompt = new Select({items: items});
            prompt.render = render;
            assert.rejects(prompt.run());
            var app = prompt.app;
            await press(keys.ESC, app);
            app.unmount();
            assert.strictEqual(app.lastFrame(), "\x1B[36m\x1B[2m◉ \x1B[4ma1\x1B[24m\x1B[22m\x1B[39m\n\x1B[2m◯ a2\x1B[22m\n\x1B[2m◯ a3\x1B[22m") //is dimmed
        });
        it("can scroll", async function(){
            var prompt = new Select({items: items});
            prompt.render = render;
            prompt.run();
            var app = prompt.app;
            await delay(100);
            app.stdout.rows = 2;
            await delay(100);
            app.unmount();
            assert(app.lastFrame().endsWith("\x1B[47m \x1B[49m"))
        });
        it("can have message", async function(){
            var prompt = new Select({items: items, message: "Select?"});
            prompt.render = render;
            prompt.run();
            var app = prompt.app;
            await delay(100);
            app.unmount();
            var lines = app.lastFrame().split("\n")
            assert.strictEqual(lines[0], "Select?")
        });
    });
});