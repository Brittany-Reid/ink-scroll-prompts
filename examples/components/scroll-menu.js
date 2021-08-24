/**
 * @fileoverview An example of how the scrollMenu component can be used in Ink.
 * When the terminal is too small to display all items, the menu becomes scrollable.
 * If you enlarge the terminal, more items will display.
 */

const { ScrollMenu, useTerminalSize } = require("../..");

const React = require("react");
const ink = require("@gnd/ink");

const e = React.createElement;
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/**
 * Our items.
 */
const items = [
    {label: "Item 1", width: "100%"},
    {label: "Item 2", width: "100%"},
    {label: "Item 3", width: "100%"},
    {label: "Item 4", width: "100%"},
    {label: "Item 5", width: "100%"},
    {label: "Item 6", width: "100%"},
]

/**
 * Custom item component that puts a border around each item.
 * @returns 
 */
const myItemComponent = ({
    label = "",
    isSelected = false,
    accentColor = "cyan",
    ...props
} = {}) => {

    //use isSelected to determine if text colour should be cyan
    const textProps = {
        color: isSelected ? accentColor : undefined,
    }

    //use isSelected to determine if border colour should be cyan
    const boxProps = {
        borderStyle:"single",
        borderColor: isSelected ? accentColor : undefined,
    }

    return e(ink.Box, _extends(boxProps, props), 
        e(ink.Text, textProps, label)
    )
}

const myMenu = ({
    ...props
} = {}) => {

    const {stdout} = ink.useStdout();
    const app = ink.useApp();

    const [height, setHeight] = React.useState(stdout.rows);
    const [width, setWidth] = React.useState(stdout.columns);
    const [exited, setExited] = React.useState(false);

    useTerminalSize((columns, rows) => {
        setHeight(rows);
        setWidth(columns);
    });

    /**
     * Function to exit.
     * Sets an exit state that stops rendering the scrollmenu.
     * Then adjusts cursor position.
     */
    const exit = React.useCallback(()=>{
        setExited(true);
        app.exit();
        stdout.moveCursor(0, -1);
    }, []);

    /**
     * What happens on select. Exits then prints the selected item's label.
     */
    const onSelect = React.useCallback((selected)=>{
        exit();
        console.log(selected.label);
    }, []);

    /*
     * Handle ctrl+c ourselfs.
     */
    ink.useInput((input, key)=>{
        if(input === "c" && key.ctrl){
            exit();
        }
    })


    if(exited) return null;
    return e(ScrollMenu, {onSelect: onSelect,items:items, itemComponent: myItemComponent, minHeight: 3, maxHeight: height-1, width: width}, 
    )
}

/**
 * Render, and handle CTRL-C behaviour ourselfs.
 */
ink.render(e(myMenu), {exitOnCtrlC: false});