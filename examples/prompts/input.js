const {Input} = require("ink-scroll-prompts");

var prompt = new Input({
    prefix: "Write something",
    seperator: "!",
    multiline: true,
});

prompt.run()
    .then(response =>console.log("You wrote: " + response))
    .catch(e => {})