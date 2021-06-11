require("mocha");
var assert = require("assert");
// const ink = require("@gnd/ink");
const React = require("react");
const { SuggestionBox } = require("../src/components/suggestion-box");
const {render} = require("./../src/patch/ink-testing-library-patch");
const delay = require("delay");
const e = React.createElement;

describe("SuggestionBox", function () {
    describe("Unit tests", async function(){
        it("should work with default settings", async function(){
            var element = e(SuggestionBox, {});
            const {lastFrame, unmount} = render(element);
            const expected = "";
            await delay(100);

            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should work with object suggestions", async function(){
            var element = e(SuggestionBox, {suggestions: [{label: "a"}, {label : "b"}]});
            const {lastFrame, unmount} = render(element);
            const expected = "\x1B[46m\x1B[37ma\x1B[39m\x1B[49m\x1B[46m  \x1B[49m\n\x1B[100mb\x1B[49m\x1B[100m  \x1B[49m";
            await delay(100);

            assert.strictEqual(lastFrame(), expected);
            unmount();
        })
        it("should work list of strings", async function(){
            var element = e(SuggestionBox, {suggestions: ["a", "b"]});
            const {lastFrame, unmount} = render(element);
            const expected = "\x1B[46m\x1B[37ma\x1B[39m\x1B[49m\x1B[46m  \x1B[49m\n\x1B[100mb\x1B[49m\x1B[100m  \x1B[49m";
            await delay(100);

            assert.strictEqual(lastFrame(), expected);
            unmount();
        })
        it("should display none on unmatched query", async function(){
            var element = e(SuggestionBox, {query: "c", suggestions: [{label: "a"}, {label : "b"}]});
            const {lastFrame} = render(element);
            const expected = "";
            await delay(100);

            assert.strictEqual(lastFrame(), expected);
        })
    });
});