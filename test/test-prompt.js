require("mocha");
var assert = require("assert");
const React = require("react");
const e = React.createElement;
const {render} = require("./../src/patch/ink-testing-library-patch");
const Prompt = require("../src/components/prompt");

describe("Prompt", function () {
    describe("unit tests", function () {
        it("should display default prompt", function () {
            var element = e(Prompt, {});
            var {lastFrame} = render(element);
            const expected = ">";
            assert.strictEqual(lastFrame(), expected);
        })
        it("should have styled prefix and message", function () {
            var element = e(Prompt, {prefix: "NAME", message:"[opts]"});
            var {lastFrame} = render(element);
            const expected = "\x1B[36mNAME \x1B[39m\x1B[1m[opts] \x1B[22m>";
            assert.strictEqual(lastFrame(), expected);
        })
        it("should lose colour on dim", function () {
            var element = e(Prompt, {prefix: "NAME", message:"[opts]", dimColor:true});
            var {lastFrame} = render(element);
            const expected = "\x1B[2mNAME \x1B[1m[opts] \x1B[22m\x1B[2m> \x1B[22m";
            assert.strictEqual(lastFrame(), expected);
        })
    })
})