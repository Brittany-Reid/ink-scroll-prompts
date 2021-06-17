const ink = require("@gnd/ink");
const React = require("react");
const wrapAnsi = require("wrap-ansi");
const {Store} = require('data-store');
const {_extends, fixedCharAt, fixedSubstring, fixedCharLength, getLastWord } = require("../utils");
const InputText = require("./input-text");
const useInput = require("../patch/use-input");
const e = React.createElement;

const unique = (arr) => arr.filter((v, i) => arr.lastIndexOf(v) === i);
const compact = (arr) => unique(arr).filter(Boolean);

/**
 * InputBox onSubmit function
 * @callback OnSubmitFunction
 * @param {string} input The current input string on submit.
 * @return 
 */

/**
 * InputBox onCancel function
 * @callback OnCancelFunction
 * @param {string} input The current input string on cancel.
 * @return 
 */

/**
 * InputBox onUpdate function.
 * @callback OnUpdateFunction
 * @param {string} input Current input string.
 * @param {number} x Current x position.
 * @param {number} y Current y position.
 * @param {boolean} typed Has the user typed?
 */

/**
 * InputBox Props
 * @typedef {Object} InputBoxTypes
 * @property {string} [initialInput] Start the input with an initial string. Default empty.
 * @property {string} [historyFile] Path to history JSON file. Creates if file doesn't exist.
 * @property {boolean} [multiline]  Allow multiline controls. Enables down to add newlines.
 * @property {boolean} [disableNewlines] If multiline is also false, remove newlines from input. Doesn't control wrap.
 * @property {React.ReactElement | string | null} [promptElement] To use a prompt, supply a text element here.
 * @property {number} [promptOffset] The offset caused by the prompt text.
 * @property {OnUpdateFunction} [onUpdate] Function to call on component update. Reports cursor position. You can use this to message parent about updates.
 * @property {'wrap' | 'truncate' | 'truncate-end' | 'truncate-start' | 'truncate-middle'} [wrap] Ink wrap type.
 * @property {OnSubmitFunction} [onSubmit] Function to be called on submit.
 * @property {OnCancelFunction} [onCancel] Function to be called on cancel
 * 
 * @typedef {ink.BoxProps & import("./input-text").InputTextProps & InputBoxTypes} InputBoxProps
 */

/**
 * An input field that has more advanced functionality.
 * This class has functions that a handler parent can call on ref.
 * It needs to be an Ink.Box to measure width and handle cursor down.
 * 
 * @extends React.Component<InputBoxProps>
 */
class InputBox extends React.Component{
    /**
     * @param {InputBoxProps} props 
     */
    constructor(props) {
        super(props);

        this.ref = React.createRef();
        var initialInput = this.validateInput(this.props.initialInput);

        this.state = {
            input:  initialInput, //current input
            cursor: initialInput.length, //current cursor position
            typed: false, //if use has typed
            cursorWidth: 1, //string.length of current cursor
        }

        this.initHistory();
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        if(prevProps.historyFile !== this.props.historyFile){
            this.initHistory();
        }
        this.onUpdate();
    }

    componentDidMount(){
        this.onUpdate();
    }

    onUpdate(){
        var {x, y} = this.getCursorPos();
        if(typeof this.props.onUpdate === "function"){
            this.props.onUpdate(this.state.input, x, y, this.state.typed);
        }
    }

    initHistory(){
        if(typeof this.props.historyFile === "string" && this.props.historyFile.length > 0){
            this.store = new Store({path: this.props.historyFile});
            this.history = this.store.get("history") || { past: [] };
            this.historyIndex = -1;
        }
        else{
            this.store = undefined;
            this.history = undefined;
            this.historyIndex = -1;
        }
    }

    /**
     * Format any input for us.
     */
    validateInput(input){
        if(!input) return input;
        //remove carriage returns
        input = input.replace("\r\n", "\n").replace("\r", "\n");
        if(!this.props.multiline && this.props.disableNewlines){
            input = input.replace("\n", "")
        }
        return input;
    }

