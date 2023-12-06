//GET VOICE ATTRIBUTS
let voiceSelector = document.getElementById("voiceSelector");
let volume = document.getElementById("volume");
let vitesse = document.getElementById("rate");
let pitch = document.getElementById("pitch");

//GET DOM ELEMENTS
let speechMSG = document.getElementById("speech-available");
let accueil = document.getElementById("config");
let themeSelector = document.getElementById("theme-selector");
let learn = document.getElementById("container-learning");
let learningCards = learn.querySelector("#learn-cards");
let train = document.getElementById("training-container");
let trainingCards = document.getElementById("train-cards");
let languageSelector = document.getElementById("language-selection");
let micro = document.getElementById("micro");

//LANGUAGE ATTRIBUTES
let language, datalang;

let vocalMsg = {
    "Vrai" : {
        "French": "Bonne Réponse !",
        "English": "Correct !",
        "Chinese": "正确",
        "Spanish" : "Bien hecho !",
        "German" : "Gut !"
    },
    "Faux" : {
        "French": "Mauvaise Réponse...",
        "English": "Incorrect...",
        "Chinese": "错误",
        "Spanish" : "Falso...",
        "German" : "Falsche..."
    },
    "Greeting":{
        "French": "Bonjour !",
        "English": "Hello !",
        "Chinese": "你好",
        "Spanish" : "Buenos dias !",
        "German" : "Hallo !",
    }
}

//READ Dict
let dict = [];
fetch("ressources/dict/dict.json")
    .then(response => response.json())
    .then(json => {
        dict = json["dict"];
        shuffleList(dict);
    })
    .catch(err => console.log(err));

function shuffleList(list) {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
}

function checkSpeechAvailable(){
    if('speechSynthesis' in window) {
        speechMSG.innerHTML = "Votre navigateur supporte la synthèse de la parole"
        speechMSG.classList.add("speechAvailable");
        window.speechSynthesis.onvoiceschanged = function () {loadVoices()}
        return true
    } else {
        speechMSG.getElementById("speech-available").innerHTML = "Votre navigateur ne supporte pas la synthèse de la parole, vous ne pouvez malheureusement pas utiliser notre application";
        speechMSG.classList.add("warningMsg")
        document.getElementById("config").setAttribute("hidden", "hidden");
        return false
    }
}

function loadVoices(lang) {
    let voices = window.speechSynthesis.getVoices().filter(voice => voice.lang === lang);
    voices.forEach(voice => {
        let option = document.createElement("option");
        option.value = voice.name;
        option.innerHTML = voice.name;
        voiceSelector.appendChild(option)
    })
}

function speak(text) {

    let msg = new SpeechSynthesisUtterance()
    msg.text = text;

    msg.volume = parseFloat(volume.value);
    msg.rate = parseFloat(vitesse.value);
    msg.pitch = parseFloat(pitch.value);

    if(voiceSelector.value) {
        msg.voice = speechSynthesis.getVoices().filter(voice => voice.name === voiceSelector.value)[0];
    }
    window.speechSynthesis.speak(msg);
}

window.onload = checkSpeechAvailable

let nbCards = 9;
let cards = [];

document.getElementById("startButton").onclick = function () {
    accueil.setAttribute("hidden", "hidden");
    speechMSG.setAttribute("hidden", "hidden");
    learn.removeAttribute("hidden");
}

document.getElementById("training-button").onclick = function () {
    learn.setAttribute("hidden", "hidden");
    train.removeAttribute("hidden");
}

document.getElementById("voiceTest").onclick = function () {
    speak(vocalMsg['Greeting'][language]);
}

languageSelector.onchange = function () {
    voiceSelector.innerHTML = "";
    let index = this.selectedIndex
    language = this.value;
    datalang = this.options[index].dataset.lang
    loadVoices(datalang);
    document.getElementById("voice-config").removeAttribute("hidden");
}

function loadCards(node, lang, displayTitle){
    node.innerHTML = "";
    for (let i = 0; i < nbCards; i++) {
        let card = createCard(cards[i]["language"][lang], cards[i]["path"], displayTitle);
        node.appendChild(card);
    }
}

