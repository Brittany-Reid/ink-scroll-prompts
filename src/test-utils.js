const delay = require("delay");

const keys = {
    ESC: "\u001B",
    ENTER: "\r",
    SHIFTUP: "\u001B[1;2A",
    SHIFTDOWN: "\u001B[1;2B",
    CTRLU: "\x15",
    CTRLW: "\x17",
    CTRLE: "\x05",
    CTRLA: "\x01",
    ARROW_UP: '\u001B[A',
    ARROW_DOWN: '\u001B[B',
    ARROW_LEFT: '\u001B[D',
    ARROW_RIGHT: '\u001B[C',
    DELETE: '\u007F',
    ALTB: "\u001Bb",
    ALTF: "\u001Bf",
    F12: "\u001B[24~"
}

async function press(key, app){
    await delay(100);
    app.stdin.write(key);
    await delay(100);
}

async function write(string, app){
    await delay(100);
    app.stdin.write(string);
    await delay(100);
}

async function send(string, app){
    await write(string, app)
    await press(keys.ENTER, app)
}

module.exports = {
    keys,
    press,
    write,
    send
}