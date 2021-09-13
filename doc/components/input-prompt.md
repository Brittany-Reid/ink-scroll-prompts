# `InputPrompt`

An input prompt, which can be used to accept text input, provide completions and suggestions.

```js
ink.render(e(Inputprompt, properties));
```

## Properties

<details>

### initialText
Type : `string`

Set an initial input string.

### placeholder
Type : `string`

Set a placeholder string that appears when input is empty.

### completions
Type : `Array<string>`

Array of string completions that display inline at the end of input as you type.

### complete
Type : `function(input : string, lastWord : string, cursor : number, completions : Array<String>) : string`

Custom complete function. Returns a string match.

### multiline
Type : `boolean`

Allow user to insert a newline using cursorDown on last line. Default `false`.

Initial input and copy-pasted input can still include newlines.

### disableNewLines
Type : `boolean`

If multiline is `false`, disable newlines in input. This enforces no newlines in initial input and copy pasted input. Default `false`.

### newlineOnDown
Type : `boolean`

If multiline is `true`, disable newlines on cursor down. Useful if mapping newline to a specific key, see the [editor prompt](/examples/components/editor-prompt) example.

### accentColor
Type : `string`

The accent colour, a string recognized by ink and chalk. Default: `cyan`.

### footer
Type : `boolean`

To display a footer. Default: `false`.

### footerMessage
Type : `string` | `React.element`

Message to display in footer, or, if you supply a custom element, this overwrites the default footer.

### header
Type : `string` | `React.element`

Single line of text to display above input, or, a custom element.

</details>