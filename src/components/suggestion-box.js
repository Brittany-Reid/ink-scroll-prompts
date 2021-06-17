const ink = require("@gnd/ink");
const React = require("react");
const { _extends } = require("../utils");
const ColorBox = require("./color-box");
const { ScrollMenu } = require("./scroll-menu");
const e = React.createElement;



const SuggestionComponent = ({
    label = "",
    isSelected = false,
    accentColor = "cyan",
    backgroundColor = "grey",
    ...props
}) => {

    var textProps = {
        backgroundColor: backgroundColor,
    }
    var boxProps = {
        flexGrow: 1,
        height:1,
        backgroundColor: backgroundColor,
    };
    if(isSelected){
        textProps.color = "white";
        textProps.backgroundColor = accentColor;
        boxProps.backgroundColor = accentColor;
    }

    return e(ColorBox, boxProps,
        e(ink.Text, textProps, label)
    );
}

/**
 * SuggestionBox filter function.
 * @callback SuggestFunction
 * @param {string} query
 * @param {Array} suggestions
 * @return {Array}
 */

/**
 * @type {SuggestFunction}
 */
const defaultSuggest = (query, suggestions) => {
    suggestions = suggestions.filter((item) =>{
        var label = item.label;
        if(label.startsWith(query)) return true;
        return false;
    });
    return suggestions;
}

/**
 * SuggestionBox Props.
 * @typedef {Object} SuggestionBoxTypes
 * @property {string} [query] Query to filter suggestions by.
 * @property {Array} [suggestions] List of suggestion items, for example `{label:"a"}`.
 * @property {SuggestFunction} [suggest] Function to filter suggestions based on query string.
 * @property {import("../types").Color} [accentColor] Accent colour, for selected item.
 * @property {import("./scroll-menu").OnSelectFunction} [onSelect] Function to call on select an item.
 * @property {number} [maxHeight] Max height.
 * @property {boolean} [isFocused] If suggestionBox is focused, otherwise it doesn't use input.
 * 
 * @typedef {import("./color-box").ColorBoxProps & SuggestionBoxTypes} SuggestionBoxProps
 */

/**
 * Suggestion box that filters based on query and filter function.
 * Used to implement a box of suggestions that filteres as you type.
 * @type {React.FC<SuggestionBoxProps>}
 */
const SuggestionBox = React.forwardRef(({
    query = "",
    suggestions = [],
    suggest = defaultSuggest,
    backgroundColor = "grey",
    accentColor = "cyan",
    onSelect,
    width,
    minHeight = 1,
    maxHeight = 4,
    isFocused = true,
    ...props
}, ref) => {
    const [longestSuggestionLength, setLongestSuggestionLength] = React.useState(3);
    const [items, setItems] = React.useState([]);
    const [filteredItems, setFilteredItems] = React.useState(suggestions);
    const [internalHeight, setInternalHeight] = React.useState(minHeight);

    const onSizeChange = (height)=>{
        setInternalHeight(height);
    };

    //format for scrollmenu
    React.useLayoutEffect(() => {
        if(!suggestions || suggestions.length < 1) return;
        var newItems = [];
        for(var s of suggestions){
            var object = s;
            if(typeof s === "string"){
                object = {
                    label: s,
                    accentColor: accentColor
                }
            }
            else{
                object = _extends(s, {
                    accentColor: accentColor
                })
            }
            newItems.push(object);
        }
        setItems(newItems);
    }, [suggestions]);

    React.useLayoutEffect(()=>{
        if(!items || items.length < 1) return;

        var length = 3;
        for(var i of items){
            var label = i.label;
            if(label.length+2 > length) length = label.length+2;
        }
        setLongestSuggestionLength(length);

        var newItems = items;
        if(typeof suggest === "function"){
            newItems= suggest(query, newItems);
        }
        setFilteredItems(newItems);
    }, [items, query]);

    React.useEffect(()=>{
        if(!filteredItems || filteredItems.length < 1){
            if(typeof onSelect === "function") onSelect();
            return;
        }
    }, [filteredItems])

    var colorBoxProps = {
        width: width || longestSuggestionLength,
        flexDirection:"column", 
        backgroundColor: backgroundColor, 
        height:internalHeight,
        flexGrow:1,
        flexShrink:0,
        ref: ref,
    }

    var scrollMenuProps = {
        itemComponent: SuggestionComponent,
        arrows:false,
        width: width || longestSuggestionLength,
        onSelect: onSelect,
        minHeight: minHeight,
        maxHeight: maxHeight,
        onSizeChange: onSizeChange,
        items: filteredItems,
        isFocused: isFocused,
    }

    if(!filteredItems || filteredItems.length < 1) return null;

    return e(ColorBox,  _extends(colorBoxProps, props), 
        e(ScrollMenu, scrollMenuProps)
    );

})

module.exports.SuggestionBox = SuggestionBox;