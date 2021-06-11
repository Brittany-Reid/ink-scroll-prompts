/**
 * @fileoverview Define common types for input completion.
 */

/*eslint-disable*/
const ink = require("@gnd/ink");
/*eslint-enable*/


/** @type {any} */
module.exports = {};

/**
 * Any string to get string suggestions to work >.<
 * @typedef {string & {}} AnyString
 */

/**
 * Color suggestions
 * @typedef {'black' | 'red' | 'green' | 'yellow' | 'cyan' | 'blue' | 'magenta' | 'white' | 'grey' | 'gray' | AnyString} Color 
 */

/**
 * ColorBox Props
 * @typedef {Object} ColorBoxTypes
 * @property {Color} [backgroundColor] Background color of the box.
 * 
 * @typedef {ink.BoxProps & ColorBoxTypes} ColorBoxProps
 */

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
 * @property {boolean} [multiline]  Allow multiline controls. Enables down to add newlines.
 * @property {boolean} [disableNewlines] If multiline is also false, remove newlines from input. Doesn't control wrap.
 * @property {React.ReactElement | string | null} [promptElement] To use a prompt, supply a text element here.
 * @property {number} [promptOffset] The offset caused by the prompt text.
 * @property {OnUpdateFunction} [onUpdate] Function to call on component update. Reports cursor position. You can use this to message parent about updates.
 * @property {'wrap' | 'truncate' | 'truncate-end' | 'truncate-start' | 'truncate-middle'} [wrap] Ink wrap type.
 * 
 * @typedef {ink.BoxProps & InputTextProps & InputBoxTypes} InputBoxProps
 */


/**
 * HandledInputBox onSubmit function
 * @callback OnSubmitFunction
 * @param {string} input The current input string on submit.
 * @return 
 */

/**
 * HandledInputBox Props
 * @typedef {Object} HandledInputBoxTypes
 * @property {OnSubmitFunction} [onSubmit] Function to be called on submit.
 * @property {boolean} [isFocused] For focus management, if the element is handling input.
 * 
 * @typedef {InputBoxProps & HandledInputBoxTypes} HandledInputBoxProps
 */

/**
 * @typedef {Object} PromptTypes
 * @property {string} [prefix] Prompt prefix. `NAME` in `NAME [opts] >`.
 * @property {string} [message] Prompt message. `[opts]` in `NAME [opts] >`.
 * @property {string} [seperator] Prompt seperator. `>` in `NAME [opts] >`.
 * @property {Color} [accentColor] Color the prefix of the prompt.
 * 
 * @typedef {ink.TextProps & PromptTypes} PromptProps
 */

/**
 * ScrollBox onSizeChange function
 * @callback OnSizeChangeFunction
 * @param {number} height
 * @param {number} scrollMaxX
 * @param {number} scrollMaxY
 */

/**
 * @typedef {Object} ScrollBoxTypes
 * @property {boolean} [arrows] To display arrows on scrollbars.
 * @property {"auto" | "hidden" | "scroll"} [overflow] If scrollbars should appear auto, not at all, or always.
 * @property {"auto" | "hidden" | "scroll"} [overflowX] Set scrolling mode specifically for the x-axis.
 * @property {"auto" | "hidden" | "scroll"} [overflowY] Set scrolling mode specifically for the y-axis.
 * @property {Color} [scrollbarColor] Colour of the scrollbars.
 * @property {number} [maxHeight] MaxHeight of the scrollbox as a number.
 * @property {number} [maxWidth] MaxWidth of the scrollbox as a number. Currently not implemented.
 * @property {OnSizeChangeFunction} [onSizeChange] Function called on size changes.
 * @property {*} [containerRef] Ref to access the scroll container, which holds the content but not scrollbars.
 * 
 * @typedef {Omit<ink.BoxProps, "overflow"> & ScrollBoxTypes} ScrollBoxProps
 */

/**
 * Handled ScrollBox Props
 * @typedef {Object} HandledScrollBoxTypes
 * @property {boolean} [isFocused] If ScrollBox is accepting input.
 * 
 * @typedef {ScrollBoxProps & HandledScrollBoxTypes} HandledScrollBoxProps
 */

/**
 * @typedef {Object} ItemComponentTypes
 * @property {string} label Label to display, required.
 * @property {boolean} [isSelected]
 * @property {Color} [accentColor]
 * 
 * @typedef {ink.TextProps & ItemComponentTypes} ItemComponentProps
 */

