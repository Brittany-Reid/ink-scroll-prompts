/**
 * Generate a README from a given directory.
 */

const path = require("path");
const fs = require("fs");

var directory = "doc";
var output = "README.md";
var config = path.join(directory, ".generate-readme.json");


/**
 * Write to a file, append with autogen statement if true.
 */
function write(path, string, autogen = false){


    //link to something here later, this string should also be removable from children
    if(autogen){
        string += "\n\n *This file was automatically generated.*"
    }
    fs.writeFileSync(path, string);
}

/**
 * Check and add examples directly above a [Full Example] link
 */
function examples(string, dir){
    var lines = string.split("\n");
    var snippet;
    for(var i = 0; i<lines.length; i++){
        var l = lines[i];
        if(l.includes("[Full Example]")){
            var end = l.indexOf("[Full Example]") + "[Full Example]".length;
            var link = l.substring(end)
            link = link.substring(link.indexOf("(")+1, link.indexOf(")"));
            if(link.startsWith("/")) link = link.substring(1);
            
            var code = fs.readFileSync(link, {encoding: "utf-8"})
            snippet = "```js\n" + code +"\n```";
            if(lines[i-1] && lines[i-1].startsWith("```")){
                lines[i-1] = undefined;
                for(var j = i-2; i>=0; j--){
                    var p = lines[j];
                    lines[j] = undefined;
                    if(p.startsWith("```")) break;
                }
            }
            lines[i] = snippet + "\n" + lines[i];
        }
    }

    var final = "";
    for(var l of lines){
        if(typeof l === "string") final += l + "\n";
    }

    final = final.trim();

    fs.writeFileSync(dir, final);


    return final;
}

function validate(string){
    //fix details with no \n after
    var lines = string.split("\n");
    for(var i=0;i<lines.length; i++){
        var l = lines[i];
        if(l.trim() === "</details>"){
            var nextLine = lines[i+1];
            if(nextLine.trim().length > 0){
                lines[i] += "\n";
            }
        }
    }

    return lines.join("\n")
}

function details(string, summary){
    var detailsOpen = "<details>"
    if(summary) detailsOpen = detailsOpen + "<summary>" + summary + "</summary>";
    var detailsClose = "</details>\n"

    detailsOpen += "\n";

    var lines = string.split("\n");
    var updatedLines = [];
    var firstHeader = false;
    for(var i = 0; i< lines.length; i++){
        var l = lines[i];
        if(!firstHeader){
            if(l.startsWith("#")){
                updatedLines.push(l);
                updatedLines.push(detailsOpen);
                firstHeader = true;
                continue;
            }
        }
        updatedLines.push(l);
    }

    updatedLines.push(detailsClose);

    return updatedLines.join("\n");
}

function subHeadings(string){
    var lines = string.split("\n");
    lines = lines.map((l) => {
        if(l.startsWith("#")){
            l = "#" + l;
        }
        return l;
    })

    return lines.join("\n");
}

function handleChild(child){
    var childContents;
    var dir = path.join(directory, child.name);
    if(child.file === false){
        childContents =  "# " + child.name;
    }
    else{
        childContents = fs.readFileSync(dir, {encoding:"utf-8"});
    }

    var children = child.children;
    if(children)
        for(var c of children){
            var subChildContents = handleChild(c);
            childContents += "\n" + subChildContents;
        }

    if(child.examples){
        childContents = examples(childContents, dir);
    }

    childContents = subHeadings(childContents);

    if(child.hideContents){
        var summary = child.summary;
        childContents = details(childContents, summary)
    }

    return childContents;
}

function generateReadme(){
    var contents = "";
    
    //read config
    var tree = JSON.parse(fs.readFileSync(config, {encoding: "utf-8"}));
    var root = tree[0];

    var rootContents = fs.readFileSync(path.join(directory, root.name), {encoding: "utf-8"});
    contents = rootContents;

    var children = tree[0].children;
    for(var c of children){
        var childContents = handleChild(c);
        contents += "\n" + childContents;
    }

    contents = validate(contents);

    write(output, contents, true)
}

generateReadme();