    submit(){
        const {onSubmit} = this.props;
        this.save();
        if(typeof onSubmit === "function") onSubmit(this.state.input);
    }

    save(){
        if(this.store && this.state.input){
            var past = this.history.past || [];
            past.push(this.state.input);
            this.history = {
                past: compact(past),
            };
            this.store.set("history", this.history);
            this.historyIndex = -1;
        }
    }

    cancel(){
        const {onCancel} = this.props;
        if(typeof onCancel=== "function") onCancel(this.state.input);
    }

    getLines(){
        if(!this.ref.current) return;
        const {input, cursor, cursorWidth} = this.state;
        const {wrap} = this.props;
        
        var before = " ".repeat(this.props.promptOffset) + input.slice(0, cursor);
        var cursorChar = input.slice(cursor, cursor+cursorWidth) || " ".repeat(cursorWidth);
        if(cursorChar === "\n") cursorChar = " \n"
        var after = input.slice(cursor+cursorWidth);

        var lines;
        if(wrap === "truncate" || wrap === "truncate-end" || wrap === "truncate-middle" || wrap === "truncate-start"){
            lines = before + cursorChar + after;
        }
        else{
            var width = ink.measureElement(this.ref.current).width;
            // @ts-ignore
            lines = wrapAnsi(before+cursorChar+after, width, {hard: true, trim:false});
        }

        lines = lines.split("\n");

        return lines;
    }

    getCursorPos(lines){
        var {input, cursor} = this.state;
        var {promptOffset} = this.props;
        lines = lines || this.getLines();
        
        //count original newlines
        var before = input.slice(0, cursor);
        var newlines = (before.match(/\n/g) || []).length;
       
        var offset = cursor;
        if(promptOffset) offset+=promptOffset;
        offset -= newlines;


        var x = 0;
        var y = 0;
        var count = 0;
        for(var l of lines){
            var current = count+l.length;
            if(current > offset){
                x = offset-count;
                break;
            }
            count=current;
            y++;
        }

        return {x:x, y:y};
    }

    historyUp(){
        if(!this.store) return;
        var past = this.history.past;
        if (!past || past.length < 1) return;

        this.historyIndex += 1;
        if(this.historyIndex >= past.length) {
            this.historyIndex = past.length-1;
            return;
        }

        var index = (past.length-1)-this.historyIndex;
        var previous = past[index];
        if(!previous) return;
        this.setInput(previous);
    }

    historyDown(){
        if(!this.store) return;
        var past = this.history.past;
        if (!past || past.length < 1) return;
        
        this.historyIndex -= 1;
        if(this.historyIndex < -1) this.historyIndex = -1;
        if(this.historyIndex === -1) return this.setInput("");

        var index = (past.length-1)-this.historyIndex;
        var previous = past[index];
        if(!previous) return;
        this.historyIndex--;
        this.setInput(previous);
    }

    /**
     * Move cursor by n characters, positive or minus.
     * @param {number} n The number of characters to move by.
     */
    moveCursor(n){
        var {input, cursor, cursorWidth} = this.state;
        if(cursor + n < 0) return;
        if(cursor + n > input.length) return;

        var chars = Math.abs(n);
        var direction = Math.sign(n);
        var between, last;
        if(direction === 1){
            var after = input.slice(cursor+cursorWidth);
            between = fixedSubstring(after, 0, chars);
            last = fixedCharAt(after, chars-1);
        }
        else{
            var before = input.slice(0, cursor);
            between = fixedSubstring(before, fixedCharLength(before)-chars);
            last = fixedCharAt(before, fixedCharLength(before)-chars);
        }
        
        this.setState({
            cursorWidth: Math.max(1, last.length),
            cursor:cursor+ (Math.max(1, between.length) * direction)
        })
    }

