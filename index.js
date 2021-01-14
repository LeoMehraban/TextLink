//TextLink 0.1 © 2020-2021 Dogware Inc.
const fetch = require('node-fetch');
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
`
let pageloaded = false
let links = []

function getURL(){
    try{
        readline.question('Enter Command (or type help): ', async command => {
            let commandargs = command.split(' ')
            if(commandargs[0] == 'exit'){
                console.log('Goodbye');
                readline.close();
            }else if(commandargs[0] == 'code'){
                pageloaded = true
                links = []
                counter = 0
                console.log('Running Dev Code....\n')
                console.log(parse(testCode))
                getURL()
            }else if(commandargs[0] == 'help'){
                console.log(`
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
                console.log(parse(txt));
                links = []
                getURL();
            } else if(commandargs[0] == 'link'){
                counter = 0
                const res = await fetch(links[commandargs[1]].url);
                const txt = await res.text();
                console.log(parse(txt));
                links = []
                getURL();
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

function parse(txt = ""){
    let newlines = txt.split('\n');
    let finalCode = []
    for (let i = 0; i < newlines.length; i++) {
        finalCode.push(parseLine(newlines[i]));
    }
    return finalCode.join('\n')
}

function parseLine(txt = ""){
  if(txt.charAt(0) == '.'){
    return parseCommand(txt);
  }
  return txt;
}

function parseCommand(txt = ""){
    let commandType = txt.split(' ')[0];
    if(commandType == '.link'){
        return linkCommand(txt)
    }else{
        return txt;
    }
}

function linkCommand(txt = ""){
    let args = txt.split(' ');
    let textstring = ""
    for (let i = 2; i <= args.length - 1; i++) {
        textstring += args[i] + ' '
    }
    links.push({num: counter, url: args[1]})
    textstring = `[${counter}] ` + textstring + '\n'
    counter++
    return textstring;
}
exports.command = getURL
console.log('Welcome to The TextLink 0.1 Client!\n')
getURL();
