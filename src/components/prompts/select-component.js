const React = require("react");
const ink = require("@gnd/ink");
const { ScrollMenu, ItemComponent } = require("../scroll-menu");
const { useMemo } = require("react");
const { _extends } = require("../../utils");
const Fullscreen = require("../fullscreen");

const e  = React.createElement;

/**
 * @typedef {Object} SelectComponentTypes
 * @property {string | React.ReactElement<ink.Text>} [message] Optional message to display, can be styled text element.
 * @property {import("../../types").Color} [accentColor] Accent colour, for the selected element.
 * @property {"vertical" | "horizontal"} [direction] Direction of item list, default vertical.
 * @typedef {import("../scroll-menu").ScrollMenuProps & SelectComponentTypes} SelectComponentProps
 */

/**
 * Ink component implementing the select prompt.
 * @type {React.FC<SelectComponentProps>}
 */
const SelectComponent = React.forwardRef(({
    message,
    items = [],
    accentColor = "cyan",
    direction = "vertical",
    itemComponent = ItemComponent,
    onSubmit,
    onCancel,
    maxHeight,
    ...props
}, ref)=>{

    const [canceled, setCanceled] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState(undefined);


    const internalOnCancel = React.useCallback((selectedItem)=>{
        setCanceled(true);
        if(typeof onCancel === "function") onCancel(selectedItem.label);
    }, [onCancel])

    const internalOnSubmit = React.useCallback((selectedItem)=>{
        setSelectedItem(selectedItem);
        setSubmitted(true);
        if(typeof onSubmit === "function") onSubmit(selectedItem.label);
    }, [onCancel])

    const formattedItems = useMemo(()=>{
        return items.map((i)=>{
            var item = i;
            if(typeof item === "string") item = {label: item};
            if(!item.accentColor) item.accentColor = accentColor;
            return item;
        })
    }, [items, accentColor]);


    var messageElement = undefined;
    if(message) messageElement = e(ink.Box, {height: 1}, 
        e(ink.Text, {wrap: "truncate", dimColor: canceled ? true : false}, message)
    );

    const scrollMenuProps = {
        items: formattedItems,
        maxHeight: maxHeight-1,
        flexDirection: (direction === "horizontal") ? "row" : "column",
        onSelect: internalOnSubmit,
        onCancel: internalOnCancel,
        dimColor: canceled ? true : false,
    }

    if(submitted){
        return e(ink.Box, {flexDirection: "column"}, 
            messageElement,
            e(itemComponent, selectedItem)
        );
    }

    return e(ink.Box, {flexDirection:"column"}, 
        messageElement,
        e(ScrollMenu, _extends(scrollMenuProps, props))
    )
})

//ink.render(e(Fullscreen, {heightOffset: 1, component: SelectComponent, message: "How to?", items: ["yes", "no", "bye", "aaaaaa", "hello"]}))


module.exports = SelectComponent;


