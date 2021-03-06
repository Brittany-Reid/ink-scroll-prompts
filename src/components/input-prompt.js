const ink = require("@gnd/ink");
const React = require("react");
const { InputBox } = require("./input-box");
const { _extends, isKey } = require("../utils");
const { ScrollBox } = require("./scrollbox");
const { SuggestionBox } = require("./suggestion-box");
const PromptText = require("./prompt-text");
const Footer = require("./footer");
const AutoComplete = require("./auto-complete");
const useInput = require("../patch/use-input");
const { inputPromptKeyBindings } = require("../keybindings");
const cloneDeep = require("lodash.clonedeep");

const e = React.createElement;

/**
 * InputPrompt onSubmit function
 * @callback OnSubmitFunction
 * @param {string} input The current input string on submit.
 * @return 
 */

/**
 * InputPrompt onCancel function
 * @callback OnCancelFunction
 * @param {string} input The current input string on cancel.
 * @return 
 */

/**
 * @typedef {Object} InputPromptTypes
 * @property {boolean} [footer] To display footer or not. Default `false`.
 * @property {string | React.ReactElement<ink.Text>} [footerMessage] Message string or custom text element for footer.
 * @property {string} [accentColor] Accent color as a chalk color, default `cyan`.
 * @property {OnSubmitFunction} [onSubmit] Function to call on submit.
 * @property {OnCancelFunction} [onCancel] Function to call on submit.
 * @property {Array} [suggestions] Suggestions that appear in a box.
 * @property {Object} [keyBindings] Keybindings (used by footer for display).
 * @property {Object} [header] Header message string or custom element.
 * 
 * @typedef {Pick<import("./auto-complete").AutoCompleteTypes, "completions" | "complete"> & Pick<import("./suggestion-box").SuggestionBoxTypes, "suggestions" | "suggest">  & import("./scrollbox").ScrollBoxProps & import("./input-box").InputBoxProps & import("./prompt-text").PromptTextTypes & InputPromptTypes} InputPromptProps
 */


/**
 * An fully featured prompt input field.
 * This class has functions that a handler parent can call on ref.
 * @extends React.Component<InputPromptProps>
 */
class InputPrompt extends React.Component{
    /**
     * @param {InputPromptProps} props 
     */
    constructor(props){
        super(props);
        
        this.inputBoxRef = React.createRef();
        this.scrollBoxRef = React.createRef();
        // this.suggestionBoxRef = React.createRef();
        this.state = {
            suggesting: false,
            completing: false,
            scrollMaxY:0,
            cursorX: 0,
            cursorXOnSuggest: 0,
            cursorY: 0,
            canceled: false,
            submitted: false,
            scrollBoxMinHeight: this.inputMinHeight,
            scrollY: 0,
            query: "",
            suggestionBoxMaxHeight: 4,
            typed: false,
        }

        //bind handlers
        this.handleUpdate = this.handleUpdate.bind(this);
        this.handleScrollBoxUpdate = this.handleScrollBoxUpdate.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleComplete = this.handleComplete.bind(this);
        this.handleToggleComplete = this.handleToggleComplete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot){
        const {suggesting} = this.state;
        if(!suggesting && this.state.scrollBoxMinHeight !== this.inputMinHeight){
            this.setState({scrollBoxMinHeight: this.inputMinHeight});
        }

        this.updateScroll(prevState);
        this.updateSize(prevState);
    }

    updateScroll(prevState){
        const {scrollY, cursorY}  = this.state;
        if(prevState.cursorY !== cursorY || prevState.scrollMaxY !== this.state.scrollMaxY){
            if(!this.scrollBoxRef.current) return;
            var newScrollY = scrollY;
            var end = scrollY + this.inputMaxHeight;
            if(cursorY < scrollY) newScrollY = cursorY;
            if(cursorY >= end) newScrollY = cursorY;
            newScrollY = this.scrollBoxRef.current.setScrollY(newScrollY);
            if(newScrollY !== scrollY){
                this.setState({
                    scrollY: newScrollY
                })
            }
        }
    }

    updateSize(prevState){
        const {suggesting, scrollBoxMinHeight} = this.state;
        //if suggesting state changed
        if(suggesting !== prevState.suggesting){
            var newScrollBoxMinHeight = this.inputMinHeight;
            //if suggesting
            if(suggesting){
                //get the height needed to display the box, position + 4
                var heightToDisplay = this.suggestionBoxY+4;
                //if more than the current maxheight, try to shrink suggestionbox
                if(heightToDisplay > this.inputMaxHeight){
                    //what is the overflow?
                    var diff = heightToDisplay - this.inputMaxHeight;
                    if(diff > 1 && this.props.footer) diff -= 1;
                    this.setState({suggestionBoxMaxHeight: Math.max(1, 4-diff)})
                }
                //if not, set suggestionboxheight
                else{
                    this.setState({suggestionBoxMaxHeight: 4})
                }
                //set new height to smallest
                newScrollBoxMinHeight = Math.min(this.inputMaxHeight, heightToDisplay);
            }
            //if minheight changed, update state
            if(newScrollBoxMinHeight !== scrollBoxMinHeight){
                this.setState({
                    scrollBoxMinHeight: newScrollBoxMinHeight,
                })
            }
        }
    }

