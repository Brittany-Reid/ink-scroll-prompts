const ink = require("@gnd/ink");
const React = require("react");

const e = React.createElement;

/**
 * Base class for calling a prompt.
 */
class Prompt{
    constructor(properties){
        /** The component to render.*/
        this.component = undefined;
        /** Properties to send.*/
        this.properties = properties || {};
        /** Access to the app after render.*/
        this.app = undefined;
        /** The render function being used, can be subbed for testing. */
        this.render = ink.render;
    }

    /**
     * 
     * @returns {any}
     */
    createElement(){
        if(this.component) return e(this.component, this.properties);
    }

    onSubmit(value){
        this.app.unmount();
    }

    onCancel(){
        this.app.unmount();
    }


    async run(...args){
        var result = await new Promise((resolve, reject) => {
            this.properties.onCancel = ()=>{
                this.onCancel();
                reject();
            };

            this.properties.onSubmit = (value)=>{
                this.onSubmit(value);
                resolve(value);
            };
            var element = this.createElement();
            this.app = this.render(element, {exitOnCtrlC: false});
        });
        return result;
    }
}

module.exports = Prompt;