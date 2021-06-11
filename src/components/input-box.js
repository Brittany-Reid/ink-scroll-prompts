const ink = require("@gnd/ink");
const React = require("react");
const wrapAnsi = require("wrap-ansi");
const {_extends, fixedCharAt, fixedSubstring, fixedCharLength, getLastWord } = require("../utils");
const InputText = require("./input-text");
const e = React.createElement;

/**
 * An input field that has more advanced functionality.
 * This class has functions that a handler parent can call on ref.
 * It needs to be an Ink.Box to measure width and handle cursor down.
 * 
 * @extends React.Component<import("../types").InputBoxProps>
 */
class InputBox extends React.Component{
    /**
     * @param {import("../types").InputBoxProps} props 
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
    }

    componentDidUpdate(prevProps, prevState, snapshot){
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
            typed: !!resetTyped,
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
}

/**
 * @type {React.FC<import("../types").HandledInputBoxProps>}
 */
const HandledInputBox = React.forwardRef(({
    onSubmit,
    isFocused = true,
    ...props
}, ref) => {
    var innerRef = ref ? ref : React.createRef();

    ink.useInput(
        (input, key) => {
            if(key.ctrl && input === "e"){
                // @ts-ignore
                innerRef.current.moveCursorEndOfLine(); 
                return;
            }
            if(key.ctrl && input === "a"){
                // @ts-ignore
                innerRef.current.moveCursorStartOfLine();
                return;
            }
            if(key.upArrow){
                // @ts-ignore
                innerRef.current.moveCursorUp();
                return;
            }
            if(key.downArrow){
                // @ts-ignore
                innerRef.current.moveCursorDown();
                return;
            }
            if(key.return){
                // @ts-ignore
                if(typeof onSubmit === "function") onSubmit(innerRef.current.state.input);
                return;
            }
            if(key.delete || key.backspace){
                // @ts-ignore
                innerRef.current.deleteCh(1);
                return;
            }
            if(key.ctrl && input === "w"){
                // @ts-ignore
                innerRef.current.deleteWord();
                return;
            }
            if(key.ctrl && input === "u"){
                // @ts-ignore
                innerRef.current.deleteLine();
                return;
            }
            if(key.leftArrow){
                // @ts-ignore
                innerRef.current.moveCursor(-1);
                return;
            }
            if(key.rightArrow){
                // @ts-ignore
                innerRef.current.moveCursor(1);
                return;
            }
            if(key.escape) return;
            // @ts-ignore
            innerRef.current.append(input);
        }, {isActive: isFocused}
    );

    return e(InputBox, _extends({ref:innerRef}, props));
});

e(InputBox, {wrap: "wrap"})

exports.InputBox = InputBox;
exports.HandledInputBox = HandledInputBox;