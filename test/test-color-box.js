require("mocha");
var assert = require("assert");
const ink = require("@gnd/ink");
const React = require("react");
const e = React.createElement;
const {render} = require("./../src/patch/ink-testing-library-patch");
const { ColorBox } = require("..");
const delay = require("delay");
const chalk = require("chalk");

describe("ColorBox", function () {
    describe("unit tests", function () {
        it("should fill fixed width/height", function () {
            var box = e(ColorBox, {
                width: 1,
                height: 1,
                backgroundColor: "white",
            });
            const {lastFrame} = render(box);
            const expected = "\x1B[47m \x1B[49m";
            assert.strictEqual(lastFrame(), expected);
        });
        it("should not fill with no backgroundColor prop", function () {
            var box = e(ColorBox, {width: 1, height: 1});
            const {lastFrame} = render(box);
            const expected = "";
            assert.strictEqual(lastFrame(), expected);
        });
        it("should fill percent width", async function () {
            var box = e(ColorBox, {
                width: "2%",
                height: 1,
                backgroundColor: "white",
            });
            const {lastFrame} = render(box);
            await delay(100); //need to wait measure time
            const expected = "\x1B[47m  \x1B[49m";
            assert.strictEqual(lastFrame(), expected);
        });
        it("should fill percent height", async function () {
            var box = e(
                ink.Box, {height: 2}, e(ColorBox, {
                    width: 1,
                    height: "100%",
                    backgroundColor: "white",
                })
            );
            const {lastFrame} = render(box);
            await delay(100); //need to wait measure time
            const expected = "\x1B[47m \x1B[49m\n\x1B[47m \x1B[49m";
            assert.strictEqual(lastFrame(), expected);
        });
        it("should work with border", async function () {
            var box = e(ColorBox, {
                width: 3,
                height: 3,
                borderStyle: "single",
                backgroundColor: "white",
            });
            const {lastFrame} = render(box);
            await delay(100); //need to wait measure time
            const expected = "┌─┐\n│\x1B[47m \x1B[49m│\n└─┘";
            assert.strictEqual(lastFrame(), expected);
        });
        it("should fill based on child height", async function () {
            var box = e(
                ColorBox, {backgroundColor: "white", width: 1}, e(ink.Box, {height: 2})
            );
            const {lastFrame} = render(box);
            await delay(100); //need to wait measure time
            const expected = "\x1B[47m \x1B[49m\n\x1B[47m \x1B[49m";
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to change color from none", async function () {
            var box = ({...props}) => {
                const [backgroundColor, setBackgroundColor] = React.useState(undefined);
                React.useEffect(()=>{
                    setTimeout(()=>{
                        setBackgroundColor("cyan")
                    }, 1000)
                }, [])
                return e(ColorBox, {height:1, width: 1, backgroundColor:backgroundColor});
            }
            var element = e(box, {});
            const {frames} = render(element);
            await delay(1100); //wait for color change
            assert.strictEqual(frames[0], "");
            assert.strictEqual(frames[1], chalk.bgCyan(" "));
            // assert.strictEqual(lastFrame(), expected);
        });
    });
});