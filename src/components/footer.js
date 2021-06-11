const ink = require("@gnd/ink");
const React = require("react");
const ColorBox = require("./color-box");

const e = React.createElement;

/**
 * Given keybindings, generates the keybinding text.
 * @returns 
 */
const keyBar = ({
    keyBindings,
    suggestionsEnabled = true,
    backgroundColor = "cyan",
    color = "black",
    ...props
}) => {

    const combos = React.useMemo(()=>{
        var combos = [];

        var actions = Object.keys(keyBindings);
        for(var a of actions){
            var comboKeys = [];

            var bindings = keyBindings[a];
            if(!Array.isArray(bindings)) bindings = [bindings];
            var binding = bindings[0];
            var input = binding.input;
            var name = a;
            if(a === "cancel"){
                let keys = Object.keys(binding.key);
                for(let k of keys){
                    if(binding.key[k]){
                        comboKeys.push(k);
                    }
                }
                if(input) comboKeys.push(input);
            }
            if(a === "toggleSuggest" && suggestionsEnabled){
                let keys = Object.keys(binding.key);
                for(let k of keys){
                    if(binding.key[k]){
                        comboKeys.push(k);
                    }
                }
                name = "suggest";
                if(input) comboKeys.push(input);
            }
            if(comboKeys.length > 0){
                combos.push({
                    combo: comboKeys.join("+"),
                    name: name
                })
            }
        }
        return combos;
    }, []);

    return e(ink.Text, {}, 
        combos.map((value, index)=>{
            return e(ink.Text, {key: index, backgroundColor: backgroundColor, color: color}, 
                e(ink.Text, {}, " " + value.name),
                e(ink.Text, {}, " [" + value.combo + "] "),
            )
        })
    );
}

/**
 * Footer component, used by InputPrompt.
 * Autogenerates keybindings to display on footer.
 * If a non-string message is set, keybindings are replaced by this.
 * @type {React.FC<import("../types").FooterProps>}
 */
const Footer = ({
    message,
    keyBindings,
    suggestionsEnabled = true,
    backgroundColor = "cyan",
    color = "black",
    ...props
}) =>{

    const getKeys = React.useCallback(()=>{
        return e(keyBar, {suggestionsEnabled: suggestionsEnabled, keyBindings:keyBindings, backgroundColor:backgroundColor, color: color});
    }, [keyBindings])

    var keys;
    if(message && typeof message !== "string"){
        keys = undefined;
    }
    else{
        if(keyBindings){
            keys = getKeys();
        }
    }

    /**
     * @type {import("../types").ColorBoxProps}
     */
    const colorBoxProps = {
        height:1,
        overflow:"hidden",
        backgroundColor: backgroundColor
    };


    return e(ColorBox, colorBoxProps, 
        e(ink.Box, {justifyContent: "space-around", width: "100%"}, 
            keys,
            e(ink.Text, {backgroundColor: backgroundColor, color: color}, message),
        )
    );
}

module.exports = Footer;