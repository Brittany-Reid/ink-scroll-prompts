require("mocha");
var assert = require("assert");
//const ink = require("@gnd/ink");
const React = require("react");
const e = React.createElement;
const {render} = require("./../src/patch/ink-testing-library-patch");
const delay = require("delay");
const AutoComplete = require("../src/components/auto-complete");

const ENTER = '\r';
const ARROW_RIGHT = '\u001B[C';

describe("AutoComplete", function () {
    describe("unit tests", function () {
        it("should work with defaults", async function () {
            var element = e(AutoComplete, {});
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should show a complete", async function () {
            var element = e(AutoComplete, {input: "h", completions:["hello", "goodbye"]});
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "\x1B[7me\x1B[27m\x1B[2mllo\x1B[22m";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should show nothing on no matches", async function () {
            var element = e(AutoComplete, {input: "h", completions:["goodbye"]});
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should show nothing when match and word are the same", async function () {
            var element = e(AutoComplete, {input: "hello", completions:["hello"]});
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should be able to select a complete on enter", async function () {
            const onComplete = (match, lastWord) =>{
                var expected = "hello";
                assert.strictEqual(match, expected);
            };
            var element = e(AutoComplete, {input: "h", completions:["hello"], onComplete:onComplete});
            var {unmount, stdin} = render(element);
            await delay(100);
            stdin.write(ENTER);
            await delay(100);
            unmount();
        });
        it("should be able to select a complete on right arrow", async function () {
            const onComplete = (match, lastWord) =>{
                var expected = "hello";
                assert.strictEqual(match, expected);
            };
            var element = e(AutoComplete, {input: "h", completions:["hello"], onComplete:onComplete});
            var {unmount, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_RIGHT);
            await delay(100);
            unmount();
        });
        it("should ignore enter when word is only match", async function () {
            const onComplete = (match, lastWord) =>{
                assert.fail();
            };
            var element = e(AutoComplete, {input: "hello", completions:["hello"], onComplete:onComplete});
            var {unmount, stdin} = render(element);
            await delay(100);
            stdin.write(ENTER);
            await delay(100);
            unmount();
        });
        it("should handle no onComplete function", async function () {
            var element = e(AutoComplete, {input: "h", completions:["hello"]});
            var {unmount, lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ENTER);
            await delay(100);
            var expected = "\x1B[7me\x1B[27m\x1B[2mllo\x1B[22m";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should be able to use custom completes", async function () {
            const complete = () => {
                return "hey";
            };
            var element = e(AutoComplete, {input: "h", complete: complete});
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "\x1B[7me\x1B[27m\x1B[2my\x1B[22m";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
    });
});