
Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}


function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function savedate(){
    const date = new Date()
    const datesaved = new Date(localStorage.getItem("newDate"))
    
    localStorage.setItem("oldDate", datesaved)
    localStorage.setItem("newDate", date)
           
}

let ntrials = null
const maxNtrials = 10

function resetNtrials(){
    dateOld = new Date(localStorage.getItem("oldDate"))
    dateNew = new Date(localStorage.getItem("newDate"))

    if (!((dateOld.getMonth() == dateNew.getMonth()) 
        && (dateOld.getDate() == dateNew.getDate()))){
        ntrials = 0
        localStorage.setItem("ntry", ntrials)
    }
}

function getRandomInt(max,min=0) {
    return Math.floor(Math.random() * (max-min) + min);
  }

function format_signif(x, nsignif=2) {
    let ndecimals = 0;
    if (x != 0){
        ndecimals = Math.floor(-Math.log10(Math.abs(x)))
    }
    ndecimals += nsignif
    if (ndecimals <= 0 ){
        return `${Math.round(x).toFixed(0)}`
    }
    else{
        return `${(Math.round(x * Math.pow(10, ndecimals)) * Math.pow(10, -(ndecimals))).toFixed(ndecimals)}`
    } 
}

function get_units(){
    let ret = ["m", "l", "g", "N"].sample()
    let exponent = 1
    if (ret == "m"){
        const listmeters = ["", "<sup>2</sup>", "<sup>3</sup>"]
        const expString = listmeters.sample()
        exponent += listmeters.indexOf(expString)
        ret += expString
    }
    return [ret, exponent]
} 

const listprefs = ["m","c","d","","da", "h", "k"].reverse()
function get_prefix(except="all fine"){
    let listprefs_ = listprefs
    if (except!=="all fine"){
        listprefs_ = listprefs_.filter(function(e) {return e !== except})
    }
    return listprefs_.sample()
} 

function splitStringNum (strnum){
    const re = /(\d*)\.?(\d*)/;
    return (strnum.match(re)).slice(1)
}

class dottedNum{
    constructor(strnum){
        [this.integers, this.decimals] = splitStringNum(strnum)
    }
    getIntegers(){
        return this.integers.split("")
    }
    getDecimals(){
        return this.decimals.split("")
    }
}

const equivalence_field = document.querySelector("div.field")
const hint_field = document.querySelector("div.hint1")
let exp = null
let un = null
let pref1 = null
let pref2 = null
let digits = null
let nhints = 0


function new_equivalency(){
    ntrials = +localStorage.getItem("ntry")
    console.log(ntrials, maxNtrials)
    if (ntrials < maxNtrials){
        const [un_, exp_] = get_units()
        exp = exp_
        un = un_
        pref1 =  get_prefix()
        pref2 = get_prefix(pref1)
        const num = format_signif((getRandomInt(99)+1)*Math.pow(10, getRandomInt(2,-4)))
        digits = new dottedNum(num)
        
        equivalence_field.innerHTML = num + pref1 + un + " =  ? " + pref2 + un
        hint_field.textContent = "Indizio"
        const tab = document.querySelector("table")
        tab.innerHTML = ""
        nhints = 0;

        ntrials+=1;
    }
    else{
        confirmOn("button2")
    }
    localStorage.setItem("ntry", ntrials)
    
}

function fillTableLine(lineElement, ind1, ind2, fillDigit="", unitInd="left"){
    
    lineElement.innerHTML = ""
    switch(unitInd){
        case "left":
            unitInd = ind1
            break;
        case "right":
            unitInd = ind2
            break;
        default:
            throw new Error("unknown value for 'unitInd' argument (must be 'left' or 'right')")
    }
    let ints = (digits.getIntegers()).reverse()
    let decs = digits.getDecimals()

    conditions1 = [
        function(i){return(i*exp < ints.length) || (ind1-i >= ind2)}, 
        function(i){return(i*exp < decs.length) || (ind1+i+1 <= ind2)}
    ]
    conditions2 = [
        function(i){return ind1-i == unitInd}, 
        function(i){return ind1+i+1 == unitInd}
    ]
    inserts = ["afterbegin", "beforeend"]
    arrays = [ints, decs] 

    for (let iCase = 0; iCase<2; ++iCase){
        for (let i=0; conditions1[iCase](i); ++i){
            for (let j=0; j<exp; ++j){
                let digit = null
                if(j+i*exp < arrays[iCase].length){
                    digit = `${arrays[iCase][j+i*exp]}`
                } 
                else{
                    digit = fillDigit
                }
                if(conditions2[iCase](i) && (j==0)){
                    digit = '<div class="unitDigit">' + digit + '.</div>'
                }
                lineElement.insertAdjacentHTML(inserts[iCase], '<td>' + digit + '</td>')
            } 
        }
    }
}

