/**
 * @fileoverview An example of how the ScrollBox can be used in Ink.
 * Displays scrollable text in a box with a title.
 */

const { useTerminalSize } = require("../..");

/*
 * ScrollBox is not exported on index.js yet as the implementation is experimental.
 * It may not work the best for all use cases.
 */
const {HandledScrollBox} = require("../../src/components/scrollbox"); 

const React = require("react");
const ink = require("@gnd/ink");
const fs= require("fs");
const path = require("path");
const ColorBox = require("../../src/components/color-box");
  
const e = React.createElement;
function _extends() { var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
 
const lorem = fs.readFileSync(path.join(__dirname, "../../assets/lorem.txt"), {encoding: "utf-8"})
  
const myPrompt = () => {
    const {stdout} = ink.useStdout();
 
    const [height, setHeight] = React.useState(stdout.rows);
    const [width, setWidth] = React.useState(stdout.columns);
 
    useTerminalSize((width, height) => {
        setWidth(width);
        setHeight(height);
    });

    const ScrollBoxProps = {
        width: "100%",
        maxHeight: height-4,
        //borderStyle: "single",
        flexDirection: "column",
        overflowX: "hidden", //if you don't need this you can prevent some flickering with 100% width children
    }
 
    return e(ink.Box, {flexDirection: "column", borderStyle: "single"},
        e(ink.Box, {flexDirection: "row", justifyContent:"center"},
            e(ink.Box, {},
                e(ink.Text, {bold:true}, "Lorem Ipsum")
            )
        ),
        e(HandledScrollBox, ScrollBoxProps, 
            e(ink.Text, {}, lorem)
        )
    );
}
 
 
ink.render(e(myPrompt))