    /**
     * Calculate minimum required height.
     */
    get minHeight(){
        var minHeight = this.props.minHeight;
        //if minheight not given
        if(typeof minHeight === "undefined"){
            var {footer, header} = this.props;
            minHeight = 1; //default 1
            if(footer) minHeight+=1; //+1 for footer
            if(header) minHeight+=1; //+1 for header
        } 
        return minHeight;
    }

    /**
     * Calculate minimum height of the inputBox
     */
    get inputMinHeight(){
        var {footer, header} = this.props;

        var inputMinHeight = this.minHeight;
        if(footer) inputMinHeight-=1;
        if(header) inputMinHeight-=1;
        return inputMinHeight;
    }

    /**
     * Calculate maximum height of the inputBox
     */
    get inputMaxHeight(){
        var {footer, header, maxHeight} = this.props;
        var inputMaxHeight = maxHeight;
        if(footer) inputMaxHeight-=1;
        if(header) inputMaxHeight-=1;
        return inputMaxHeight;
    }

    get suggestionBoxY(){
        const {scrollY, cursorY} = this.state;
        return (cursorY - scrollY)+1;
    }

    append(ch){
        const {suggesting, query} = this.state;
        this.inputBoxRef.current.append(ch);
        if(suggesting){
            this.setState({
                query: query+ch,
            })
        }
    }
    moveCursor(n){ 
        const {suggesting} = this.state;
        if(suggesting) this.toggleSuggest();
        this.inputBoxRef.current.moveCursor(n)
    }
    moveCursorDown(){
        const {suggesting} = this.state;
        if(suggesting) return;
        this.inputBoxRef.current.moveCursorDown()
    }
    moveCursorUp(){
        const {suggesting} = this.state;
        if(suggesting) return;
        this.inputBoxRef.current.moveCursorUp()
    }
    moveCursorPrevWord(){
        const {suggesting} = this.state;
        if(suggesting) return;
        this.inputBoxRef.current.moveCursorPrevWord()
    }
    moveCursorNextWord(){
        const {suggesting} = this.state;
        if(suggesting) return;
        this.inputBoxRef.current.moveCursorNextWord()
    }
    moveCursorEndOfLine(){
        const {suggesting} = this.state;
        if(suggesting) return;
        this.inputBoxRef.current.moveCursorEndOfLine()
    }
    moveCursorStartOfLine(){
        const {suggesting} = this.state;
        if(suggesting) return;
        this.inputBoxRef.current.moveCursorStartOfLine()
    }
    deleteCh(n){
        const {suggesting, query} = this.state;
        this.inputBoxRef.current.deleteCh(n);
        if(suggesting){
            this.setState({
                query: query.substring(0, query.length-n),
            })
        }
    }
    historyUp(){this.inputBoxRef.current.historyUp()}
    historyDown(){this.inputBoxRef.current.historyDown()}
    deleteWord(){this.inputBoxRef.current.deleteWord()}
    deleteLine(){this.inputBoxRef.current.deleteLine()}
    insert(ch, n){
        this.inputBoxRef.current.insert(ch, n)
    }
    setInput(ch, resetTyped){this.inputBoxRef.current.setInput(ch, resetTyped)}

    toggleSuggest(){
        if(!this.props.suggestions || this.props.suggestions.length < 1) return;
        this.setState({
            suggesting: !this.state.suggesting,
            cursorXOnSuggest: this.state.cursorX,
            query: "",
        });
    }

    cancel(){
        this.inputBoxRef.current.cancel();
    }

    /**
     * Try to submit. Returns true if successful.
     * Can fail to submit when dealing with completions and suggestions.
     */
    submit(){
        const {suggesting, completing} = this.state;
        if(suggesting) return false;
        if(completing) return false;
        this.inputBoxRef.current.submit();
        this.setState({
            submitted: true,
            suggesting: false,
        })
        return true;
    }

    handleUpdate(input, x, y, newTyped){
        var {cursorX, cursorY, typed} = this.state;
        if(x !== cursorX || y !== cursorY || typed != newTyped){
            this.setState({
                cursorX: x,
                cursorY: y,
                typed: newTyped,
            })
        }
    }

    handleScrollBoxUpdate(height, scrollMaxX, scrollMaxY){
        if(scrollMaxY !== this.state.scrollMaxY){
            this.setState({
                scrollMaxY:scrollMaxY,
            })
        }
    }

