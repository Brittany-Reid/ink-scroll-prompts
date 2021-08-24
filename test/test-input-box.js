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
const fs = require("fs");
const { send, write, press, keys } = require("../src/test-utils");

describe("InputBox", function () {
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
        describe("cursor movement", function () {
            it("should move cursor backwards", async function () {
                var element = e(HandledInputBox, {initialInput: "ab"});
                var app = render(element);
                await press(keys.ARROW_LEFT, app)
                await press(keys.ARROW_LEFT, app)
                //cursor + ab
                const expected = '\x1B[7ma\x1B[27mb';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should not be able to move past pos 0", async function () {
                var element = e(HandledInputBox, {});
                var app = render(element);
                await press(keys.ARROW_LEFT, app)
                //cursor + ab
                const expected = '\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move cursor forward", async function () {
                var element = e(HandledInputBox, {initialInput: "ab"});
                var app = render(element);
                await press(keys.ARROW_LEFT, app)
                await press(keys.ARROW_LEFT, app)
                await press(keys.ARROW_RIGHT, app)
                //a + cursor + b
                const expected = 'a\x1B[7mb\x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should not be able to move past input length", async function () {
                var element = e(HandledInputBox, {});
                var app = render(element);
                await press(keys.ARROW_RIGHT, app)
                //cursor + ab
                const expected = '\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move cursor up", async function () {
                var element = e(HandledInputBox, {initialInput: "ab\ncde\nef"});
                var app = render(element);
                await press(keys.ARROW_UP, app)
                const expected = 'ab\ncd\x1B[7me\x1B[27m\nef';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move cursor down", async function () {
                var element = e(HandledInputBox, {initialInput: "ab\ncd\ne"});
                var app = render(element);
                await press(keys.ARROW_UP, app)
                await press(keys.ARROW_DOWN, app)
                const expected = 'ab\ncd\ne\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move cursor down when cursor is newline", async function () {
                var element = e(HandledInputBox, {initialInput: "ab\ncd"});
                var app = render(element);
                await press(keys.ARROW_UP, app)
                await press(keys.ARROW_DOWN, app)
                const expected = 'ab\ncd\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move to same position on next line when wrapped", async function () {
                var element = e(HandledInputBox, {initialInput: "abcdefgh", width:4});
                var app = render(element);
                await press(keys.ARROW_UP, app)
                await press(keys.ARROW_LEFT, app)
                await press(keys.ARROW_LEFT, app)
                await press(keys.ARROW_DOWN, app)
                const expected = 'abcd\nef\x1B[7mg\x1B[27mh';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move cursor up to pos 0", async function () {
                var element = e(HandledInputBox, {initialInput: "ab\ncd"});
                var app = render(element);
                await press(keys.ARROW_UP, app)
                await press(keys.ARROW_UP, app)
                const expected = '\x1B[7ma\x1B[27mb\ncd';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should not be able to move up past pos 0", async function () {
                var element = e(HandledInputBox, {initialInput: "ab"});
                var app = render(element);
                await press(keys.ARROW_UP, app)
                await press(keys.ARROW_UP, app)
                const expected = '\x1B[7ma\x1B[27mb';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move to start of line", async function () {
                var element = e(HandledInputBox, {initialInput: "ab\ncd"});
                var app = render(element);
                await press(keys.CTRLA, app)
                await press(keys.ARROW_LEFT, app)
                await press(keys.CTRLA, app)
                await press(keys.CTRLA, app)
                //moves to start of line 2 then start of line 1
                const expected = '\x1B[7ma\x1B[27mb\ncd';
                assert.strictEqual(app.frames[1], "ab\n\x1B[7mc\x1B[27md");
                assert.strictEqual(app.frames[3], expected);
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move to start of line even if truncate is set", async function () {
                var element = e(HandledInputBox, {initialInput: "hello world", width:2, wrap:"truncate"});
                var app = render(element);
                await press(keys.CTRLA, app)
                const expected = '\x1B[7mh\x1B[27m…';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move to end of line", async function () {
                var element = e(HandledInputBox, {initialInput: "ab\ncd"});
                var app = render(element);
                await press(keys.CTRLA, app)
                await press(keys.ARROW_UP, app)
                await press(keys.CTRLE, app)
                await press(keys.CTRLE, app)
                await press(keys.ARROW_RIGHT, app)
                await press(keys.CTRLE, app)
                await press(keys.CTRLE, app)
                const expected = 'ab\ncd\x1B[7m \x1B[27m';
                assert.strictEqual(app.frames[2], "\x1B[7ma\x1B[27mb\ncd");
                assert.strictEqual(app.frames[3], "ab\x1B[7m \x1B[27m\n\x1B[7m\x1B[27mcd");
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move to previous word", async function () {
                var element = e(HandledInputBox, {initialInput: "hello world"});
                var app = render(element);
                await press(keys.ALTB, app);
                assert.strictEqual(app.lastFrame(), "hello \x1B[7mw\x1B[27morld")
                app.unmount();
            });
            it("should move to next word", async function () {
                var element = e(HandledInputBox, {initialInput: "hello world"});
                var app = render(element);
                await press(keys.ALTB, app);
                await press(keys.ALTF, app);
                assert.strictEqual(app.lastFrame(), "hello world\x1B[7m \x1B[27m")
                app.unmount();
            });
        });
        describe("multiline handling", function () {
            it("should add line at cursor down on last line and multiline true", async function () {
                var element = e(HandledInputBox, {initialInput: "ab", multiline:true});
                var app = render(element);
                await press(keys.ARROW_DOWN, app)
                const expected = 'ab\n\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should be able to disable line down newline", async function () {
                var element = e(HandledInputBox, {initialInput: "ab", multiline:true, newlineOnDown: false});
                var app = render(element);
                await press(keys.ARROW_DOWN, app)
                const expected = 'ab\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should move to end of line on cursor down on last line and multiline false", async function () {
                var element = e(HandledInputBox, {initialInput: "ab", multiline:false});
                var app = render(element);
                await press(keys.ARROW_LEFT, app)
                await press(keys.ARROW_DOWN, app)
                const expected = 'ab\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should handle cursor down on last char and multiline false", async function () {
                var element = e(HandledInputBox, {initialInput: "ab", multiline:false});
                var app = render(element);
                await press(keys.ARROW_DOWN, app)
                const expected = 'ab\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
        });
        describe("deletion", function () {
            it("should delete characters", async function () {
                var element = e(HandledInputBox, {initialInput: "ab"});
                var app = render(element);
                await press(keys.DELETE, app)
                await press(keys.DELETE, app)
                await press(keys.DELETE, app)
                const expected = '\x1B[7m \x1B[27m';
                assert.strictEqual(app.frames[1], "a\x1B[7m \x1B[27m")
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should delete word", async function () {
                var element = e(HandledInputBox, {initialInput: "Hello world"});
                var app = render(element);
                await press(keys.CTRLW, app)
                //a + cursor
                const expected = 'Hello \x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should delete line", async function () {
                var element = e(HandledInputBox, {initialInput: "Hello world 2"});
                var app = render(element);
                await press(keys.CTRLU, app)
                //a + cursor
                const expected = '\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
            it("should go up line when deleting empty line", async function () {
                var element = e(HandledInputBox, {initialInput: "Hello\n"});
                var app = render(element);
                await press(keys.CTRLU, app)
                //a + cursor
                const expected = 'Hello\x1B[7m \x1B[27m';
                assert.strictEqual(app.lastFrame(), expected);
            });
        });
        it("can type a character", async function () {
            var element = e(HandledInputBox, {});
            const app = render(element);
            await write("a", app);
            //a + cursor
            const expected = 'a\x1B[7m \x1B[27m';
            assert.strictEqual(app.lastFrame(), expected);
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
            var app = render(e(element, {}));
            await write("r", app)
            const expected = 'Goodbye world\x1B[7m \x1B[27m';
            assert.strictEqual(app.lastFrame(), expected);
        });
        it("should submit on enter", async function () {
            var submitted = undefined;
            var app;
            var onSubmit = async (input) =>{
                await delay(100);
                submitted = input;
                app.unmount();
            }
            const expected = "Hello world";
            var element = e(HandledInputBox, {initialInput: expected, onSubmit: onSubmit});
            app = render(element);
            await press(keys.ENTER, app);
            assert.strictEqual(submitted, expected);
        });
        it("should cancel on esc", async function () {
            var canceled = undefined;
            var app;
            var onCancel = async (input) =>{
                await delay(100);
                canceled = input;
                app.unmount();
            }
            
            const expected = "Hello world";
            var element = e(HandledInputBox, {initialInput: expected, onCancel: onCancel});
            app = render(element);
            await press(keys.ESC, app);
            assert.strictEqual(canceled, expected);
        });
        it("should report cursor x y on change", async function () {
            var cursor = {};
            var app;
            var onUpdate = async (input, x , y) =>{
                cursor.x = x;
                cursor.y = y;
            }
            var element = e(HandledInputBox, {onUpdate:onUpdate});
            app = render(element);
            await write("aa\nbb", app);
            await delay(200);
            assert.strictEqual(cursor.x, 2);
            assert.strictEqual(cursor.y, 1);
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

            var app = render(e(element, {}));
            await write("\t", app);
            app.unmount();
            await delay(100);
            assert.strictEqual(app.lastFrame(), "Do anything\x1B[7m \x1B[27m")
        });
    });
    describe("bugs", function(){
        it("should be able to move up 2 empty lines", async function () {
            var element = e(HandledInputBox, {initialInput: "a\n\n\n"});
            var app = render(element);
            await press(keys.ARROW_UP, app)
            await press(keys.ARROW_UP, app)
            const expected = 'a\n\x1B[7m \x1B[27m\n\x1B[7m\x1B[27m\n';
            assert.strictEqual(app.lastFrame(), expected);
        })
        it("should delete line even with prompt", async function () {
            var prompt = e(Prompt, {});
            var element = e(HandledInputBox, {initialInput: "Hello world 2", promptElement:prompt, promptOffset:2});
            var app = render(element);
            await press(keys.CTRLU, app)
            //a + cursor
            const expected = '> \x1B[7m \x1B[27m';
            assert.strictEqual(app.lastFrame(), expected);
        });
        it("should replace tabs with 2 spaces", function (){
            var element = e(InputBox, {initialInput: "\tA"});
            var app = render(element);
            assert(app.lastFrame().startsWith("  A"))
            app.unmount();
        });
    });
    describe("history", function(){
        it("should add to history", async function () {
            var app;
            var element = e(HandledInputBox, {historyFile: historyFile, onSubmit: ((input) => {app.unmount()})});
            app = render(element);
            await send("a0", app);

            element = e(HandledInputBox, {historyFile: historyFile});
            app = render(element);
            await press(keys.SHIFTUP, app);

            assert.strictEqual(app.lastFrame(), "a0\x1B[7m \x1B[27m");
            app.unmount();
        });
        it("should stop when reach limit of history", async function () {
            var app;
            var element = e(HandledInputBox, {historyFile: historyFile});
            app = render(element);
            await press(keys.SHIFTUP, app);
            await press(keys.SHIFTUP, app);
            await press(keys.SHIFTUP, app);
            assert.strictEqual(app.lastFrame(), "a1\x1B[7m \x1B[27m");
            app.unmount();
        });
        //maybe replace final shift down with retaining original input?
        it("should erase on last shift down", async function () {
            var element = e(HandledInputBox, {initialInput: "a", historyFile: historyFile});
            var app = render(element);
            await press(keys.SHIFTDOWN, app);
            assert.strictEqual(app.lastFrame(), "\x1B[7m \x1B[27m");
            app.unmount();
        });
        it("should be able to navigate history", async function () {
            var element = e(HandledInputBox, {historyFile: historyFile});
            var app = render(element);
            await press(keys.SHIFTUP, app);
            await press(keys.SHIFTUP, app);
            await press(keys.SHIFTDOWN, app);
            assert.strictEqual(app.lastFrame(), "a0\x1B[7m \x1B[27m");
            app.unmount();
        });
        it("down after history should return initial input", async function () {
            var element = e(HandledInputBox, {historyFile: historyFile, initialInput: "hello"});
            var app = render(element);
            await press(keys.SHIFTUP, app);
            assert.strictEqual(app.lastFrame(), "a0\x1B[7m \x1B[27m");
            await press(keys.SHIFTDOWN, app);
            assert.strictEqual(app.lastFrame(), "hello\x1B[7m \x1B[27m");
            app.unmount();
        });
        it("up after history down should return initial input", async function () {
            var element = e(HandledInputBox, {historyFile: historyFile, initialInput: "hello"});
            var app = render(element);
            await press(keys.SHIFTDOWN, app);
            assert.strictEqual(app.lastFrame(), "\x1B[7m \x1B[27m");
            await press(keys.SHIFTUP, app);
            assert.strictEqual(app.lastFrame(), "hello\x1B[7m \x1B[27m");
            app.unmount();
        });
        it("up after history down on empty should skip current", async function () {
            var element = e(HandledInputBox, {historyFile: historyFile});
            var app = render(element);
            await press(keys.SHIFTDOWN, app);
            assert.strictEqual(app.lastFrame(), "\x1B[7m \x1B[27m");
            await press(keys.SHIFTUP, app);
            assert.strictEqual(app.lastFrame(), "a0\x1B[7m \x1B[27m");
            app.unmount();
        });
        it("down after history up should skip current if empty", async function () {
            var element = e(HandledInputBox, {historyFile: historyFile});
            var app = render(element);
            await press(keys.SHIFTUP, app);
            assert.strictEqual(app.lastFrame(), "a0\x1B[7m \x1B[27m");
            await press(keys.SHIFTDOWN, app);
            assert.strictEqual(app.lastFrame(), "\x1B[7m \x1B[27m");
            app.unmount();
        });
    });

    after(()=>{
        fs.unlinkSync(historyFile);
    });
});