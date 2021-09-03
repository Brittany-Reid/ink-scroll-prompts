const React = require("react");
const ink = require("@gnd/ink");
const useTerminalSize = require("../hooks/use-terminal-size");
const { _extends } = require("../utils");

const e = React.createElement;

/**
 * The fullscreen component takes a component and runs it using terminal height.
 * It is intended to be used as the top level component. 
 * Ideally, this would be a parent component, with the child components using percent.
 * However, the maxHeight functionality requires a numeric value, and also Ink doesn't support
 * values like `100% - 1`.
 * @type {React.FC<any>}
 */
const Fullscreen = React.forwardRef(({
    component, //component to render
    heightOffset = 0, //offset max height by this, 0 is fullscreen, 1 will show previous line etc
    ...props
}, ref) =>{

    const {stdout} = ink.useStdout();

    const [height, setHeight] = React.useState(stdout.rows);
    const [width, setWidth] = React.useState(stdout.columns);

    useTerminalSize((width, height) => {
        setWidth(width);
        setHeight(height);
    });

    const fullscreenProps = {
        maxHeight: height - (heightOffset+1),
        width: "100%",
    }


    return e(component, _extends(props, fullscreenProps))
})

module.exports = Fullscreen;