function hintTable(n=0){
    const tab = document.querySelector("table")

    tab.innerHTML = ""

    var row0 = tab.insertRow(0)
    row0.id = "prefs"
    var row1 = tab.insertRow(1)
    row1.id = "digitBoxes"

    
    //tab.innerHTML += '<tr id="prefs"></tr><tr id="digitBoxes"></tr>'

    const prefsline = document.querySelector("tr#prefs")
    const boxesline = document.querySelector("tr#digitBoxes")

    const ind1 = listprefs.indexOf(pref1)
    const ind2 = listprefs.indexOf(pref2)

    prefsline.innerHTML = ''
    boxesline.innerHTML = ""

   

    let ints = digits.getIntegers().reverse()
    let decs = digits.getDecimals()

    for (let i = 0; (i*exp < ints.length) || (ind1 - i >= ind2); ++i ){
        if(-i + ind1 >= 0){
            prefsline.insertAdjacentHTML("afterbegin", '<th colspan="' + `${exp}` + '">' + listprefs[-i + ind1] + un + '</th>')
        }else{
            prefsline.insertAdjacentHTML("afterbegin", '<th colspan="' + `${exp}` + '"></th>')
        }
    }
    for (let i = 0; (i*exp < decs.length) || (ind1 + i + 1 <= ind2); ++i ){
        if(i + ind1 + 1 < listprefs.length){
            prefsline.innerHTML += '<th colspan="' + `${exp}` + '">' + listprefs[i + ind1 + 1] + un + '</th>'
        }else{
            prefsline.innerHTML += '<th colspan="' + `${exp}` + '"></th>'
        }
    }

    fillTableLine(boxesline, ind1, ind2)
   
    if (n>0){
        var row2 = tab.insertRow(2) 
        row2.id = "solDigits"  
        //tab.innerHTML += '<tr id="solDigits"></tr>'
        const solline = row2 //document.querySelector("tr#solDigits")
        fillTableLine(solline, ind1, ind2, fillDigit="0", unitInd="right")
    }

}

function glowEquBox(){
    equivalence_field.style.border = "4px solid #bbff00"
    setTimeout(
        function(){
            equivalence_field.style.border = "2px solid black"
        }, 
    200)
}



function confirmOn(s = "button1") {
    console.log(s)
    document.querySelector("." + `${s}`).style.display = "inline-block";
    document.querySelector("." + `${s}`).style.visibility = "visible";
}

function confirmOff(s = "button1") {
    document.querySelector("." + `${s}`).style.display = "none";
    document.querySelector("." + `${s}`).style.visibility = "hidden";
} 

localStorage.setItem("newDate",new Date())
savedate()
resetNtrials()
new_equivalency() //initialize cell with first quiz
equivalence_field.addEventListener("click", function(){confirmOn()})

document.querySelector(".button1 > .choice > div.ok").addEventListener("click", function(){
    confirmOff()
    new_equivalency()
})
document.querySelector(".button1 > .choice > div.no").addEventListener("click", function(){
    confirmOff()
})
document.querySelector(".button2 > .choice > div.ok").addEventListener("click", function(){
    confirmOff("button2")
})
hint_field.addEventListener("click", function(){

    if (nhints == 0){
        sleep(500)
        hint_field.textContent = "Soluzione"
        hintTable(nhints)
        nhints = Math.min(nhints+1, 2)        
    }
    else if(nhints == 1){
        const nsecs = 20
        let i = 0;
        hint_field.pointerEvents = "none"
        var refresh = setInterval(function(){
            hint_field.innerHTML = "Soluzione tra<br>" + `${nsecs-i}` + "s"
            i += 1;
            if (i > nsecs){
                clearInterval(refresh)
                hintTable(nhints)
                nhints = Math.min(nhints+1, 2)
                hint_field.pointerEvents = "auto"
                hint_field.innerHTML = "Clicca il box dell'equivalenza<br>per nuovo esercizio"
            }
        }
            , 1000)    
        
    }
    else if(nhints == 2){
        hint_field.innerHTML = "Clicca il box dell'equivalenza<br>per nuovo esercizio"
        glowEquBox()
    } 
    else{
        throw Error(`unexpected value for 'nhints' (${nhints})`)
    }
    
    
})



