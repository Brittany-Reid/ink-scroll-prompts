const ink = require("@gnd/ink");
const React = require("react");
const e = React.createElement;

/**
 * Formatted input prompt, the text before an input field.
 * When dimmed, accent colour will not display.
 * @type {React.FC<import("../types").PromptProps>}
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