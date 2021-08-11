require("mocha");
var assert = require("assert");
const React = require("react");
const e = React.createElement;
const {render} = require("./../src/patch/ink-testing-library-patch");
const { ScrollMenu } = require("../src/components/scroll-menu");
const delay = require("delay");

const ENTER = '\r';
const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ESC = "\u001B";

describe("ScrollMenu", function () {
    describe("unit tests", function () {
        it("should work with default settings", async function () {
            var element = e(ScrollMenu, {});
            var {lastFrame, unmount, stdin} = render(element);
            
            //enter with no select function doesnt crash
            stdin.write(ENTER);
            await delay(100);

            assert.strictEqual(lastFrame(), "")
            await delay(100);
            unmount();
        });
        it("should display options with one selected", async function(){
            var items = [
                {label: "a"},
                {label: "b"},
            ]
            var element = e(ScrollMenu, {items:items});
            var {lastFrame, unmount} = render(element);
            assert.strictEqual(lastFrame(), "\x1B[36ma\x1B[39m\nb")
            await delay(100);
            unmount();
        });
        it("should handle cancel on escape", async function(){
            var called = false;
            const onCancel = async (item) =>{
                called = true;
                assert.strictEqual(item.label, "a")
                await delay(100);
                unmount();
            }

            var items = [
                {label: "a"},
                {label: "b"},
            ]
            var element = e(ScrollMenu, {items:items, onCancel:onCancel});
            var {unmount, stdin} = render(element);
            stdin.write(ESC);
            await delay(100);
            assert(called);
        });
        it("should select item on enter", async function(){
            const onSelect = async (item) =>{
                assert.strictEqual(item.label, "a")
                await delay(100);
                unmount();
            }

            var items = [
                {label: "a"},
                {label: "b"},
            ]
            var element = e(ScrollMenu, {items:items, onSelect:onSelect});
            var {unmount, stdin} = render(element);
            stdin.write(ENTER);
        });
        it("should allow select next item with arrow down", async function(){
            var items = [
                {label: "a"},
                {label: "b"},
            ]
            var element = e(ScrollMenu, {items:items});
            var {unmount, stdin, lastFrame} = render(element);
            stdin.write(ARROW_DOWN);
            await delay(100);
            assert.strictEqual(lastFrame(), "a\n\x1B[36mb\x1B[39m")
            await delay(100);
            unmount();
        });
        it("should allow select prev item with arrow up", async function(){
            var items = [
                {label: "a"},
                {label: "b"},
            ]
            var element = e(ScrollMenu, {items:items});
            var {unmount, stdin, lastFrame} = render(element);
            stdin.write(ARROW_DOWN);
            await delay(100);
            stdin.write(ARROW_UP);
            await delay(100);
            assert.strictEqual(lastFrame(), "\x1B[36ma\x1B[39m\nb")
            await delay(100);
            unmount();
        });
        it("should return to start if next on last", async function(){
            var items = [
                {label: "a"},
                {label: "b"},
            ]
            var element = e(ScrollMenu, {items:items});
            var {unmount, stdin, lastFrame} = render(element);
            stdin.write(ARROW_DOWN);
            await delay(100);
            stdin.write(ARROW_DOWN);
            await delay(100);
            assert.strictEqual(lastFrame(), "\x1B[36ma\x1B[39m\nb")
            await delay(100);
            unmount();
        });
        it("should return to end if prev on first", async function(){
            var items = [
                {label: "a"},
                {label: "b"},
            ]
            var element = e(ScrollMenu, {items:items});
            var {unmount, stdin, lastFrame} = render(element);
            stdin.write(ARROW_UP);
            await delay(100);
            assert.strictEqual(lastFrame(), "a\n\x1B[36mb\x1B[39m")
            await delay(100);
            unmount();
        });
        it("should scroll if selected is hidden", async function(){
            var items = [
                {label: "a"},
                {label: "b"},
                {label: "c"}
            ]
            var element = e(ScrollMenu, {items:items, height:2, width: 4});
            var {unmount, stdin, lastFrame} = render(element);
            stdin.write(ARROW_UP);
            await delay(100);
            const expected = "b\n\x1B[36mc\x1B[39m  \x1B[47m \x1B[49m"
            assert.strictEqual(lastFrame(), expected)
            await delay(100);
            unmount();
        });
    });
});