    handleSelect(item){
        const {suggesting, query} = this.state;
        if(!suggesting) return;
        if(item) this.insert(item.label, query.length);
        this.setState({
            suggesting: false,
        })
    }

    handleCancel(input){
        this.setState({
            canceled: true,
            suggesting: false,
        });
        if(typeof this.props.onCancel === "function") this.props.onCancel(input);
    }

    handleComplete(match, lastWord){
        if(match) this.insert(match, lastWord.length);
    }

    handleToggleComplete(state){
        const {suggesting, completing, typed} = this.state;
        //ignore completes when suggesting
        if(suggesting) state = false;
        if(!typed) state = false;
        if(state != completing){
            this.setState({
                completing: state
            })
        }
        return state;
    }

    render(){
        const {
            suggesting, 
            canceled, 
            submitted,
            query,
            suggestionBoxMaxHeight
        } = this.state;

        var {
            onCancel,
            onSubmit,
            multiline,
            prefix,
            suggest,
            message,
            seperator,
            accentColor,
            placeholder,
            initialInput,
            disableNewlines,
            suggestions,
            wrap,
            footer,
            footerMessage,
            keyBindings,
            overflowX,
            overflowY,
            transform,
            color,
            historyFile,
            newlineOnDown,
            header,
            ...props
        } = this.props;

        const promptTextProps = {
            prefix:prefix,
            message:message,
            seperator:seperator,
            accentColor: accentColor,
            color: color,
            dimColor: canceled ? true : false,
        }

        const scrollBoxProps = {
            overflowX: overflowX,
            overflowY: overflowY,
            maxHeight: this.inputMaxHeight,
            minHeight: this.state.scrollBoxMinHeight,
            onSizeChange: this.handleScrollBoxUpdate,
            ref: this.scrollBoxRef,
        }

        const inputBoxProps = canceled ? {dimColor: true} : submitted ? {} : {
            placeholder:placeholder,
            initialInput: initialInput,
            historyFile: historyFile,
            ref: this.inputBoxRef,
            promptOffset: calculatePromptOffset(prefix, message, seperator),
            promptElement: e(PromptText, promptTextProps),
            multiline:multiline,
            disableNewlines: disableNewlines,
            wrap:wrap,
            color: color,
            onUpdate: this.handleUpdate,
            transform: transform,
            width:"100%",
            onCancel: this.handleCancel,
            onSubmit: onSubmit,
            newlineOnDown: newlineOnDown,
        }

        const footerProps = {
            message: footerMessage,
            keyBindings: keyBindings,
            color:color,
            backgroundColor: accentColor,
            suggestionsEnabled: (suggestions && suggestions.length > 0) ? true : false,
        }

        const headerProps = {
            width: "100%",
            height:1,
            overflow:"hidden",
            flexDirection: "column"
        }

        const suggestionBoxProps = {
            display: suggesting ? "flex" : "none",
            isFocused: suggesting,
            suggestions: suggestions,
            suggest: suggest,
            position:"absolute",
            marginTop: this.suggestionBoxY,
            marginLeft: this.state.cursorXOnSuggest,
            onSelect: this.handleSelect,
            maxHeight: suggestionBoxMaxHeight,
            minHeight:1,
            accentColor: accentColor,
            color: color,
            query: query,
        }

        const autoCompleteProps = {
            marginTop: this.suggestionBoxY-1,
            position: "absolute",
            xOffset: this.state.cursorX,
            complete: this.props.complete,
            completions: this.props.completions,
            cursor: this.inputBoxRef.current? this.inputBoxRef.current.state.cursor : undefined,
            input: this.inputBoxRef.current? this.inputBoxRef.current.state.input : undefined,
            toggleComplete: this.handleToggleComplete,
            onComplete: this.handleComplete,
        }

        if(canceled || submitted){
            return e(ink.Static, {items:[1]}, item =>
                e(ink.Box, {flexDirection:"column", overflow:"hidden", key:1},
                    e(ink.Text, {}, 
                        e(PromptText, promptTextProps),
                        e(ink.Text, inputBoxProps, this.inputBoxRef.current.state.input.trimEnd())
                    )
                )
            )
        }

        var footerElement = null;
        var headerElement = null;
        if(footer) footerElement = e(Footer, footerProps);
        if(header){
            if(typeof header === "string"){
                headerElement = e(ink.Box, headerProps,
                    e(ink.Text, {wrap: "truncate"}, header)
                );
            }
            else{
                headerElement = e(ink.Box, headerProps, header);
            }
        }
        return e(ink.Box, _extends({flexDirection:"column", overflow:"hidden"}, props),
            headerElement,
            e(ScrollBox, scrollBoxProps,
                e(InputBox, inputBoxProps)
            ),
            footerElement,
            e(SuggestionBox, suggestionBoxProps),
            e(AutoComplete, autoCompleteProps)
        );
    }
}

