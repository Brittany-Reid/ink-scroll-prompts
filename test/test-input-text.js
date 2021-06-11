require("mocha");
var assert = require("assert");
const React = require("react");
const e = React.createElement;
const {render} = require("../src/patch/ink-testing-library-patch");
const InputText = require("../src/components/input-text");
const chalk = require("chalk");

describe("InputText", function () {
    describe("unit tests", function () {
        it("should work with default options", function () {
            var element = e(InputText, {});
            const {lastFrame} = render(element);
            //cursor
            const expected = '\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should display some text", function () {
            var element = e(InputText, {text: "abcde"});
            const {lastFrame} = render(element);
            //cursor
            const expected = '\x1B[7ma\x1B[27mbcde';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to hide cursor", function () {
            var element = e(InputText, {text: "abcde", showCursor: false});
            const {lastFrame} = render(element);
            //cursor
            const expected = 'abcde';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to transform text", function () {
            var element = e(InputText, {text: "abcde", transform: (text)=>{
                return chalk.red(text);
            }});
            const {lastFrame} = render(element);
            //cursor
            const expected = '\x1B[7ma\x1B[27m\x1B[31mbcde\x1B[39m';
            assert.strictEqual(lastFrame(), expected);
        });
    });
});