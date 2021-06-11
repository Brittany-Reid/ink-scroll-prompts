const ink = require("@gnd/ink");
const React = require("react");
const sliceAnsi = require("slice-ansi");
const stripAnsi = require("strip-ansi");
const e = React.createElement;

/**
 * Internal Input text object that renders a text element with cursor at some position.
 * @extends React.Component<import("../types").InputTextProps>
 */
class InputText extends React.Component{
    /**
     * @param {import("../types").InputTextProps} props 
     */
    constructor(props) {
        super(props);
    }

    render(){
        var {
            text, 
            cursor, 
            cursorWidth, 
            placeholder, 
            showCursor, 
            transform, 
            ...props
        } = this.props;

        const textProps = {};

        if(!text){
            text = placeholder;
            textProps.dimColor = true;
        }

        if(!showCursor) cursorWidth = 0;

        if(typeof transform === "function") text = transform(text, !this.props.text);

        var before = "";
        var after = "";
        var cursorChar;
        if(text){
            // @ts-ignore
            before = sliceAnsi(text, 0, cursor);
            // @ts-ignore
            cursorChar = sliceAnsi(text, cursor, cursor+cursorWidth);
            // @ts-ignore
            after = sliceAnsi(text, cursor+cursorWidth);

            //i noticed some odd behaviour with slice ansi so this is a bit sketch
            //at least, the cursor should always display

            // @ts-ignore
            cursorChar = stripAnsi(cursorChar);
            if(cursorChar.length === 0) cursorChar = " ".repeat(cursorWidth);
            if(cursorChar === "\n") cursorChar = " \n"
        }
        else{
            cursorChar = " ".repeat(cursorWidth);
        }

        return e(ink.Text, props, 
            e(ink.Text, textProps, before), 
            // @ts-ignore
            e(ink.Text, {inverse:true}, stripAnsi(cursorChar)),
            e(ink.Text, textProps, after)
        )
    }
}

InputText.defaultProps = {
    text: "",
    cursor: 0,
    cursorWidth: 1,
    showCursor: true,
    transform: undefined,
    placeholder: undefined,
}

module.exports = InputText;