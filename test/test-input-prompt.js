require("mocha");
var assert = require("assert");
const React = require("react");
//const ink = require("@gnd/ink");
const { InputPrompt, HandledInputPrompt } = require("../src/components/input-prompt");
const e = React.createElement;
const delay = require("delay");
const {render} = require("../src/patch/ink-testing-library-patch");
const chalk = require("chalk");

describe("InputPrompt", function () {
    describe("unit tests", function () {
        it("should work with default options", function () {
            var element = e(InputPrompt, {});
            const {lastFrame} = render(element);
            const expected = '> \x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to set a prompt", function () {
            var element = e(InputPrompt, {prefix: "NAME", message: "[]"});
            const {lastFrame} = render(element);
            const expected = '\x1B[36mNAME \x1B[39m\x1B[1m[] \x1B[22m> \x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to have a footer", async function () {
            var element = e(InputPrompt, {footer:true, width: 5});
            const {lastFrame} = render(element);
            const expected = '> \x1B[7m \x1B[27m\n\x1B[46m     \x1B[49m';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to set text color", function () {
            var element = e(InputPrompt, {initialInput: "abcdef", color: "green"});
            const {lastFrame} = render(element);
            //<green>> </green><green>abcdef<cursor></green>
            const expected = '\x1B[32m> \x1B[39m\x1B[32mabcdef\x1B[7m \x1B[27m\x1B[39m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to set accent color", async function () {
            var element = e(InputPrompt, {accentColor: "green", footer:true, width: 10});
            const {lastFrame} = render(element);
            await delay(100);
            const expected = '> \x1B[7m \x1B[27m\n\x1B[42m          \x1B[49m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should not display completion straight away", async function () {
            var element = e(InputPrompt, {initialInput: "h", completions: ["hello"]});
            const {lastFrame} = render(element);
            await delay(100);
            const expected = '> h\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to transform text", async function () {
            const transform = (input) => {
                return chalk.red(input);
            }
            var element = e(InputPrompt, {initialInput: "hello", transform: transform});
            const {lastFrame} = render(element);
            await delay(100);
            const expected = '> \x1B[31mhello\x1B[39m\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
    });
    describe("input handling", function () {
        it("should be able to show completion", async function () {
            var element = e(HandledInputPrompt, {initialInput: "", completions: ["hello"]});
            const {lastFrame, stdin, unmount} = render(element);
            await delay(100);
            stdin.write("h");
            await delay(100);

            const expected = '> h\x1B[7me\x1B[27m\x1B[2mllo\x1B[22m';
            assert.strictEqual(lastFrame(), expected);

            unmount();
        
        });
        it("should be able to have custom completion that changes capitalization", async function () {
            const complete = () => {
                return "Hello";
            }
            var element = e(HandledInputPrompt, {initialInput: "", complete: complete});
            const {lastFrame, stdin, unmount} = render(element);
            await delay(100);
            stdin.write("h");
            await delay(100);
            stdin.write("\r");
            await delay(100);

            const expected = '> Hello\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);

            unmount();
        });
        it("should be able to show suggestions", async function () {
            var element = e(HandledInputPrompt, {initialInput: "", suggestions: [{label:"hello"}, {label: "hey"}]});
            const {lastFrame, stdin, unmount} = render(element);
            await delay(100);
            stdin.write("\t");
            await delay(100);
            stdin.write("h");
            await delay(100);

            const expected = '> h\x1B[7m \x1B[27m\n' +
            '  \x1B[46m\x1B[37mhello\x1B[39m\x1B[49m\x1B[46m  \x1B[49m\n' +
            '  \x1B[100mhey\x1B[49m\x1B[100m    \x1B[49m\n'
            '> h\x1B[7me\x1B[27m\x1B[2mllo\x1B[22m'
            assert.strictEqual(lastFrame(), expected);

            unmount();
        
        });
        it("should be able to supply custom suggestion filter", async function () {
            const suggest = () => {
                return [{label: "Hello"}]
            }
            var element = e(HandledInputPrompt, {initialInput: "", suggestions: ["hello"], suggest: suggest});
            const {lastFrame, stdin, unmount} = render(element);
            await delay(100);
            stdin.write("\t");
            await delay(100);
            stdin.write("h");
            await delay(100);

            const expected = '> h\x1B[7m \x1B[27m\n  \x1B[46m\x1B[37mHello\x1B[39m\x1B[49m\x1B[46m  \x1B[49m\n\n'
            assert.strictEqual(lastFrame(), expected);

            unmount();
        
        });
    });
});