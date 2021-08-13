function _extends() { const _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function isEmptyObject(obj) {if(Object.keys(obj).length === 0) return true; return false;}

//string utilities for handling fullwidth, emojis etc

function fixedCharAt(str, idx) {
    let ret = ''
    str += ''
    let end = str.length
  
    let surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g
    while ((surrogatePairs.exec(str)) != null) {
        let lastIdx = surrogatePairs.lastIndex
        if (lastIdx - 2 < idx) {
            idx++
        } else {
            break
        }
    }
  
    if (idx >= end || idx < 0) {
        return ''
    }
  
    ret += str.charAt(idx)
  
    if (/[\uD800-\uDBFF]/.test(ret) && /[\uDC00-\uDFFF]/.test(str.charAt(idx + 1))) {
        // Go one further, since one of the "characters" is part of a surrogate pair
        ret += str.charAt(idx + 1)
    }
    return ret
}
  
function fixedCharLength(string){
    var i = 0;
    var ch;
    while(ch = fixedCharAt(string, i)){  // eslint-disable-line
        i++;
    }
    return i;
}

function fixedSubstring(string, start, end){
    var substring = "";
    var i = start;
    var ch;
    while(ch = fixedCharAt(string, i)){  // eslint-disable-line
        if(i >= end) break;
        substring += ch;
        i++;
    }

    return substring;
}

/**
 * Get the previous word in a string, used for the delete word command.
 * Looks at characters in reverse order until type doesn't match.
 * Type is alphanum and other. This way the string `function(arg)` has 4 parts.
 */
function getLastWord(string){
    var type;
    var word = "";
    for(var i = string.length-1; i>=0; i--){
        var char = string[i];
        if(!type){
            if(!char.match(/\s/g)){
                if(char.match(/\w/g)){
                    type = "alphanum";
                }
                else{
                    type = "other"
                }
            }
        }
        //if we have a type, end on non type
        else{
            //whitespace, end
            if(char.match(/\s/g)){
                break;
            }
            //find non alphanum after deleteing alphanum
            if(type === "alphanum" && !char.match(/\w/g)){
                break;
            }
            //find alphanum after deleting non alpha
            if(type === "other" && char.match(/\w/g)){
                break;    
            }
        }
        word = char + word;
    }

    return word;
    //string= before.substring(0, i)
}

/**
 * Get the previous word in a string, used for the delete word command.
 * Looks at characters in reverse order until type doesn't match.
 * Type is alphanum and other. This way the string `function(arg)` has 4 parts.
 */
function getFirstWord(string){
    var type;
    var word = "";
    for(var i = 0; i<string.length; i++){
        var char = string[i];
        if(!type){
            if(!char.match(/\s/g)){
                if(char.match(/\w/g)){
                    type = "alphanum";
                }
                else{
                    type = "other"
                }
            }
        }
        //if we have a type, end on non type
        else{
            //whitespace, end
            if(char.match(/\s/g)){
                break;
            }
            //find non alphanum after deleteing alphanum
            if(type === "alphanum" && !char.match(/\w/g)){
                break;
            }
            //find alphanum after deleting non alpha   a  d
            if(type === "other" && char.match(/\w/g)){
                break;    
            }
        }
        word = word + char;
    }
    return word;
    //string= before.substring(0, i)
}


function isKey(key, input, binding){
    if(!binding) return false;
    if(binding.input && input !== binding.input) return false;
    for(var b of Object.keys(binding.key)){
        if(key[b] !== binding.key[b]) return false;
    }
    return true;
}

exports._extends = _extends;
exports.isEmptyObject = isEmptyObject;
exports.fixedCharAt = fixedCharAt;
exports.fixedCharLength = fixedCharLength;
exports.fixedSubstring = fixedSubstring;
exports.getLastWord = getLastWord;
exports.getFirstWord = getFirstWord;
exports.isKey = isKey;