function createCard(title, imgPath, displayTitle){
    let card = document.createElement('div');
    card.classList.add("card");
    let img = document.createElement('img');
    img.src = imgPath;
    card.appendChild(img);
    let cardTitle = document.createElement('h2');
    cardTitle.innerHTML = title;
    cardTitle.classList.add("card-title");
    card.appendChild(cardTitle);
    if (!displayTitle) {
        cardTitle.setAttribute("hidden", "hidden");
    }
    return card;
}

learningCards.addEventListener("click", function (e) {
    let node;
    if(e.target.parentNode.classList.contains("card")){
        node = e.target.parentNode;
    }else if(e.target.classList.contains("card")){
        node = e.target;
    }else{
        return;
    }

    if(window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    speak(node.lastElementChild.innerHTML);

    node.classList.add("clicked")

    setTimeout(() => {
        node.classList.remove('clicked');
    }, 500);

});

themeSelector.onchange = function () {
    shuffleList(dict);
    cards = dict.filter(card => card['theme'] === themeSelector.value).slice(0, nbCards);
    loadCards(learningCards, language, true);
    learn.querySelector("#learning-playzone").removeAttribute("hidden");
}

let question;
let score = 0;
let cardList = [];
let old_answers = [];

document.getElementById("training-button").onclick = function () {
    learn.setAttribute("hidden", "hidden");
    train.removeAttribute("hidden");
    shuffleList(cards);
    loadCards(trainingCards, language, false);

    for(let i = 0; i < cards.length ; i++){
        cardList.push({
            "indice": i,
            "texte": cards[i]["language"][language]
        })
    }

    shuffleList(cardList);
    question = cardList.pop();
    speak(question['texte']);
}

//Micro
micro.onclick = function () {
    window.speechSynthesis.cancel();
    speak(question['texte']);

    microOn();
}

function microOn(){
    micro.classList.add("clicked");
    setTimeout(() => {
        micro.classList.remove('clicked');
    }, 500);
}

let nbEssais = 1;
trainingCards.addEventListener("click", function (e) {
    let node;
    if(e.target.parentNode.classList.contains("card")){
        node = e.target.parentNode;
    }else if(e.target.classList.contains("card")){
        node = e.target;
    }else{
        return;
    }

    let answer = node.lastElementChild.innerHTML;

    if(old_answers.includes(answer)){
        return;
    }

    if(answer === question["texte"]){

        window.speechSynthesis.cancel();

        speak(vocalMsg['Vrai'][language]);
        microOn();

        node.classList.add("correct");
        node.lastElementChild.hidden = false;

        old_answers.push(answer);

        shuffleList(cardList);
        question = cardList.pop();
        nbEssais = 1;
        score++;
        if(question){
            speak(question['texte']);
            microOn();
        }else {
            gameOver();
        }

    }else{

        window.speechSynthesis.cancel();

        speak(vocalMsg['Faux'][language]);
        microOn();

        if(nbEssais > 0){

            node.classList.add("incorrect");
            setTimeout(() => {
                node.classList.remove('incorrect');
            }, 500);
            nbEssais--;
        }else{
            node.classList.add("incorrect");
            setTimeout(() => {
                node.classList.remove('incorrect');
            }, 500);

            trainingCards.children[question["indice"]].classList.add("incorrect");
            trainingCards.children[question["indice"]].lastElementChild.hidden = false;

            nbEssais = 1;
            old_answers.push(question["texte"]);

            shuffleList(cardList);
            question = cardList.pop();
            if(question){
                speak(question['texte']);
                microOn();
            }else {
                gameOver();
            }
        }
    }
});

function gameOver(){
    window.speechSynthesis.cancel();
    document.getElementById("micro-container").hidden = true;
    document.getElementById("fin_jeu-container").hidden = false;
    document.getElementById("fin_jeu-info").textContent = `Fin du jeu ! Votre score est de ${score}/9.`;
    document.getElementById("again-container").hidden = false;
}

document.getElementById("home").onclick = function (){
    location.reload();
}