function calculatePromptOffset(prefix, message, seperator) {
    var promptOffset = 0;
    for(var part of [prefix, message, seperator]){
        //for each existing part, the length + 1 for space
        if(part) promptOffset += part.length + 1;
    }
    return promptOffset;
}

/**
 * @type {InputPromptProps}
 */
InputPrompt.defaultProps = {
    prefix: "",
    message: "",
    seperator: ">",
    accentColor: "cyan",
    footer: false,
    maxHeight: 4,
    overflowX: "hidden",
}

InputPrompt.defaultKeyBindings = inputPromptKeyBindings;


/**
 * @typedef {Object} HandledInputPromptTypes
 * @property {boolean} [isFocused] If InputPrompt is accepting input.
 * @property {boolean} [useDefaultKeys] To use the default keys.
 * @property {Object} [additionalKeys] Supplied additional keys.
 * 
 * @typedef {InputPromptProps & HandledInputPromptTypes} HandledInputPromptProps
 */

/**
 * Input prompt that handles input.
 * @type {React.FC<HandledInputPromptProps>}
 */
const HandledInputPrompt = React.forwardRef(({
    useDefaultKeys = true,
    additionalKeys = undefined,
    isFocused = true,
    ...props
}, ref) => {
    const {exit} = ink.useApp();
    const {stdout} = ink.useStdout();

    //references
    const innerRef = ref ? ref : React.useRef();

    //get keys
    const keys = React.useMemo(()=>{
        var keys = {};
        if(useDefaultKeys) keys = cloneDeep(InputPrompt.defaultKeyBindings);
        if(additionalKeys){
            var ks = Object.keys(additionalKeys);
            for(var k of ks){
                var value = additionalKeys[k];
                if(!keys[k]){
                    keys[k] = value;
                }
                else{
                    if(Array.isArray(keys[k])) keys[k].push(value);
                    else{
                        keys[k] = [keys[k], value];
                    }
                }
            }
        }
        return keys;

    }, [useDefaultKeys, additionalKeys])

    //get actions
    const actions = React.useMemo(()=>{
        if(!innerRef) return {};
        return {
            submit: () => {
                if(innerRef.current.submit()){
                    exit();
                    stdout.moveCursor(0, -1);
                }
            },
            cancel: () => {
                innerRef.current.cancel();
                stdout.moveCursor(0, -1);
                exit();
            },
            moveCursorLeft: (n = 1) => {
                innerRef.current.moveCursor(-n);
            },
            moveCursorRight: (n = 1) => {
                innerRef.current.moveCursor(n);
            },
            moveCursorUp: () => {
                innerRef.current.moveCursorUp();
            },
            moveCursorDown: () => {
                innerRef.current.moveCursorDown();
            },
            deleteCh:(n) => {
                innerRef.current.deleteCh(n);
            },
            toggleSuggest: () => {
                innerRef.current.toggleSuggest();
            },
            deleteLine:()=>{
                innerRef.current.deleteLine();
            },
            deleteWord:()=>{
                innerRef.current.deleteWord();
            },
            moveCursorEndOfLine:()=>{
                innerRef.current.moveCursorEndOfLine();
            },
            moveCursorStartOfLine:()=>{
                innerRef.current.moveCursorStartOfLine();
            },
            setInput: (ch, resetTyped) => {
                innerRef.current.setInput(ch, resetTyped);
            },
            append: (s) => {
                innerRef.current.append(s);
            },
            historyUp: () => {
                innerRef.current.historyUp();
            },
            historyDown: () => {
                innerRef.current.historyDown();
            },
            moveCursorPrevWord:()=>{
                innerRef.current.moveCursorPrevWord();
            },
            moveCursorNextWord:()=>{
                innerRef.current.moveCursorNextWord();
            }
        }
    }, [innerRef])

    const InputProps = {
        ref:innerRef,
        keyBindings: keys,
    }

    useInput(
        (input, key) => {
            var keyBindings = Object.keys(keys);
            for(var kb of keyBindings){
                var bindings = keys[kb];
                if(!Array.isArray(bindings)){
                    bindings = [bindings];
                }
                for(var b of bindings){
                    if(isKey(key, input, b)){
                        var args = b.args || [];
                        var action = actions[kb];
                        if(action) action(...args);
                    }
                }
            }
            var wasKey = false;
            for(var k of Object.keys(key)){
                if(key[k] === true){
                    if(k === "shift") continue;
                    wasKey = true;
                }
            }
                
            if(!wasKey) innerRef.current.append(input);
        }, {isActive: isFocused}
    );

    return e(InputPrompt, _extends(props, InputProps));
});

module.exports.InputPrompt = InputPrompt;
module.exports.HandledInputPrompt = HandledInputPrompt;