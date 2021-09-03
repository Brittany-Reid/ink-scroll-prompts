const ink = require("@gnd/ink");
const React = require("react");
const { _extends } = require("../utils");
const { ScrollBox } = require("./scrollbox");
const e = React.createElement;

/**
 * @typedef {Object} ItemComponentTypes
 * @property {string} label Label to display, required.
 * @property {boolean} [isSelected]
 * @property {string} [selectIndicator] Select state indicator character.
 * @property {string} [nullIndicator] Non-selected state indicator character.
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
    selectIndicator = "◉",
    nullIndicator = "◯",
    isSelected = false,
    ...props
}) => {
    var textProps = _extends({}, props);
    if(isSelected){
        textProps.color = accentColor;
    }

    const indicatorElement = React.useMemo(()=>{   
        if(!selectIndicator) return null;
        if(isSelected) return e(ink.Text, {}, selectIndicator + " ");
        return e(ink.Text, {},  nullIndicator + " ")
    }, [isSelected, selectIndicator, nullIndicator])

    return e(ink.Text, textProps, 
        indicatorElement,
        e(ink.Text, {underline: isSelected ? true : false}, label)
    );
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
 * @property {boolean} [indicator] Indicator character.
 * @property {string} [selectIndicator] Select state indicator character.
 * @property {string} [nullIndicator] Non-selected state indicator character.
 * 
 * @typedef {import("./scrollbox").ScrollBoxProps & ScrollMenuTypes} ScrollMenuProps
 */

/**
 * Scrollable menu.
 * @type {React.FC<ScrollMenuProps>}
 */
const ScrollMenu = ({
    items = [],
    initialIndex = 0,
    itemComponent = ItemComponent,
    onSelect = undefined,
    onCancel = undefined,
    flexDirection = "column", //this controls child direction
    arrows = false,
    isFocused = true,
    selectIndicator,
    nullIndicator,
    dimColor,
    ...props
}) => {
    //state
    const [selectedIndex, setSelectedIndex] = React.useState(initialIndex);
    const [scrollY, setScrollY] = React.useState(0);
    const [scrollX, setScrollX] = React.useState(0);

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
        if(key.upArrow || key.leftArrow){
            let nextSelected = selectedIndex-1;
            if(nextSelected < 0) nextSelected = items.length-1;
            //else if(nextSelected >= items.length) nextSelected = 0;
            setSelectedIndex(nextSelected);
            return;
        }
        if(key.downArrow || key.rightArrow){
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

        if(flexDirection === "column"){
            var newScrollY = scrollY;
            if(selected.height > container.height) newScrollY = selected.top;
            else if(selected.top < scrollY) newScrollY = selected.top;
            else{
                var difference = (selected.top+selected.height) - (scrollY+container.height);
                newScrollY += Math.max(difference, 0);
            }
    
            newScrollY = currentScrollBoxRef.setScrollY(newScrollY);
            setScrollY(newScrollY);
        }
        else{
            var newScrollX = scrollX;
            if(selected.width > container.width) newScrollX = selected.left;
            else if(selected.left < scrollX) newScrollX = selected.left;
            else{
                var difference = (selected.left+selected.width) - (scrollX+container.width);
                newScrollX += Math.max(difference, 0);
            }
            newScrollX = currentScrollBoxRef.setScrollX(newScrollX);
            setScrollX(newScrollX);
        }

    }, [selectedIndex]);

    const scrollBoxProps = {
        overflowX: (flexDirection === "column") ? "hidden" : "auto",
        overflowY: (flexDirection === "column") ? "auto" : "hidden",
        flexDirection:flexDirection,
        ref: scrollBoxRef,
        containerRef:containerRef,
        arrows:arrows,
    }

    return e(ScrollBox, _extends(scrollBoxProps, props), 
        items.map((item, index) => {
            var isSelected;
            if(index === selectedIndex) isSelected = true;
            return e(ink.Box, {key:index, marginRight: (flexDirection === "row" ? 1 : undefined)}, 
                e(itemComponent, _extends(item, {isSelected:isSelected, dimColor: dimColor, selectIndicator, nullIndicator}))
            )
        })
    )
}

module.exports.ItemComponent = ItemComponent;
module.exports.ScrollMenu = ScrollMenu;