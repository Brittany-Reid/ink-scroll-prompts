const ink = require("@gnd/ink");
const React = require("react");
const e = React.createElement;

/**
 * @typedef {Object} PromptTypes
 * @property {string} [prefix] Prompt prefix. `NAME` in `NAME [opts] >`.
 * @property {string} [message] Prompt message. `[opts]` in `NAME [opts] >`.
 * @property {string} [seperator] Prompt seperator. `>` in `NAME [opts] >`.
 * @property {import("../types").Color} [accentColor] Color of the prefix of the prompt.
 * 
 * @typedef {ink.TextProps & PromptTypes} PromptProps
 */

/**
 * Formatted input prompt, the text before an input field.
 * When dimmed, accent colour will not display.
 * @type {React.FC<PromptProps>}
 */
const Prompt = ({
    prefix,
    message,
    seperator = ">",
    accentColor = "cyan",
    ...props
}) => {
    var parts = [prefix, message, seperator];
    return e(ink.Text, props,
        parts.map((p, index) => {
            if(!p) return;

            var partProps = {
                key: index,
            }

            //prefix
            if(index == 0) {
                if(props.dimColor !== true){
                    partProps.color = accentColor;
                }
            }
            //message
            if(index == 1) partProps.bold = true;

            return e(ink.Text, partProps, p + " ")
        })
    )
}

module.exports = Prompt;