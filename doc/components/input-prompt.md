# `InputPrompt`

An input prompt, which can be used to accept text input, provide completions and suggestions.

## Properties

## initialText

Type : `string`

Set an initial input string.

## placeholder

Type : `string`

Set a placeholder string that appears when input is empty.

## completions

Type : `Array<string>`

Array of string completions that display inline at the end of input as you type.

## complete

Type : `function(input : string, lastWord : string, cursor : number, completions : Array<String>) : string`

Custom complete function. Returns a string match.

## multiline

Type : `boolean`

Allow user to insert a newline using cursorDown on last line. Default `false`.

Initial input and copy-pasted input can still include newlines.

## disableNewLines

Type : `boolean`

If multiline is `false`, disable newlines in input. This enforces no newlines in initial input and copy pasted input. Default `false`.
