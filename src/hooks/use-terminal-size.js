const ink = require("@gnd/ink");
const React = require("react");

/**
 * @callback ResizeHandler
 * @param {number} columns
 * @param {number} rows
 */

/**
 * Hook for terminal resize events.
 * @param {ResizeHandler} resizeHandler Function to call on terminal resize.
 */
const useTerminalSize = (resizeHandler) => {
    const {stdout} = ink.useStdout();

    function handleStdout(isEnabled = false){
        if(isEnabled){
            stdout.addListener("resize", handleResize);
        }
        else{
            stdout.removeListener("resize", handleResize);
        }   
    }

    function handleResize(){
        resizeHandler(stdout.columns, stdout.rows);
    }

    React.useLayoutEffect(() => {
        handleStdout(true);
        return () => {
            handleStdout(false);
        };
    }, [handleStdout]);

}

module.exports = useTerminalSize;