    moveCursorDown(){
        const {input, cursor, cursorWidth} = this.state;
        //add new line
        if(cursor > input.length-1) {
            if(this.props.multiline) this.append("\n");
            return;
        }
        var lines = this.getLines();
        var {x, y} = this.getCursorPos(lines); 
        var currentLine = lines[y].substring(x);
        var moveBy = currentLine.length;
        if(input.slice(cursor, cursor+cursorWidth) === "\n"){
            moveBy -=1;
        }
        var nextLine = lines[y+1];
        if(typeof nextLine !== "undefined"){
            var nextChar = input.charAt(cursor + moveBy);
            if(nextChar === "\n"){
                moveBy+=1;
            }
            moveBy += Math.min(nextLine.length, x);
        }

        this.setState({
            cursor: cursor+moveBy,
        })
    }

    moveCursorUp(){
        const {input, cursor} = this.state;
        if(cursor <= 0) return;
        var lines = this.getLines();
        var {x, y} = this.getCursorPos(lines);

        var currentLine = lines[y].substring(0, x);
        var moveBy = -currentLine.length;
        if(y === 0) moveBy += this.props.promptOffset;
        var previousLine = lines[y-1];
        if(typeof previousLine !== "undefined"){
            var previousChar = input.charAt(cursor + moveBy - 1);
            if(previousChar === "\n"){
                moveBy-=1;
            }
            var length = previousLine.length;
            if(y-1 === 0){
                length -= this.props.promptOffset;
            }
            moveBy -= Math.max(0, length - x);
        }

        this.setState({
            cursor: Math.max(0, cursor+moveBy),
        })
    }

    moveCursorStartOfLine(){
        const {cursor} = this.state;
        if(cursor <= 0) return;
        var lines = this.getLines();
        var {x, y} = this.getCursorPos(lines);
        var currentLine = lines[y].substring(0, x);
        var moveBy = -currentLine.length;
        if(y === 0) moveBy += this.props.promptOffset;

        this.setState({
            cursor: Math.max(0, cursor+moveBy),
        })
    }

    moveCursorEndOfLine(){
        const {input, cursor, cursorWidth} = this.state;
        if(cursor > input.length-1) return;
        var lines = this.getLines();
        var {x, y} = this.getCursorPos(lines); 
        var currentLine = lines[y].substring(x);
        var moveBy = currentLine.length;
        var cursorChar = input.slice(cursor, cursor+cursorWidth);
        if(cursorChar === "\n"){
            moveBy -=1;
        }
        this.setState({
            cursor: Math.max(0, Math.min(cursor+moveBy, input.length)),
        })
    }

    deleteCh(n = 1){
        var {input, cursor} = this.state;
        if(cursor <= 0) return;

        var before = input.slice(0, cursor);
        var after = input.slice(cursor);
        var toDelete = fixedSubstring(before, fixedCharLength(before)-n);

        var newCursor = cursor-toDelete.length;
        var newInput = input.slice(0, newCursor) + after;
        this.setState({
            input: newInput,
            cursor: newCursor,
            typed: true,
        })
    }

    deleteWord(){
        var {input, cursor} = this.state;
        var before = input.substring(0, cursor);
        var after =input.substring(cursor);

        var lastWord = getLastWord(before);
        before = before.substring(0, before.length-lastWord.length);     

        this.setState({
            input: before + after,
            cursor: before.length,
            typed: true,
        })
    }

    deleteLine(){
        var {input, cursor} = this.state;
        var lines = this.getLines();
        var {x, y} = this.getCursorPos(lines);
        var currentLine = lines[y];
        var toDelete = currentLine.substring(this.props.promptOffset, x);


        //if no characters on line, go up one line
        if(toDelete.length === 0){
            this.deleteCh(1);
            return;
        }

        var before = input.slice(0, cursor-toDelete.length);
        var after = input.slice(cursor);

        this.setState({
            input:before+after,
            cursor: before.length,
            typed: true,
        })
    }

    append(ch){
        var {input, cursor} = this.state;
        ch = this.validateInput(ch);
        input = input.slice(0, cursor) + ch + input.slice(cursor);
        this.setState({
            input: input,
            cursor: cursor+ch.length,
            typed: true,
        })
    }

