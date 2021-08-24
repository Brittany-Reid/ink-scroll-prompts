/**
 * @fileoverview An example of how the InputPrompt component can be used in Ink.
 */

const { HandledInputPrompt, useTerminalSize } = require("../..");

const React = require("react");
const ink = require("@gnd/ink");
 
const e = React.createElement;
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var completes = [
    "let",
    "var",
    "const",
    "function",
];
completes.push(...Object.getOwnPropertyNames(globalThis));

var suggestions = [
    {label: "exit"},
    {label: "help"}, 
    {label: "reallyLongCommand"},
]
 
const myPrompt = () => {
    const {stdout} = ink.useStdout();

    const [height, setHeight] = React.useState(stdout.rows);
    const [width, setWidth] = React.useState(stdout.columns);

    useTerminalSize((width, height) => {
        setWidth(width);
        setHeight(height);
    });

    return e(HandledInputPrompt, {initialInput: "c", footer: true, width: width, maxHeight: height-2, completions: completes, suggestions: suggestions, footerMessage: "ink-scroll-prompts v0", historyFile: "history.json"});
}


ink.render(e(myPrompt), {exitOnCtrlC: false})