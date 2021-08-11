const ink = require("@gnd/ink");
const React = require("react");
const { _extends } = require("../utils");
const { ScrollBox } = require("./scrollbox");
const e = React.createElement;

/**
 * @typedef {Object} ItemComponentTypes
 * @property {string} label Label to display, required.
 * @property {boolean} [isSelected]
 * @property {import("../types").Color} [accentColor]
 * 
 * @typedef {ink.TextProps & ItemComponentTypes} ItemComponentProps
 */

/**
 * Default item component. 
 * Text that changes colour if the selected item.
 *@type {React.FC<ItemComponentProps>}
 */
const ItemComponent = ({
    label,
    accentColor = "cyan",
    isSelected = false,
    ...props
}) => {
    var textProps = {};
    if(isSelected) textProps.color = accentColor;

    return e(ink.Text, textProps, label);
}

/**
 * ScrollMenu onSelect function.
 * @callback OnSelectFunction
 * @param {Object} selectedItem Item that was selected.
 * @return
 */

/**
 * ScrollMenu onSelect function.
 * @callback OnCancelFunction
 * @param {Object} selectedItem Item that was selected at time of cancel.
 * @return
 */

/** 
 * @typedef {Object} ScrollMenuTypes
 * @property {Array} [items] Array of item property objects.
 * @property {number} [initialIndex] The index to select initially.
 * @property {React.ComponentType<any>} [itemComponent] Component to create for items.
 * @property {OnSelectFunction} [onSelect] Function to call on select.
 * @property {OnCancelFunction} [onCancel] Function to call on cancel.
 * @property {boolean} [isFocused] If suggestionBox is focused, otherwise it doesn't use input.
 * 
 * @typedef {import("./scrollbox").ScrollBoxProps & ScrollMenuTypes} ScrollMenuProps
 */

/**
 * Scrollable menu. Currently only works vertically.
 * @type {React.FC<ScrollMenuProps>}
 */
const ScrollMenu = ({
    items = [],
    initialIndex = 0,
    itemComponent = ItemComponent,
    onSelect = undefined,
    onCancel = undefined,
    overflowX = "hidden",
    overflowY,
    flexDirection = "column",
    arrows = false,
    isFocused = true,
    dimColor,
    ...props
}) => {
    //state
    const [selectedIndex, setSelectedIndex] = React.useState(initialIndex);
    const [scrollY, setScrollY] = React.useState(0);

    //references
    const scrollBoxRef = React.useRef();
    const containerRef = React.useRef();

    //validate the selected index if items change
    React.useLayoutEffect(()=>{
        var currentSelected = selectedIndex;
        if(currentSelected >= items.length) currentSelected = 0;
        setSelectedIndex(currentSelected);
    }, [items]);

    //handle input
    ink.useInput((input, key) => {
        if(key.upArrow){
            let nextSelected = selectedIndex-1;
            if(nextSelected < 0) nextSelected = items.length-1;
            //else if(nextSelected >= items.length) nextSelected = 0;
            setSelectedIndex(nextSelected);
            return;
        }
        if(key.downArrow){
            let nextSelected = selectedIndex+1;
            if(nextSelected >= items.length) nextSelected = 0;
            setSelectedIndex(nextSelected);
            return;
        }
        if(key.return){
            if (typeof onSelect === 'function') onSelect(items[selectedIndex]);
            return;
        }
        if(key.escape || (key.ctrl && input === "c")){
            if (typeof onCancel === 'function') onCancel(items[selectedIndex]);
            return;
        }
    }, {isActive:isFocused});

    //when selected index changes, recalculate scroll position
    React.useLayoutEffect(() => {
        if(!containerRef || ! scrollBoxRef) return;
        if(!containerRef.current || !scrollBoxRef.current) return;
        var currentContainerRef = containerRef.current;
        var currentScrollBoxRef = scrollBoxRef.current;

        //get selected node
        var childNodes = currentContainerRef.childNodes[0].childNodes;
        if(!childNodes) return;
        var selectedNode = childNodes[selectedIndex];
        if(!selectedNode) return;

        //measure
        var container = ink.measureElement(containerRef.current);
        var selected = selectedNode.yogaNode.getComputedLayout();
        
        var newScrollY = scrollY;
        if(selected.height > container.height) newScrollY = selected.top;
        else if(selected.top < scrollY) newScrollY = selected.top;
        else{
            var difference = (selected.top+selected.height) - (scrollY+container.height);
            newScrollY += Math.max(difference, 0);
        }
 
        newScrollY = currentScrollBoxRef.setScrollY(newScrollY);
        setScrollY(newScrollY);

    }, [selectedIndex]);

    const scrollBoxProps = {
        overflowX: overflowX,
        overflowY: overflowY,
        flexDirection:flexDirection,
        ref: scrollBoxRef,
        containerRef:containerRef,
        arrows:arrows,
    }

    return e(ScrollBox, _extends(scrollBoxProps, props), 
        items.map((item, index) => {
            var isSelected;
            if(index === selectedIndex) isSelected = true;
            return e(ink.Box, {key:index}, 
                e(itemComponent, _extends(item, {isSelected:isSelected, dimColor: dimColor}))
            )
        })
    )
}

module.exports.ItemComponent = ItemComponent;
module.exports.ScrollMenu = ScrollMenu;