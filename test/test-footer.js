require("mocha");
var assert = require("assert");
const ink = require("@gnd/ink");
const React = require("react");
const e = React.createElement;
const {render} = require("./../src/patch/ink-testing-library-patch");
const delay = require("delay");
const Footer = require("../src/components/footer");


describe("Footer", function () {
    describe("unit tests", function () {
        it("should work with default settings", async function () {
            var element = e(ink.Box, {width:5}, 
                e(Footer, {})
            );
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "\x1B[46m     \x1B[49m";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should be able supply keybindings", async function () {
            const keybindings = {
                cancel: {
                    key: {
                        escape:true,
                    }
                },
                toggleSuggest: {
                    key: {
                        tab:true,
                    }
                }
            }
            var element = e(ink.Box, {width:32}, 
                e(Footer, {keyBindings: keybindings})
            );
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "\x1B[46m\x1B[30m cancel [escape] \x1B[39m\x1B[49m\x1B[46m\x1B[30m suggest [tab] \x1B[39m\x1B[49m";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should display a message with keybindings", async function () {
            const keybindings = {
                cancel: {
                    key: {
                        escape:true,
                    }
                }
            }
            var element = e(ink.Box, {width:25}, 
                e(Footer, {keyBindings: keybindings, message: "v1.0"})
            );
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "\x1B[46m \x1B[49m\x1B[46m\x1B[30m cancel [escape] \x1B[39m\x1B[49m\x1B[46m  \x1B[49m\x1B[46m\x1B[30mv1.0\x1B[39m\x1B[49m\x1B[46m \x1B[49m";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
        it("should only display text component message", async function () {
            const keybindings = {
                cancel: {
                    key: {
                        escape:true,
                    }
                }
            }
            var message = e(ink.Text, {}, "This is a custom footer");
            var element = e(ink.Box, {width:25}, 
                e(Footer, {keyBindings: keybindings, message: message})
            );
            var {lastFrame, unmount} = render(element);
            await delay(100);
            var expected = "\x1B[46m \x1B[49m\x1B[46m\x1B[30mThis is a custom footer\x1B[39m\x1B[49m\x1B[46m \x1B[49m";
            assert.strictEqual(lastFrame(), expected);
            unmount();
        });
    });
});