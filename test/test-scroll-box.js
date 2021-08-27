require("mocha");
var assert = require("assert");
const React = require("react");
const ink = require("@gnd/ink");
const e = React.createElement;
const delay = require("delay");
const {render} = require("./../src/patch/ink-testing-library-patch");
const { ScrollBox, HandledScrollBox } = require("../src/components/scrollbox");
const {press, keys} = require("../src/test-utils");

var contents = e(ink.Box, {flexDirection:"column", width:7, height:6}, 
    e(ink.Box, {borderStyle:"single", height:3, width:7}, 
        e(ink.Text, {}, "Box 1")
    ),
    e(ink.Box, {borderStyle:"single", height:3, width:7}, 
        e(ink.Text, {}, "Box 2")
    ),
)

describe("ScrollBox", function () {
    describe("options", function () {
        it("should handle default options", function () {
            var element = e(ScrollBox, {}, contents);
            var {lastFrame} = render(element);
            //display all of 2 boxes
            const expected = "┌─────┐\n│Box 1│\n└─────┘\n┌─────┐\n│Box 2│\n└─────┘";
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to turn off arrows", async function () {
            var element = e(ScrollBox, {width: 6, height: 5, arrows:false}, contents);
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = '┌────\x1B[47m \x1B[49m\n│Box \x1B[47m \x1B[49m\n└────\x1B[47m \x1B[49m\n┌────\n\x1B[47m   \x1B[49m';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to turn off scrollbars", async function () {
            var element = e(ScrollBox, {width: 6, height: 3, overflow:"hidden"}, contents);
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = '┌─────\n│Box 1\n└─────';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to change scrollbar color", async function () {
            var element = e(ScrollBox, {width: 6, height: 3, scrollbarColor: "green"}, contents);
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = '┌────\x1B[32m▲\x1B[39m\n' +
            '│Box \x1B[42m \x1B[49m\n' +
            '\x1B[32m◀ \x1B[39m\x1B[42m \x1B[49m\x1B[32m ▶\x1B[39m\x1B[32m▼\x1B[39m';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should show scrollbars always", async function () {
            var element = e(ScrollBox, {width: 6, height: 3, overflow: "scroll"});
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = '     \x1B[37m▲\x1B[39m\n' +
            '     \x1B[47m \x1B[49m\n' +
            '\x1B[37m◀ \x1B[39m\x1B[47m \x1B[49m\x1B[37m ▶\x1B[39m\x1B[37m▼\x1B[39m'
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should hide x axis scroll", async function () {
            var element = e(ScrollBox, {width: 6, height: 3, overflowX: "hidden"}, contents);
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = "┌────\x1B[37m▲\x1B[39m\n│Box \x1B[47m \x1B[49m\n└────\x1B[37m▼\x1B[39m";
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should hide y axis scroll", async function () {
            var element = e(ScrollBox, {width: 6, height: 3, overflowY: "hidden"}, contents);
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = "┌─────\n│Box 1\n\x1B[37m◀ \x1B[39m\x1B[47m \x1B[49m \x1B[37m ▶\x1B[39m";
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should use minHeight", async function () {
            var element = e(ink.Box, {},
                e(ScrollBox, {minHeight:5, width:1}, 
                    e(ink.Text, {}, "A")),
            );
            var {lastFrame} = render(element);
            const expected = 'A\n\n\n\n';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should use minWidth", async function () {
            var element = e(ink.Box, {},
                e(ScrollBox, {minWidth:5}, 
                    e(ink.Text, {}, "A")),
                e(ink.Text, {}, "B")
            );
            var {lastFrame} = render(element);
            const expected = 'A    B';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should respect minheight when maxheight also set", async function () {
            var element = e(ink.Box, {},
                e(ScrollBox, {minHeight:5, maxHeight:10, width:1}, 
                    e(ink.Text, {}, "A")),
            );
            var {lastFrame} = render(element);
            const expected = 'A\n\n\n\n';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should respect minwidth when maxwidth also set", async function () {
            var element = e(ink.Box, {},
                e(ScrollBox, {minWidth:5, maxWidth:10}, 
                    e(ink.Text, {}, "A")),
                e(ink.Text, {}, "B")
            );
            var {lastFrame} = render(element);
            const expected = 'A    B';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should grow height if a maxHeight was set", async function () {
            var element = e(ink.Box, {},
                e(ScrollBox, {minHeight:1, maxHeight:3, width:1, overflow:"hidden"}, 
                    e(ink.Text, {}, "AAAAA")),
            );
            var {lastFrame} = render(element);
            const expected = 'A\nA\nA';
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        //not implemented yet
        // it("should grow width if a maxWidth was set", async function () {
        //     var element = e(ink.Box, {},
        //         e(ScrollBox, {height:1, maxWidth:3, overflow:"hidden"}, 
        //             e(ink.Text, {}, "AAAAA")),
        //     );
        //     var {lastFrame} = render(element);
        //     const expected = 'AAA';
        //     await delay(100);
        //     assert.strictEqual(lastFrame(), expected);
        // });
    });
    describe("auto scrollbars", function () {
        it("should display scrollbars when contents too big", async function () {
            var element = e(ScrollBox, {width: 6, height: 5}, contents);
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = '┌────\x1B[37m▲\x1B[39m\n' +
            '│Box \x1B[47m \x1B[49m\n' +
            '└────\x1B[47m \x1B[49m\n' +
            '┌────\n' +
            '\x1B[37m◀ \x1B[39m\x1B[47m \x1B[49m\x1B[37m ▶\x1B[39m\x1B[37m▼\x1B[39m'
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should display x scrollbar when width too big", async function () {
            var element = e(ScrollBox, {width: 6, height: 7}, contents);
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = '┌─────\n' +
            '│Box 1\n' +
            '└─────\n' +
            '┌─────\n' +
            '│Box 2\n' +
            '└─────\n' +
            '\x1B[37m◀ \x1B[39m\x1B[47m \x1B[49m \x1B[37m ▶\x1B[39m'
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should display y scrollbar when height too big", async function () {
            var element = e(ScrollBox, {width: 8, height: 5}, contents);
            var {lastFrame} = render(element);
            //cut off with right scrollbar bottom arrows
            const expected = '┌─────┐\x1B[37m▲\x1B[39m\n' +
            '│Box 1│\x1B[47m \x1B[49m\n' +
            '└─────┘\x1B[47m \x1B[49m\n' +
            '┌─────┐\n' +
            '│Box 2│\x1B[37m▼\x1B[39m'
            await delay(100);
            assert.strictEqual(lastFrame(), expected);
        });
    });
    describe("input handling", function(){
        it("should be able to move with arrow keys", async function(){
            var element = e(HandledScrollBox, {width: 6, height: 2, arrows: false},
                e(ink.Box, {width: 7}, 
                    e(ink.Text, {}, "AAABBBC")
                )
            )
            var app = render(element);
            await delay(100);
            assert.strictEqual(app.lastFrame(), "AAABBB\n\x1B[47m     \x1B[49m");
            await press(keys.ARROW_RIGHT, app);
            await delay(100);
            assert.strictEqual(app.lastFrame(), "AABBBC\n \x1B[47m     \x1B[49m");
        })
    });
});