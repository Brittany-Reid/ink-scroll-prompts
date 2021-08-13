/**
 * Default KeyBindings across components.
 */

const { _extends } = require("./utils")

const inputBoxKeyBindings = {
    submit:{
        key:{
            return:true,
        }
    },
    cancel:[
        {
            key:{
                escape: true,
            }
        },
        {
            key:{
                ctrl: true,
            },
            input: "c"
        }
    ],
    moveCursorLeft:{
        key: {
            leftArrow: true,
            shift:false,
            ctrl:false,
        },
    },
    moveCursorRight:{
        key: {
            rightArrow: true,
            shift:false,
            ctrl:false,
        },
    },
    deleteCh:[
        {
            key:{
                backspace:true,
            }
        },
        {
            key:{
                delete:true,
            }
        }  
    ],
    deleteLine:{
        key: {
            ctrl:true,
            shift:false,
            meta:false,
        },
        input:"u",
    },
    deleteWord: {
        key:{
            ctrl:true,
            shift:false,
            meta:false,
        },
        input:"w",
    },
    moveCursorEndOfLine: {
        key:{
            ctrl: true,
        },
        input: "e",
    },
    moveCursorStartOfLine: {
        key:{
            ctrl: true,
        },
        input: "a",
    },
    moveCursorPrevWord:{
        key: {
            meta:true,
        },
        input: "b"
    },
    moveCursorNextWord:{
        key: {
            meta:true,
        },
        input: "f"
    },
    historyUp: {
        key:{
            shift:true,
            upArrow: true,
            ctrl:false,
        }
    },
    historyDown: {
        key:{
            downArrow: true,
            ctrl:false,
            shift: true,
        }
    },
    moveCursorUp:{
        key: {
            upArrow: true,
            shift:false,
            ctrl:false,
        },
    },
    moveCursorDown:{
        key: {
            downArrow: true,
            shift:false,
            ctrl:false,
        },
    },
}

const inputPromptKeyBindings = _extends(inputBoxKeyBindings, {
    toggleSuggest: {
        key:{
            tab:true,
        }
    },
})



module.exports = {
    inputBoxKeyBindings,
    inputPromptKeyBindings
}