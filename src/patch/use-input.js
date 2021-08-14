/**
 * @file Patch useInput to recognize function keys.
 */

const {useEffect} = require("react");
const useStdin = require("@gnd/ink").useStdin;


const useInput = (inputHandler, options = {}) => {
    const {stdin, setRawMode, internal_exitOnCtrlC} = useStdin();

    useEffect(() => {
        if (options.isActive === false) {
            return;
        }

        setRawMode(true);

        return () => {
            setRawMode(false);
        };
    }, [options.isActive, setRawMode]);

    useEffect(() => {
        if (options.isActive === false) {
            return;
        }

        const handleData = (data) => {

            let input = String(data);

            const key = {
                f1: input === '\u001BOP' || input === '\u001B[11~' || input === '\u001B[[A',
                f2: input === '\u001BOQ' || input === '\u001B[12~' || input === '\u001B[[B',
                f3: input === '\u001BOR' || input === '\u001B[13~' || input === '\u001B[[C',
                f4: input === '\u001BOS' || input === '\u001B[14~' || input === '\u001B[[D',
                f5: input === '\u001B[15~' || input === '\u001B[[E',
                f6: input === '\u001B[17~',
                f7: input === '\u001B[18~',
                f8: input === '\u001B[19~',
                f9: input === '\u001B[20~',
                f10: input === '\u001B[21~',
                f11: input === '\u001B[23~',
                f12: input === '\u001B[24~',
                upArrow: input === '\u001B[A',
                downArrow: input === '\u001B[B',
                leftArrow: input === '\u001B[D',
                rightArrow: input === '\u001B[C',
                home: input === "\u001B[1~",
                end: input === '\u001B[4~',
                pageDown: input === '\u001B[6~',
                pageUp: input === '\u001B[5~',
                return: input === '\r',
                escape: input === '\u001B',
                ctrl: false,
                shift: false,
                tab: input === '\t' || input === '\u001B[Z',
                backspace: input === '\u0008' || input === "\b",
                delete: input === '\u007F' || input === '\u001B[3~',
                meta: false
            };

            /*
             * i dont have time to get these working properly, lets just add special cases here
            */
            if(input === "\x1B\x7F") {
                //option + delete in mac term
                //should i send the actual keys? for vscode it sends ctrl+w
                key.ctrl = true;
                inputHandler("w", key);
                return;
            }
            if(input === "\b"){
                //backspace windows, sends ctrl true without this
                return inputHandler("", key);
            }
            if(input === "\u001B\b"){
                //alt backspace
                key.backspace = true;
                key.meta = true;
                return inputHandler("", key);
            }
            if(input === "\u001B[1;5C"){
                //ctrl right
                key.ctrl = true;
                key.rightArrow = true;
                return inputHandler("", key);
            }
            if(input === "\u001B[1;5D"){
                //ctrl left
                key.ctrl = true;
                key.leftArrow = true;
                return inputHandler("", key);
            }
            if(input === '\x1B\x1B[C'){
                //alt right
                key.meta = true;
                key.rightArrow = true;
                return inputHandler("", key);
            }
            if(input === '\x1B\x1B[D'){
                //alt left
                key.meta = true;
                key.leftArrow = true;
                return inputHandler("", key);
            }
            if(input === '\x1B[1;2C'){
                //shift right
                key.shift = true;
                key.rightArrow = true;
                return inputHandler("", key);
            }
            if(input === '\x1B[1;2D'){
                //shift left
                key.shift = true;
                key.leftArrow = true;
                return inputHandler("", key);
            }

            //remove meta
            if(key.leftArrow || key.rightArrow){
                key.meta = false;
                return inputHandler("", key);
            }

            // Copied from `keypress` module
            if (input <= '\u001A' && !key.return) {
                input = String.fromCharCode(
                    input.charCodeAt(0) + 'a'.charCodeAt(0) - 1
                );
                key.ctrl = true;
            }

            //i did other special cases here and im too scared to move them

            if (input.startsWith('\u001B')) {
                input = input.slice(1);
                key.meta = true;

                if(input === "[1;2A"){
                    key.meta = false;
                    key.shift = true;
                    key.upArrow = true;
                }
                if(input === "[1;2B"){
                    key.meta = false;
                    key.shift = true;
                    key.downArrow = true;
                }
            }

            const isLatinUppercase = input >= 'A' && input <= 'Z';
            const isCyrillicUppercase = input >= 'А' && input <= 'Я';
            if (input.length === 1 && (isLatinUppercase || isCyrillicUppercase)) {
                key.shift = true;
            }

            // Shift+Tab
            if (key.tab && input === '[Z') {
                key.shift = true;
            }

            if (key.tab || key.backspace || key.delete) {
                input = '';
            }

            // If app is not supposed to exit on Ctrl+C, then let input listener handle it
            if (!(input === 'c' && key.ctrl) || !internal_exitOnCtrlC) {
                inputHandler(input, key);
            }
        };

        stdin?.on('data', handleData);

        return () => {
            stdin?.off('data', handleData);
        };
    }, [options.isActive, stdin, internal_exitOnCtrlC, inputHandler]);
};

module.exports = useInput;