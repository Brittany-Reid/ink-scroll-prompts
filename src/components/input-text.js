const ink = require("@gnd/ink");
const React = require("react");
const sliceAnsi = require("slice-ansi");
const stripAnsi = require("strip-ansi");
const e = React.createElement;

/**
 * InputText transform function
 * @callback TransformFunction
 * @param {string} text Text to transform.
 * @param {boolean} isPlaceholder If displayed text is placeholder.
 */

/**
 * InputText Props
 * @typedef {Object} InputTextTypes
 * @property {string} [text] Text to render. Default empty.
 * @property {number} [cursor] Position of the cursor as index of text. Default 0.
 * @property {string} [placeholder] Placeholder string that only shows on empty input. Default `undefined`.
 * @property {number} [cursorWidth] CursorWidth
 * @property {boolean} [showCursor] To show or hide the cursor. By default `true`.
 * @property {TransformFunction} [transform] Function that applies a transformation on text. Used to style text.
 * 
 * @typedef {ink.TextProps & InputTextTypes} InputTextProps
 */

/**
 * Internal Input text object that renders a text element with cursor at some position.
 * @extends React.Component<InputTextProps>
 */
class InputText extends React.Component{
    /**
     * @param {InputTextProps} props 
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