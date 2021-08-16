<table>
<tr>
<td>
⚠️ Ink Scroll Prompts is experimental. 
</td>
</tr>
</table>

# Ink Scroll Prompts

<img src="assets/media/scroll.gif"/>

Prompts that scroll. Using ink.

## Install

<details>

The package is currently not published on NPM.

You can install it from GitHub using:

```sh
npm install --save "https://github.com/Brittany-Reid/ink-scroll-prompts.git"
```

I recommend using a specific commit using:

```
npm install --save "https://github.com/Brittany-Reid/ink-scroll-prompts.git#commit"
```
</details>

## Usage

<details>

See the examples in the example folder.

</details>

## Components
<details>

### `InputPrompt`

An input prompt, which can be used to accept text input, provide completions and suggestions.

####  Properties

##### initialText

Type : `string`

Set an initial input string.

##### placeholder

Type : `string`

Set a placeholder string that appears when input is empty.

##### completions

Type : `Array<string>`

Array of string completions that display inline at the end of input as you type.

##### complete

Type : `function(input : string, lastWord : string, cursor : number, completions : Array<String>) : string`

Custom complete function. Returns a string match.

##### multiline

Type : `boolean`

Allow user to insert a newline using cursorDown on last line. Default `false`.

Initial input and copy-pasted input can still include newlines.

##### disableNewLines

Type : `boolean`

If multiline is `false`, disable newlines in input. This enforces no newlines in initial input and copy pasted input. Default `false`.



### `HandledInputPrompt`

InputPrompt, but handles `ink.useInput` for you automatically.
</details>

## Keybindings

While you can create your own components that handle input, each component already has a handled version with default handling.


| KeyBinding | Command | Details |
| - | - | - |
| <kbd>return</kbd> | Submit |  |
| <kbd>escape</kbd> | Cancel |  |
| <kbd>delete</kbd> | Delete Character | |
| <kbd>meta</kbd> + <kbd>delete</kbd> | Delete word | <kbd>ctrl</kbd> + <kbd>w</kbd> also works. |
| <kbd>ctrl</kbd> + <kbd>delete</kbd> | Delete line | <kbd>ctrl</kbd> + <kbd>u</kbd> also works. See [issue](https://github.com/Brittany-Reid/ink-scroll-prompts/issues/1).|
| <kbd>ctrl</kbd> + <kbd>←</kbd> | Move to line start | See [issue](https://github.com/Brittany-Reid/ink-scroll-prompts/issues/2).|
| <kbd>ctrl</kbd> + <kbd>➞</kbd> | Move to line end | See [issue](https://github.com/Brittany-Reid/ink-scroll-prompts/issues/2).|
| <kbd>meta</kbd> + <kbd>←</kbd> | Previous Word | <kbd>meta</kbd> + <kbd>b</kbd> also works. See [issue](https://github.com/Brittany-Reid/ink-scroll-prompts/issues/3). |
| <kbd>meta</kbd> + <kbd>➞</kbd> | Next word | <kbd>meta</kbd> + <kbd>f</kbd> also works. See [issue](https://github.com/Brittany-Reid/ink-scroll-prompts/issues/3). |
| <kbd>↑</kbd> | Cursor Line Up | |
| <kbd>↓</kbd> | Cursor Line Down | |

<kbd>meta</kbd> is equivalent to Alt on Windows and Option on Mac. You may need to enable the use of Option as Meta on Mac.

## Caveats
<details>

- Ink Scroll Prompts uses a fork of ink to access the unreleased overflow property that enables scrolling.
- The ColorBox implementation is a hack that uses text background colour. If you use text in a ColorBox, you need to set the same background colour on that text. ColorBox also measures the box size before filling and this can cause issues.
- The scrollbox implementation is full of bugs but it does what I want so.
- I don't want to use typescript or JSX. 
</details>

## License

Unlicense. Do what you want with it.
