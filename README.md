<table>
<tr>
<td>
⚠️ Ink Scroll Prompts is experimental. The API is not stable!
</td>
</tr>
</table>

# Ink Scroll Prompts 

![tests](https://github.com/Brittany-Reid/ink-scroll-prompts/actions/workflows/test.yml/badge.svg)

<p align="center">
<img src="/assets/media/input.gif"/>
</p>

Prompts that scroll. Using ink. 🎉

`ink-scroll-prompts` enables you to display and interact with strings of large or unknown length. It was build to implement a REPL that could suggest code snippets mined from NPM package documentation. It's an alternative to existing prompt packages, or full screen curses apps which use the alternate screen buffer. `ink-scroll-prompts` preserves the terminal history for more traditional command line interfaces.
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

You can run an `Input` prompt using:

```js
const {Input} = require("ink-scroll-prompts");

var prompt = new Input({
    prefix: "Write something",
    seperator: "!",
    multiline: true,
});

prompt.run()
    .then(response =>console.log("You wrote: " + response))
    .catch(e => {})
```
*[Full Example](/examples/prompts/input.js)*

Or, use the components and ink for advanced UIs!

See the [examples](/examples) folder for more usage examples.











## Prompts
<details>

### `Input`

An input prompt, extending `Prompt`. It implements a `HandledInputPrompt`.

#### Options

<details>

Accepts all `HandledInputPrompt` properties.

##### heightOffset

Default `1`. Adjust the maxHeight of the component, if you want previous terminal lines to always be visable.

</details>


### `Select`

A prompt for selecting from a list, extending `Prompt`. It implements a `SelectComponent`.

```js
const {Select} = require("ink-scroll-prompts");

async function main(){
    var prompt = new Select({
        message: "Save and exit?",
        items: ["Save and exit", "Exit without saving", "Cancel"]
    });

    var result = await prompt.run();
}
```
*[Full Example](/examples/prompts/select.js)*

#### Options

<details>

Accepts all `SelectComponent` properties.

##### message
Type : `string`

A single line message string to display above the list. This string truncates if it is too big to be displayed. Future support for multilines may be possible when ink supports a maxHeight property.

##### items
Type : `array`

An array of strings to display as options. You may also pass an array of objects with a `label` field.

##### heightOffset
Type : `number`

Default `1`. Adjust the maxHeight of the component, if you want previous terminal lines to always be visable.

</details>



</details>

## Components
<details>

### `InputPrompt`

An input prompt, which can be used to accept text input, provide completions and suggestions.

```js
ink.render(e(Inputprompt, properties));
```

#### Properties

<details>

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

##### newlineOnDown
Type : `boolean`

If multiline is `true`, disable newlines on cursor down. Useful if mapping newline to a specific key, see the [editor prompt](/examples/components/editor-prompt) example.

##### accentColor
Type : `string`

The accent colour, a string recognized by ink and chalk. Default: `cyan`.

</details>

### `HandledInputPrompt`

An `InputPrompt` that implements `ink.useInput` for you. It accepts all of `InputPrompt`'s properties. 

```js
ink.render(e(HandledInputprompt, properties));
```

#### Properties

<details>

##### useDefaultKeys
Type : `boolean`

If `HandledInputPrompt` should use the default keybindings defined at `InputPrompt.DefaultKeyBindings`. Default: `true`.

##### additionalKeys
Type : `object`

Supply custom keybindings. If `useDefaultKeys` is false, this will be the only keybindings, if true, it will only be combined with existing keys. To overwrite keybindings, set `useDefaultKeys` false, and supply a modified copy of `InputPrompt.DefaultKeyBindings` here.


</details>

### `InputBox`

And Input Box is the base component for accepting and navigating text input.
</details>

## Keybindings
<details>


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
</details>

## Testing
<details>


This project uses mocha and nyc to test. You can run the tests using:

```sh
npm test
```

```
npm run coverage
```

To test, this project uses a non-exported patch of `ink-testing-library` available [here](/src/patch/ink-testing-library.js) that uses the neccessary fork, however, this will be removed when no longer necessary. The [test-utils](/src/test-utils.js) file also contains functions used to test components. For testing your own code, I recommend copying these files into your project.

</details>

## License

Unlicense. Do what you want with it. ❤️

 *This file was automatically generated.*