/** 
 * @typedef {Object} ScrollMenuTypes
 * @property {Array} [items] Array of item property objects.
 * @property {number} [initialIndex] The index to select initially.
 * @property {React.ComponentType<any>} [itemComponent] Component to create for items.
 * @property {OnSelectFunction} [onSelect] Function to call on select.
 * @property {boolean} [isFocused] If suggestionBox is focused, otherwise it doesn't use input.
 * 
 * @typedef {ScrollBoxProps & ScrollMenuTypes} ScrollMenuProps
 */



/**
 * SuggestionBox filter function.
 * @callback SuggestFunction
 * @param {string} query
 * @param {Array} suggestions
 * @return {Array}
 */

/**
 * SuggestionBox filter function.
 * @callback OnSelectFunction
 * @param {Object} selectedItem Item that was selected.
 * @return
 */

/**
 * SuggestionBox Props.
 * @typedef {Object} SuggestionBoxTypes
 * @property {string} [query] Query to filter suggestions by.
 * @property {Array} [suggestions] List of suggestion items, for example `{label:"a"}`.
 * @property {SuggestFunction} [suggest] Function to filter suggestions based on query string.
 * @property {Color} [accentColor] Accent colour, for selected item.
 * @property {OnSelectFunction} [onSelect] Function to call on select an item.
 * @property {number} [maxHeight] Max height.
 * @property {boolean} [isFocused] If suggestionBox is focused, otherwise it doesn't use input.
 * 
 * @typedef {ColorBoxProps & SuggestionBoxTypes} SuggestionBoxProps
 */

/**
 * @typedef {Object} FooterTypes
 * @property {string | React.ReactElement} [message] Message string or custom text element.
 * @property {boolean} [suggestionsEnabled] Are suggestions enabled in prompt?
 * @property {Color} [backgroundColor]
 * @property {Color} [color]
 * @property {Object} [keyBindings] Keybindings used to generate footer.
 * 
 * @typedef {FooterTypes} FooterProps
 */

/**
 * onComplete function.
 * @callback completeFunction Complete Function
 * @param {string} input Current input
 * @param {string} lastWord The last word in the input.
 * @param {number} cursor Current cursor index.
 * @param {Array<String>} completions Array of supplied completions.
 * @return {string} Returns completion to display.
 */

/**
 * AutoComplete Props
 * @typedef {Object} AutoCompleteTypes
 * @property {number} [xOffset] Offset to display the text at.
 * @property {string} [input] Current input string to generate completes from.
 * @property {number} [cursor] Current cursor position as index of input.
 * @property {Array} [completions] Array of inline completions. The default algorithm will match input to these.
 * @property {completeFunction} [complete] Custom complete function.
 * @property {Function} [toggleComplete] Toggle complete.
 * @property {Function} [onComplete] Behaviour on complete.
 * @property {boolean} [isFocused] If autocomplete is accepting input.
 * @typedef {ink.BoxProps & AutoCompleteTypes} AutoCompleteProps
 */

/**
 * @typedef {Object} InputPromptTypes
 * @property {boolean} [footer] To display footer or not. Default `false`.
 * @property {string | React.ReactElement<ink.Text>} [footerMessage] Message string or custom text element for footer.
 * @property {string} [accentColor] Accent color as a chalk color, default `cyan`.
 * @property {OnSubmitFunction} [onSubmit] Function to call on submit.
 * @property {Array} [suggestions] Suggestions that appear in a box.
 * @property {Object} [keyBindings] Keybindings (used by footer for display).
 * 
 * @typedef {Pick<AutoCompleteTypes, "completions" | "complete"> & Pick<SuggestionBoxTypes, "suggestions" | "suggest">  & ScrollBoxProps & InputBoxProps & PromptTypes & InputPromptTypes} InputPromptProps
 */

/**
 * @typedef {Object} HandledInputPromptTypes
 * @property {boolean} [isFocused] If InputPrompt is accepting input.
 * @property {boolean} [useDefaultKeys] To use the default keys.
 * @property {Object} [additionalKeys] Supplied additional keys.
 * 
 * @typedef {InputPromptProps & HandledInputPromptTypes} HandledInputPromptProps
 */