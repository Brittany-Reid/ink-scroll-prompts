# Usage

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











