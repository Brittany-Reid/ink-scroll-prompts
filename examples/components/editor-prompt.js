/**
 * @fileoverview An example of how the InputPrompt component can be used in Ink to 
 * simulate a text editor.
 *  - Ctrl+S to submit / 'save'
 *  - Enter inserts newline
 */

const { HandledInputPrompt, useTerminalSize } = require("../..");

const React = require("react");
const ink = require("@gnd/ink");
const { InputPrompt } = require("../../src/components/input-prompt");
const useInput = require("../../src/patch/use-input");
 
const e = React.createElement;
function _extends() { var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
 
const EditorPrompt = ({
    ...props
}) => {
    const {stdout} = ink.useStdout();

    const [height, setHeight] = React.useState(stdout.rows);
    const [width, setWidth] = React.useState(stdout.columns);

    useTerminalSize((width, height) => {
        setWidth(width);
        setHeight(height);
    });

    var keyBindings = _extends({}, InputPrompt.defaultKeyBindings);

    keyBindings.submit = [
        {
            key: {
                ctrl:true
            },
            input: "s",
        }
    ];

    keyBindings.append = {
        key: {
            return: true
        },
        args: "\n"
    }

    const handledInputPromptProps = {
        width: width, 
        maxHeight: height-2,
        useDefaultKeys: false,
        additionalKeys: keyBindings,
        multiline: true,
        newlineOnDown: false,
    }

    return e(HandledInputPrompt, _extends(handledInputPromptProps, props));
}


//what to do when we submit input
const onSubmit = (value) => {
    //wait for exit then print
    app.waitUntilExit().then(()=>{
        console.log("Submitted: " + value);
    })
}

var app = ink.render(e(EditorPrompt, {onSubmit: onSubmit}), {exitOnCtrlC: false})