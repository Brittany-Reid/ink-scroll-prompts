require("mocha");
var assert = require("assert");
const ink = require("@gnd/ink");
const React = require("react");
const e = React.createElement;
const {render} = require("../src/patch/ink-testing-library-patch");
const { InputBox, HandledInputBox } = require("../src/components/input-box");
const delay = require("delay");
const Prompt = require("../src/components/prompt");
const chalk = require("chalk");

const ENTER = '\r';
const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ARROW_LEFT = '\u001B[D';
const ARROW_RIGHT = '\u001B[C';
const DELETE = '\u007F';
const CTRLU = "\x15";
const CTRLW = "\x17";
const CTRLE = "\x05";
const CTRLA = "\x01";

describe("InputBox", function () {
    describe("unit tests", function () {
        it("should work with default options", function () {
            var element = e(InputBox, {});
            const {lastFrame} = render(element);
            //cursor
            const expected = '\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should display initial text", function () {
            var element = e(InputBox, {initialInput: "Hello world."});
            const {lastFrame} = render(element);
            //hello world + cursor
            const expected = 'Hello world.\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to transform text", function () {
            const transform = (input) =>{
                return chalk.red(input);
            }
            var element = e(InputBox, {initialInput: "Hello world.", transform: transform});
            const {lastFrame} = render(element);
            //hello world + cursor
            const expected = '\x1B[31mHello world.\x1B[39m\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should display dimmed placeholder", function () {
            var element = e(InputBox, {placeholder: "Type here..."});
            const {lastFrame} = render(element);
            //'Type here...' with cursor at pos 0
            const expected = '\x1B[7mT\x1B[27m\x1B[2mype here...\x1B[22m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should remove newlines if disable newlines", function () {
            var element = e(InputBox, {initialInput: "a\nb", multiline:false, disableNewlines:true});
            const {lastFrame} = render(element);
            //'Type here...' with cursor at pos 0
            const expected = 'ab\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to hide cursor", function () {
            var element = e(InputBox, {initialInput: "abcde", showCursor: false});
            const {lastFrame} = render(element);
            //'Type here...' with cursor at pos 0
            const expected = 'abcde';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to change text color", function () {
            var element = e(InputBox, {initialInput: "abcde", color: "red"});
            const {lastFrame} = render(element);
            //'Type here...' with cursor at pos 0
            const expected = '\x1B[31mabcde\x1B[7m \x1B[27m\x1B[39m';
            assert.strictEqual(lastFrame(), expected);
        });
    });
    describe("input handling", function () {
        it("should allow append single char", async function () {
            var element = e(HandledInputBox, {});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write("a")
            await delay(100);
            //a + cursor
            const expected = 'a\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move cursor backwards", async function () {
            var element = e(HandledInputBox, {initialInput: "ab"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            //cursor + ab
            const expected = '\x1B[7ma\x1B[27mb';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should not be able to move past pos 0", async function () {
            var element = e(HandledInputBox, {});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            //cursor + ab
            const expected = '\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move cursor forward", async function () {
            var element = e(HandledInputBox, {initialInput: "ab"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(ARROW_RIGHT)
            await delay(100);
            //a + cursor + b
            const expected = 'a\x1B[7mb\x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should not be able to move past input length", async function () {
            var element = e(HandledInputBox, {});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_RIGHT)
            await delay(100);
            //cursor + ab
            const expected = '\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move cursor up", async function () {
            var element = e(HandledInputBox, {initialInput: "ab\ncde\nef"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            const expected = 'ab\ncd\x1B[7me\x1B[27m\nef';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move cursor down", async function () {
            var element = e(HandledInputBox, {initialInput: "ab\ncd\ne"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            stdin.write(ARROW_DOWN)
            await delay(100);
            const expected = 'ab\ncd\ne\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move cursor down when cursor is newline", async function () {
            var element = e(HandledInputBox, {initialInput: "ab\ncd"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            stdin.write(ARROW_DOWN)
            await delay(100);
            const expected = 'ab\ncd\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should add line at cursor down on last line and multiline true", async function () {
            var element = e(HandledInputBox, {initialInput: "ab", multiline:true});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_DOWN)
            await delay(100);
            const expected = 'ab\n\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move to end of line on cursor down on last line and multiline false", async function () {
            var element = e(HandledInputBox, {initialInput: "ab", multiline:false});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(ARROW_DOWN)
            await delay(100);
            const expected = 'ab\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move to same position on next line when wrapped", async function () {
            var element = e(HandledInputBox, {initialInput: "abcdefgh", width:4});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(ARROW_DOWN)
            await delay(100);
            const expected = 'abcd\nef\x1B[7mg\x1B[27mh';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should handle cursor down on last char and multiline false", async function () {
            var element = e(HandledInputBox, {initialInput: "ab", multiline:false});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_DOWN)
            await delay(100);
            const expected = 'ab\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move cursor up to pos 0", async function () {
            var element = e(HandledInputBox, {initialInput: "ab\ncd"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            const expected = '\x1B[7ma\x1B[27mb\ncd';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should not be able to move up past pos 0", async function () {
            var element = e(HandledInputBox, {initialInput: "ab"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            const expected = '\x1B[7ma\x1B[27mb';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move to start of line", async function () {
            var element = e(HandledInputBox, {initialInput: "ab\ncd"});
            const {lastFrame, stdin, frames} = render(element);
            await delay(100);
            stdin.write(CTRLA)
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(CTRLA)
            await delay(100);
            stdin.write(CTRLA)
            await delay(100);
            //moves to start of line 2 then start of line 1
            const expected = '\x1B[7ma\x1B[27mb\ncd';
            assert.strictEqual(frames[1], "ab\n\x1B[7mc\x1B[27md");
            assert.strictEqual(frames[3], expected);
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move to start of line even if truncate is set", async function () {
            var element = e(HandledInputBox, {initialInput: "hello world", width:2, wrap:"truncate"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(CTRLA)
            await delay(100);
            const expected = '\x1B[7mh\x1B[27m…';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move to end of line", async function () {
            var element = e(HandledInputBox, {initialInput: "ab\ncd"});
            const {lastFrame, stdin, frames} = render(element);
            await delay(100);
            stdin.write(CTRLA)
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            stdin.write(CTRLE)
            await delay(100);
            stdin.write(CTRLE)
            await delay(100);
            stdin.write(ARROW_RIGHT)
            await delay(100);
            stdin.write(CTRLE)
            await delay(100);
            stdin.write(CTRLE)
            await delay(100);
            const expected = 'ab\ncd\x1B[7m \x1B[27m';
            assert.strictEqual(frames[2], "\x1B[7ma\x1B[27mb\ncd");
            assert.strictEqual(frames[3], "ab\x1B[7m \x1B[27m\n\x1B[7m\x1B[27mcd");
            assert.strictEqual(lastFrame(), expected);
        });
        it("should delete characters", async function () {
            var element = e(HandledInputBox, {initialInput: "ab"});
            const {lastFrame, stdin, frames} = render(element);
            await delay(100);
            stdin.write(DELETE)
            await delay(100);
            stdin.write(DELETE)
            await delay(100);
            stdin.write(DELETE)
            await delay(100);
            const expected = '\x1B[7m \x1B[27m';
            assert.strictEqual(frames[1], "a\x1B[7m \x1B[27m")
            assert.strictEqual(lastFrame(), expected);
        });
        it("should delete word", async function () {
            var element = e(HandledInputBox, {initialInput: "Hello world"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(CTRLW)
            await delay(100);
            //a + cursor
            const expected = 'Hello \x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should delete line", async function () {
            var element = e(HandledInputBox, {initialInput: "Hello world 2"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(CTRLU)
            await delay(100);
            //a + cursor
            const expected = '\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should go up line when deleting empty line", async function () {
            var element = e(HandledInputBox, {initialInput: "Hello\n"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(CTRLU)
            await delay(100);
            //a + cursor
            const expected = 'Hello\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should be able to set value", async function () {
            var element = () => {
                const ref = React.useRef();
                var replacement = "Goodbye world";

                ink.useInput((input, key) =>{
                    if(input === "r"){
                        ref.current.setInput(replacement);
                    }
                })

                return e(InputBox, {initialInput:"Hello world", ref: ref});
            }
            const {lastFrame, stdin} = render(e(element, {}));
            await delay(100);
            stdin.write("r")
            await delay(100);
            const expected = 'Goodbye world\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should submit on enter", async function () {
            const expected = "Hello world";
            var onSubmit = async (input) =>{
                await delay(100);
                assert.strictEqual(input, expected);
                unmount();
            }
            var element = e(HandledInputBox, {initialInput: expected, onSubmit: onSubmit});
            const {stdin, unmount} = render(element);
            await delay(100);
            stdin.write(ENTER);
            await delay(100);
        });
        it("should report cursor x y on change", async function () {
            const expected = "Hello world";
            var onUpdate = async (input, x , y) =>{
                await delay(100);
                assert.strictEqual(x, 2);
                assert.strictEqual(y, 1);
                unmount();
            }
            var element = e(HandledInputBox, {initialInput: expected, onUpdate: onUpdate});
            const {stdin, unmount} = render(element);
            await delay(100);
            stdin.write("aa\nbb");
            await delay(100);
        });
        it("should insert a string", async function () {
            const element = () =>{
                var ref = React.useRef();

                ink.useInput((input, key) =>{
                    if(key.tab){
                        ref.current.insert("anything", 1);
                    }
                })

                return e(InputBox, {initialInput: "Do a", ref:ref})
            }

            const {unmount, lastFrame, stdin} = render(e(element, {}));
            await delay(100);
            stdin.write("\t");
            await delay(100);

            unmount();
            await delay(100);
            assert.strictEqual(lastFrame(), "Do anything\x1B[7m \x1B[27m")
        });
    });
    describe("bugs", function(){
        it("should be able to move up 2 empty lines", async function () {
            var element = e(HandledInputBox, {initialInput: "a\n\n\n"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            const expected = 'a\n\x1B[7m \x1B[27m\n\x1B[7m\x1B[27m\n';
            assert.strictEqual(lastFrame(), expected);
        })
        it("should delete line even with prompt", async function () {
            var prompt = e(Prompt, {});
            var element = e(HandledInputBox, {initialInput: "Hello world 2", promptElement:prompt, promptOffset:2});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(CTRLU)
            await delay(100);
            //a + cursor
            const expected = '> \x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
    });
});