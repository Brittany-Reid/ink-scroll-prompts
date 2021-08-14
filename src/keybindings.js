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
                meta: false,
                ctrl: false,
                shift: false,
            }
        },
        {
            key:{
                delete:true,
                meta: false,
                ctrl: false,
                shift: false,
            }
        }  
    ],
    deleteLine:[
        {
            key: {
                ctrl:true,
                shift:false,
                meta:false,
            },
            input:"u",
        },
        {
            key:{
                meta:true,
                backspace: true
            }
        }
    ],
    deleteWord: {
        key:{
            ctrl:true,
            shift:false,
            meta:false,
        },
        input:"w",
    },
    moveCursorEndOfLine: [
        {
            key:{
                ctrl: true,
            },
            input: "e",
        },
        {
            key:{
                ctrl: true,
                rightArrow: true
            },
        },
    ],
    moveCursorStartOfLine: 
    [
        {
            key:{
                ctrl: true,
            },
            input: "a",
        },
        {
            key:{
                ctrl: true,
                leftArrow: true
            },
        },
    ],
    moveCursorPrevWord:[
        {
            key: {
                meta:true,
            },
            input: "b"
        },
        {   
            key:{
                leftArrow:true,
                meta:true
            }
        }
    ],
    moveCursorNextWord:
    [
        {
            key: {
                meta:true,
            },
            input: "f"
        },
        {   
            key:{
                rightArrow:true,
                meta:true
            }
        }
    ],
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