const ink = require("@gnd/ink")
const React = require("react");
const { _extends } = require("../utils");
const e = React.createElement;


/**
 * Internal scrollbar component.
 */
const Scrollbar = ({
    direction = "horizontal", //scrollbar direction
    scrollPercent = 0, //how far the scrollbox is currently scrolled
    visablePercent = 1, //how much of the scrollbox is visable
    width = 1, //thickness of the bar
    arrows = true, //display arrows
    color = "white", //color of arrows and bar
    ...props
}) =>{

    //arrows
    var upArrow = "";
    var downArrow = "";
    if(arrows){
        if(direction === "horizontal"){
            upArrow = "◀ ";
            downArrow = " ▶";
        }
        else{
            upArrow = "▲";
            downArrow = "▼";
        }
    }

    //references
    const barRef = React.useRef();
    const outerRef = React.useRef();

    //state
    const [thumbLength, setThumbLength] = React.useState(0);
    const [thumbOffset, setThumbOffset] = React.useState(0);

    React.useLayoutEffect(() => {
        //timeout for measure
        setTimeout(() => {
            //reference must exist
            if(!barRef.current) return; 

            //measure the scrollbar (not inclusive of arrows), the length is based on direction
            var bar = ink.measureElement(barRef.current);
            var length = bar.width;
            if(direction === "vertical") length = bar.height;
            //if length is zero, either not displaying or timeout didnt work :(
            if(length === 0) return;

            //the length of the scroll thumb should represent the percent that is visable
            var newThumbLength = Math.max(1, Math.floor((length * visablePercent)));

            //calculate offset, using visable track and the scroll position (as percent)
            var visableTrack = Math.max(0, length - newThumbLength);
            var newThumbOffset = Math.min(Math.round(scrollPercent*visableTrack), visableTrack); 

            setThumbLength(newThumbLength);
            setThumbOffset(newThumbOffset);
        }, 30);
    });

    //derive the thumbString from length. The string is used to colour the scrollbar.
    //this should be replaced when boxes can be coloured again
    var thumbString = " ".repeat(thumbLength*width);

    //define the base props for child elements

    const outerProps = {
        flexShrink: 0,
        alignItems: "center",
        flexDirection: "row",
        overflow:"hidden",
        ref: outerRef,
    }

    const arrowProps = {
        color:color,
    }

    const thumbStyle = {
        flexShrink:0,
    }

    //some props need to know the direction
    if(direction === "horizontal"){
        outerProps.height = width;
        thumbStyle.marginLeft = thumbOffset;
    }
    else{
        outerProps.width = width;
        outerProps.flexDirection = "column";
        thumbStyle.marginTop = thumbOffset;
    }
    
    //outer box
    return e(ink.Box, _extends(outerProps, props),
        //up arrow
        e(ink.Text, arrowProps, upArrow),
        //bar (thumb + track)
        e(ink.Box, {flexGrow: 1, flexShrink: 0, ref:barRef}, 
            //thumb
            e(ink.Box, thumbStyle, 
                //thumbString, coloured
                e(ink.Text, {backgroundColor:color}, thumbString),
            )
        ),
        //down arrow
        e(ink.Text, arrowProps, downArrow),
    );
}

module.exports = Scrollbar;