    /**
     * Insert some string at position n before cursor, replacing what already exists.
     * Useful for auto suggestions.
     */
    insert(ch, n = 0){
        var {input, cursor} = this.state;
        ch = this.validateInput(ch);
        var start = cursor-n;

        var before = input.slice(0, start) + ch;
        var after = input.slice(cursor);
        
        this.setState({
            input: before + after,
            cursor: before.length,
            typed: true,
        })
    }

    /**
     * Overwrite the existing input.
     * @param {string} newInput The input to replace with.
     * @param {boolean} resetTyped To reset the typed state.
     */
    setInput(newInput, resetTyped = true){
        newInput = this.validateInput(newInput);
        this.setState({
            input:newInput,
            cursor:newInput.length,
            cursorWidth:1,
            typed: !resetTyped,
        })
    }

    render(){
        const {
            color,
            dimColor,
            italic,
            inverse,
            backgroundColor,
            bold,
            underline,
            showCursor,
            strikethrough,
            promptElement,
            transform,
            ...props
        } = this.props;

        const textProps = {
            text: this.state.input,
            placeholder: this.validateInput(this.props.placeholder),
            cursor: this.state.cursor,
            cursorWidth: this.state.cursorWidth,
            showCursor: showCursor,
            color: color,
            bold: bold,
            underline:underline,
            backgroundColor:backgroundColor,
            dimColor: dimColor,
            italic: italic,
            inverse: inverse,
            transform: transform,
            strikethrough: strikethrough,
        }

        return e(ink.Box, _extends({ref:this.ref}, props), 
            e(ink.Text, {wrap:this.props.wrap}, 
                promptElement,
                e(InputText, textProps),
            ),
        )
    }
}

InputBox.defaultProps = {
    placeholder: undefined,
    initialInput: "",
    showCursor: true,
    promptElement: undefined,
    promptOffset:0,
    onUpdate: undefined,
    multiline:false,
    disableNewlines: false,
    historyFile: undefined,
}



/**
 * HandledInputBox Props
 * @typedef {Object} HandledInputBoxTypes
 * @property {boolean} [isFocused] For focus management, if the element is handling input.
 * 
 * @typedef {InputBoxProps & HandledInputBoxTypes} HandledInputBoxProps
 */

/**
 * @type {React.FC<HandledInputBoxProps>}
 */
const HandledInputBox = React.forwardRef(({
    isFocused = true,
    ...props
}, ref) => {
    var innerRef = ref ? ref : React.createRef();

    const app = ink.useApp();

    useInput(
        (input, key) => {
            // @ts-ignore
            const currentBox = innerRef.current;
            if(key.shift && key.upArrow){
                currentBox.historyUp();
                return;
            }
            if(key.shift && key.downArrow){
                currentBox.historyDown();
                return;
            }
            if(key.ctrl && input === "e"){
                currentBox.moveCursorEndOfLine(); 
                return;
            }
            if(key.ctrl && input === "a"){
                currentBox.moveCursorStartOfLine();
                return;
            }
            if(key.upArrow){
                currentBox.moveCursorUp();
                return;
            }
            if(key.downArrow){
                currentBox.moveCursorDown();
                return;
            }
            if(key.return){
                currentBox.submit();
                return;
            }
            if(key.delete || key.backspace){
                currentBox.deleteCh(1);
                return;
            }
            if(key.ctrl && input === "w"){
                currentBox.deleteWord();
                return;
            }
            if(key.ctrl && input === "u"){
                currentBox.deleteLine();
                return;
            }
            if(key.leftArrow){
                currentBox.moveCursor(-1);
                return;
            }
            if(key.rightArrow){
                currentBox.moveCursor(1);
                return;
            }
            if(key.escape || (key.ctrl && input === "c")){
                currentBox.cancel();
                app.exit();
                return;
            }
            currentBox.append(input);
        }, {isActive: isFocused}
    );

    return e(InputBox, _extends({ref:innerRef}, props));
});


// var app;
// var el = e(HandledInputBox, {historyFile: "history.json", onSubmit: (input) => {app.unmount()}});
// app = ink.render(el);

exports.InputBox = InputBox;
exports.HandledInputBox = HandledInputBox;