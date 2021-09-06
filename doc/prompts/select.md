# `Select`

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

## Options

<details>

Accepts all `SelectComponent` properties.

### message
Type : `string`

A single line message string to display above the list. This string truncates if it is too big to be displayed. Future support for multilines may be possible when ink supports a maxHeight property.

### items
Type : `array`

An array of strings to display as options. You may also pass an array of objects with a `label` field.

### heightOffset
Type : `number`

Default `1`. Adjust the maxHeight of the component, if you want previous terminal lines to always be visable.

</details>



