const ink = require("@gnd/ink");
const React = require("react");
const { _extends, fixedCharAt, getLastWord } = require("../utils");

const e = React.createElement;

/**
 * Default Complete Function
 * @type {import("../types").completeFunction}
 */
const defaultComplete = (input, lastWord, cursor, completions) => {
    var match;
    var matches = [];
    for(var c of completions){
        if(c.startsWith(lastWord)){
            matches.push(c);
        }
    }
    if(matches[0]) match = matches[0];
    return match;
}

/**
 * AutoComplete component, displays inline completions.
 * @type {React.FC<import("../types").AutoCompleteProps>}
 */
const AutoComplete = ({
    input,
    cursor,
    xOffset,
    completions = [],
    complete = defaultComplete,
    toggleComplete,
    onComplete,
    isFocused = true,
    ...props
}) => {
    const [completing, setCompleting] = React.useState(false);
    const [match, setMatch] = React.useState("");
    const [lastWord, setLastWord] = React.useState("");

    const toggle = React.useCallback((state) => {
        if(typeof toggleComplete === "function") state = toggleComplete(state);
        setCompleting(state);
    }, [toggleComplete]);

    const handleOnComplete = React.useCallback((match, lastWord)=>{
        if(typeof onComplete === "function") onComplete(match, lastWord);
    }, [onComplete])

    React.useEffect(()=>{
        if(!input || cursor < input.length){
            setMatch("");
            toggle(false);
            return;
        }
        var lastWord = getLastWord(input);
        setLastWord(lastWord);
        var newMatch = complete(input, lastWord, cursor, completions);
        if(!newMatch) newMatch = "";
        if(lastWord === newMatch) newMatch = "";
        if(newMatch){
            toggle(true);
        }
        else{
            toggle(false);
        }
        setMatch(newMatch);
    }, [input, cursor]);

    const getOutput = React.useCallback(()=>{
        if(!match) return null;

        var toDisplay = match.substring(lastWord.length);
        var cursorChar = fixedCharAt(toDisplay);
        var rest = toDisplay.substring(cursorChar.length);

        return e(ink.Text, {},
            e(ink.Text, {inverse:true}, cursorChar),
            e(ink.Text, textProps, rest),
        );
    }, [match, lastWord])

    ink.useInput((input, key)=>{
        if(!completing) return;
        if(key.rightArrow){
            handleOnComplete(match, lastWord);
            return;
        }
        if(key.return){
            handleOnComplete(match, lastWord);
            return;
        }
    }, {isActive:isFocused})

    const boxProps = {
        paddingLeft: xOffset,
        display: completing? "flex" : "none",
        height:1,
        overflow:"hidden",
    }

    const textProps = {
        dimColor: true,
    }

    return e(ink.Box, _extends(boxProps, props),
        getOutput()
    );
}

module.exports = AutoComplete;