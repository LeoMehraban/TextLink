const fetch = require('node-fetch');
const colors = require('colors');
const fs = require('fs')
const prompt = require('prompt-sync')({sigint: true});
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})
let counter = 0;
let testCode = `Dogs Are Cute
.link file:///Users/leomehraban/Desktop/TextLink/more.txtl Learn More
.link file:///Users/leomehraban/Desktop/TextLink/more.txtl Learn More
.link file:///Users/leomehraban/Desktop/TextLink/more.txtl Learn More
.link http://textfiles.com/100/adventur.txt Cool Stuff
.input @variable Test Test Test
Blah
@variable is cool
`
let pageloaded = false
let stuff = []
let variables = []
let values = []
let history = []
let page;
function launch(){
	console.log('Welcome to The TextLink 0.6 Client!\n'.green)
	if(process.argv[2] == '-o'){
		let txt = fs.readFileSync(process.argv[3], "utf8")
		counter = 0
        pageloaded = true
        // const res = await fetch(commandargs[1]);
        // const txt = await res.text();
        page = txt
        console.log(parse(txt));
        //history.push(commandargs[1])
        stuff = []
        variables = []
        values = []
        getURL();
	} else {
		getURL();
	}
} 
function getURL(){
    try{
        readline.question('Enter Command (or type help): ', async command => {
            let commandargs = command.split(' ')
            if(commandargs[0] == 'exit'){
                console.log('Goodbye'.blue);
                readline.close();
            }else if(commandargs[0] == 'clear'){
                console.clear()
                getURL()
            }else if(commandargs[0] == 'var' && pageloaded){
                let variable;
                for(let i = 0; i < variables.length; i++){
                    if(variables[i].name == commandargs[1]){
                        variable = variables[i];
                        break;
                    }
                }
                if(variable){
                    console.log(variable.value);
                } else {
                    console.log(`Variable ${commandargs[1]} is not defined`)
                }
                getURL()
            }else if(commandargs[0] == 'code'){
                counter = 0
                pageloaded = true
                stuff = []
                variables = []
                values = []
                console.log('Running Dev Code....\n')
                history.push("textlink.code")
                page = testCode
                console.log(parse(testCode))
                getURL()
            }else if(commandargs[0] == 'help'){
                console.log(`
                Sorry, i'm not good at documetation
                COMMAND LIST:
                    exit = quit the program
                    go #url - go to url
                    link #linknumber - when a web page is loaded, enter link number
                `)
                getURL()
            } else if(commandargs[0] == 'go'){
                counter = 0
                pageloaded = true
                const res = await fetch(commandargs[1]);
                const txt = await res.text();
                page = txt
                console.log(parse(txt));
                history.push(commandargs[1])
                stuff = []
                variables = []
                values = []
                getURL();
            } else if(commandargs[0] == 'link'){
                if(stuff[commandargs[1]].type == 'link'){
                    const res = await fetch(stuff[commandargs[1]].url);
                    const txt = await res.text();
                    page = txt
                    console.log(parse(txt));
                    history.push(stuff[commandargs[1]].url)
                    stuff = []
                    variables = []
                    values = []
                    getURL();
                }else if(stuff[commandargs[1]].type == 'input'){
                    let variable = stuff[commandargs[1]].variable
                    let value = prompt('Input: ');
                    variables[variables.indexOf(variable)].value = value
                    stuff[commandargs[1]].variable.value = value
                    counter = 0;
                    console.log(parse(page,false));
                    getURL();
                }
            } else {
                console.log('unrecognized command\n')
                getURL()
            }
        });
    } catch {
        console.log('Something went wrong :(\n')
        getURL()
    }
}

function parse(txt = "",v = true){
    let newlines = txt.split('\n');
    let finalCode = []
    for (let i = 0; i < newlines.length; i++) {
        finalCode.push(parseLine(newlines[i],v));
    }
    return finalCode.join('\n')
}

function parseLine(txt = "",v){
  if(txt.charAt(0) == '.'){
    return parseCommand(txt,v);
  } else if(txt.charAt(0) == '@') {
    return variable(txt,v)
  }
  return txt;
}

function variable(txt = "",v){
    let args = txt.split(' ')
    let text = '';
    for (let i = 1; i <= args.length - 1; i++) {
        text += args[i] + ' '
    }
    for(let i = 0; i < variables.length; i++){
        if(variables[i].name == args[0]){
            // stuff.push({num: counter, variable: txt, type: 'input'})
            return parseLine(variables[i].value + text,v)
        }
    }
    return txt   
}

function parseCommand(txt = "",v){
    let commandType = txt.split(' ')[0];
    if(commandType == '.link'){
        return linkCommand(txt,v)
    }else if(commandType == '.input'){
        return inputCommand(txt,v)
    }else{
        return txt;
    }
}

function linkCommand(txt = "",v){
    let args = txt.split(' ');
    let textstring = ""
    for (let i = 2; i <= args.length - 1; i++) {
        textstring += args[i] + ' '
    }
    if(v) stuff.push({num: counter, url: args[1],type: 'link'})
    textstring = `[${counter}] ` + textstring + '\n'
    counter++
    return textstring;
}
function inputCommand(txt = "",v){
    let args = txt.split(' ')
    let textstring;
    let text = '';
    for (let i = 2; i <= args.length - 1; i++) {
        text += args[i] + ' '
    }
    let variable = {name: args[1], value: text}
    if(v) stuff.push({num: counter, variable: variable, type: 'input'})
    if(v) {
        variables.push(variable) 
    } else {
        for(let i = 0; i < variables.length; i++){
            if(variables[i].name == variable.name){
                variable = variables[i]
                break;
            }
        }
    }
    textstring = `(${counter}) ${variable.value}`
    counter++
    return textstring
}
async function loadPage(url){
    const res = await fetch(url);
    const txt = await res.text();
    page = txt
    console.log(parse(txt));
    history.push(url)
    stuff = []
    variables = []
    values = []
}
exports.command = getURL
launch()
