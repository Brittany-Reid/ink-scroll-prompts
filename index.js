const ColorBox = require("./src/components/color-box");
const { ScrollMenu } = require("./src/components/scroll-menu");
const { HandledInputBox, InputBox } = require("./src/components/input-box");
const { HandledInputPrompt, InputPrompt } = require("./src/components/input-prompt");
const useTerminalSize = require("./src/hooks/use-terminal-size");
const useInput = require("./src/patch/use-input");


module.exports = {
    ColorBox,
    ScrollMenu,
    HandledInputBox,
    InputBox,
    InputPrompt,
    HandledInputPrompt,
    useTerminalSize,
    useInput,
}