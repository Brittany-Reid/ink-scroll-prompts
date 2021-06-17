/**
 * @fileoverview Define common types for input completion.
 */

/*eslint-disable*/
const ink = require("@gnd/ink");
/*eslint-enable*/


/** @type {any} */
module.exports = {};

/**
 * Any string to get string suggestions to work >.<
 * @typedef {string & {}} AnyString
 */

/**
 * Color suggestions
 * @typedef {'black' | 'red' | 'green' | 'yellow' | 'cyan' | 'blue' | 'magenta' | 'white' | 'grey' | 'gray' | AnyString } Color 
 */