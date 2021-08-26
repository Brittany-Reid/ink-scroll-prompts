const ColorBox = require("./src/components/color-box");
const { ScrollMenu } = require("./src/components/scroll-menu");
const { HandledInputBox, InputBox } = require("./src/components/input-box");
const { HandledInputPrompt, InputPrompt } = require("./src/components/input-prompt");
const useTerminalSize = require("./src/hooks/use-terminal-size");
const useInput = require("./src/patch/use-input");
const Prompt = require("./src/prompts/prompt");
const Input = require("./src/prompts/input");

/**
 * @typedef {import("./src/components/input-prompt").InputPromptProps} InputPromptProps
 * @typedef {import("./src/components/input-prompt").HandledInputPromptProps} HandledInputPromptProps
 * @typedef {import("./src/components/color-box").ColorBoxProps} ColorBoxProps
 * @typedef {import("./src/components/scroll-menu").ScrollMenuProps} ScrollMenuProps
 */


module.exports = {
    ColorBox,
    ScrollMenu,
    HandledInputBox,
    InputBox,
    InputPrompt,
    HandledInputPrompt,
    useTerminalSize,
    useInput,
    Prompt,
    Input
}