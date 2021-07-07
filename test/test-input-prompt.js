require("mocha");
var assert = require("assert");
const React = require("react");
//const ink = require("@gnd/ink");
const { InputPrompt, HandledInputPrompt } = require("../src/components/input-prompt");
const e = React.createElement;
const delay = require("delay");
const {render} = require("../src/patch/ink-testing-library-patch");
const chalk = require("chalk");
const fs = require("fs");

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
const ESC = "\u001B";
const SHIFTUP = "\u001B[1;2A";
const SHIFTDOWN = "\u001B[1;2B";
const F12 = "\u001B[24~";
const F5 = "\u001B[15~";

describe("InputPrompt", function () {
    const historyFile = "testHistory.json";
    const history = {
        "history": {
            "past": [
                "a1",
            ]
        }
    }

    before(() =>{
        fs.writeFileSync(historyFile, JSON.stringify(history));
    })

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
        it("should submit on enter", async function () {
            const expected = "Hello world";

            var result = await new Promise(async (resolve) => {
                var onSubmit = async (input) =>{
                    await delay(100);
                    resolve(input);
                }
                var element = e(HandledInputPrompt, {initialInput: expected, onSubmit:onSubmit});
                const {stdin, unmount} = render(element);
                await delay(100);
                stdin.write(ENTER);
                await delay(100);
                unmount();
                resolve()
            });

            assert.strictEqual(result, expected);
        });
        it("should cancel on esc", async function () {
            const expected = "Hello world";
            var lastFrame;

            var result = await new Promise(async (resolve) => {
                var onCancel = async (input) =>{
                    resolve(input);
                }
                var element = e(HandledInputPrompt, {initialInput: expected, onCancel: onCancel});
                var app = render(element);
                lastFrame = app.lastFrame;
                await delay(100);
                app.stdin.write(ESC);
                //await delay(100);
                app.unmount();
                resolve()
            });

            assert.strictEqual(result, expected);
            //ensure timing, this should be in canceled dimmed state
            assert.strictEqual(lastFrame(), "\x1B[2m> \x1B[22m\x1B[2mHello world\x1B[22m\n")
        });
        it("should be able to use last command", async function () {
            var app;
            var element = e(HandledInputPrompt, {historyFile: historyFile});
            app = render(element);
            await delay(100);
            app.stdin.write(SHIFTUP);
            await delay(100);

            assert.strictEqual(app.lastFrame(), "> a1\x1B[7m \x1B[27m");

            app.unmount();
        });
        it("should be able to navigate history", async function () {
            var app;
            var element = e(HandledInputPrompt, {historyFile: historyFile});
            app = render(element);
            await delay(100);
            app.stdin.write(SHIFTUP);
            await delay(100);
            app.stdin.write(SHIFTDOWN);
            await delay(100);

            assert.strictEqual(app.lastFrame(), "> \x1B[7m \x1B[27m");

            app.unmount();
        });
        it("should not show completes on history", async function () {
            var app;
            var element = e(HandledInputPrompt, {historyFile: historyFile, completions: ["a1complete"]});
            app = render(element);
            await delay(100);
            app.stdin.write(SHIFTUP);
            await delay(100);

            assert.strictEqual(app.lastFrame(), "> a1\x1B[7m \x1B[27m");

            app.unmount();
        });
        it("should delete characters", async function () {
            var element = e(HandledInputPrompt, {initialInput: "ab"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(DELETE)
            await delay(100);
            const expected = '> a\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should delete word", async function () {
            var element = e(HandledInputPrompt, {initialInput: "Hello world"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(CTRLW)
            await delay(100);
            const expected = '> Hello \x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should delete line", async function () {
            var element = e(HandledInputPrompt, {initialInput: "Hello world 2"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(CTRLU)
            await delay(100);
            const expected = '> \x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move cursor forward", async function () {
            var element = e(HandledInputPrompt, {initialInput: "ab"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(ARROW_LEFT)
            await delay(100);
            stdin.write(ARROW_RIGHT)
            await delay(100);
            const expected = '> a\x1B[7mb\x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move cursor up and down", async function () {
            var element = e(HandledInputPrompt, {initialInput: "ab\ncd\ne"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(ARROW_UP)
            await delay(100);
            stdin.write(ARROW_DOWN)
            await delay(100);
            const expected = '> ab\ncd\ne\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move to start of line", async function () {
            var element = e(HandledInputPrompt, {initialInput: "ab\ncd"});
            const {lastFrame, stdin} = render(element);
            await delay(100);
            stdin.write(CTRLA)
            await delay(100);
            const expected = '> ab\n\x1B[7mc\x1B[27md';
            assert.strictEqual(lastFrame(), expected);
        });
        it("should move to end of line", async function () {
            var element = e(HandledInputPrompt, {initialInput: "ab\ncd"});
            const {lastFrame, stdin, unmount} = render(element);
            await delay(100);
            stdin.write(CTRLA)
            await delay(100);
            stdin.write(CTRLE)
            await delay(100);
            const expected = '> ab\ncd\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);

            unmount();
        });
        it("should handle additinal keys for existing command", async function () {
            var element = e(HandledInputPrompt, {initialInput: "a", additionalKeys: {
                cancel: {
                    key: {
                        f12: true,
                    }
                },
                submit: {
                    key: {
                        f5:true,
                    }
                }
            }});
            const {lastFrame, stdin, unmount} = render(element);
            await delay(100);
            stdin.write(F12)
            await delay(100);
            const expected = '\x1B[2m> \x1B[22m\x1B[2ma\x1B[22m\n';
            assert.strictEqual(lastFrame(), expected);

            unmount();
        });
        it("should handle additinal keys for unhandled command", async function () {
            var element = e(HandledInputPrompt, {initialInput: "a", useDefaultKeys:false, additionalKeys: {
                setInput: {
                    key: {
                        f5: true,
                    },
                    args: ["b"]
                },
            }});
            const {lastFrame, stdin, unmount} = render(element);
            await delay(100);
            stdin.write(F5)
            await delay(100);
            const expected = '> b\x1B[7m \x1B[27m';
            assert.strictEqual(lastFrame(), expected);

            unmount();
        });
    });

    after(()=>{
        fs.unlinkSync(historyFile);
    });
});