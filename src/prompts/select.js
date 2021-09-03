const React = require("react");
const Fullscreen = require("../components/fullscreen");
const SelectComponent = require("../components/prompts/select-component");
const Prompt = require("./prompt");

const e = React.createElement;

/**
 * InputPrompt class.
 */
class Select extends Prompt{
    /**
     * @param {Object} [properties]
     * @param {number} [properties.heightOffset] Adjust maxHeight.
     * @param {string} [properties.message] Optional message to display above items
     * @param {Array} properties.items Items to select
     */
    constructor(properties){
        super(properties);
        this.component = SelectComponent;
        this.properties.heightOffset = 1;
    }

    onSubmit(value){
        this.app.unmount();
    }

    onCancel(){
        this.app.unmount();
    }

    createElement(){
        if(this.component) return e(Fullscreen, {
            component: this.component,
            ...this.properties
        });
    }
}

module.exports = Select;