const ink = require("@gnd/ink");
const React = require("react");
const { _extends } = require("../utils");
const e = React.createElement;

/**
 * Box component filled with color. This component is a hack until Ink implements this natively.
 * If the height or width needs to be measured there may be some flashing or odd behaviour.
 * Any child text needs to have a background set.
 * 
 * @type {React.FC<import("../types").ColorBoxProps>}
 */
const ColorBox = React.forwardRef(({
    backgroundColor, 
    children, 
    ...props
}, ref) => {
    const innerRef = React.useRef();
    const [height, setHeight] = React.useState(typeof props.height === "number" ? props.height : 0);
    const [width, setWidth] = React.useState(typeof props.width === "number" ? props.width : 0);

    const hasBorder = React.useCallback(()=>{
        if(props.borderStyle) return true;
        return false;
    }, [props.borderStyle])

    React.useLayoutEffect(() => {
        var newHeight = props.height;
        var newWidth = props.width;
        if (!newHeight || !newWidth || typeof newHeight !== "number" || typeof newWidth !== "number" || hasBorder()) {
            setTimeout(() => {
                if (!innerRef.current) return;
                var dimensions = ink.measureElement(innerRef.current);
                if (!newHeight || typeof newHeight !== "number" || hasBorder()) newHeight = dimensions.height;
                if (!newWidth || typeof newWidth !== "number" || hasBorder()) newWidth = dimensions.width;
                setHeight(newHeight);
                setWidth(newWidth);
            }, 30);
        }else{
            setHeight(newHeight);
            setWidth(newWidth);
        }
    });

    const content = React.useCallback(() => {
        if (!backgroundColor) return "";
        var line = " ".repeat(width);
        var lines = (line + "\n").repeat(Math.max(0, height - 1)) + line;
        return lines;
    }, [height, width]);

    const innerProps = {
        flexGrow: 1,
        flexDirection: props.flexDirection,
        alignItems: props.alignItems,
        justifyContent: props.justifyContent,
        alignSelf: props.alignSelf,
        ref: innerRef,
    };

    var contentString = content();

    return e(
        ink.Box, _extends({ref:ref}, props), e(
            ink.Box, {position: "absolute"}, e(
                ink.Text, {backgroundColor: backgroundColor}, contentString
            )
        ), e(ink.Box, innerProps, children)
    );
})

e(ColorBox, {backgroundColor: "black"})


module.exports = ColorBox;
