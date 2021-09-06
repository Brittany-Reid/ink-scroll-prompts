const {Select} = require("ink-scroll-prompts");

async function main(){
    var prompt = new Select({
        message: "Save and exit?",
        items: ["Save and exit", "Exit without saving", "Cancel"]
    });

    var result = await prompt.run();
}