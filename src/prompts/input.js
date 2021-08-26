const React = require("react");
const Fullscreen = require("../components/fullscreen");
const { HandledInputPrompt } = require("../components/input-prompt");
const Prompt = require("./Prompt");

const e = React.createElement;

/**
 * InputPrompt class.
 */
class Input extends Prompt{
    /**
     * @param {Object} [properties]
     * @param {number} [properties.heightOffset] Adjust maxHeight.
     * @param {string} [properties.prefix] Prompt prefix. `NAME` in `NAME [opts] >`.
     * @param {string} [properties.message] Prompt message. `[opts]` in `NAME [opts] >`.
     * @param {string} [properties.seperator] Prompt seperator. `>` in `NAME [opts] >`.
     * @param {import("../types").Color} [properties.accentColor] Default `cyan`.
     * @param {string} [properties.initialInput] Start the input with an initial string. Default empty.
     * @param {string} [properties.placeholder] Placeholder string that only shows on empty input. Default `undefined`.
     * @param {boolean} [properties.multiline] Allow multiline controls. Enables down to add newlines.
     */
    constructor(properties){
        super(properties);
        this.component = HandledInputPrompt;
        this.properties.heightOffset = 1;
    }

    //inputPrompt handles exit
    onSubmit(value){}

    //inputPrompt handles exit
    onCancel(){}

    createElement(){
        if(this.component) return e(Fullscreen, {
            component: this.component,
            ...this.properties
        });
    }
}

module.exports = Input;