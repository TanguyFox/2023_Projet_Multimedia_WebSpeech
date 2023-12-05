//GET VOICE ATTRIBUTS
let voiceSelector = document.getElementById("voiceSelector");
let volume = document.getElementById("volume");
let vitesse = document.getElementById("rate");
let pitch = document.getElementById("pitch");

//GET DOM ELEMENTS
let speechMSG = document.getElementById("speech-available");
let accueil = document.getElementById("container-accueil");
let themeSelector = document.getElementById("theme-selector");
let learn = document.getElementById("container-learning");
let learningCards = learn.querySelector("#learn-cards");
let train = document.getElementById("training-container");
let trainingCards = document.getElementById("train-cards");

//LANGUAGE ATTRIBUTES
let language, datalang;

//READ Dict
let dict = [];
let cardList = [];
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
        document.getElementById("container-accueil").setAttribute("hidden", "hidden");
        return false
    }
}

function loadVoices(lang) {
    let voices = window.speechSynthesis.getVoices().filter(voice => voice.lang === lang);
    console.log(voices);
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

let cards = [];

document.getElementById("startButton").onclick = function () {
    accueil.setAttribute("hidden", "hidden");
    learn.removeAttribute("hidden");
}

document.getElementById("training-button").onclick = function () {
    learn.setAttribute("hidden", "hidden");
    train.removeAttribute("hidden");
}

document.getElementById("voiceTest").onclick = function () {
    speak("Bonjour");
}

document.getElementById("language-selection").onchange = function () {
    voiceSelector.innerHTML = "";

    let index = this.selectedIndex
    language = this.value;
    datalang = this.options[index].dataset.lang
    loadVoices(datalang);
    document.getElementById("voice-config").removeAttribute("hidden");
}

function loadCards(lang, theme){
    let nbCards = 9;
    cards = dict.filter(card => card['theme'] === theme).slice(0, nbCards);
    for (let i = 0; i < nbCards; i++) {
        let card = createCard(cards[i]["language"][lang], cards[i]["path"]);
        cardList.push(card);
    }
}

function createCard(title, imgPath){
    let card = document.createElement('div');
    card.classList.add("card");
    let img = document.createElement('img');
    img.src = imgPath;
    let cardTitle = document.createElement('h2');
    cardTitle.innerHTML = title;
    cardTitle.classList.add("card-title");
    card.appendChild(img);
    card.appendChild(cardTitle);
    return card;
}

learningCards.addEventListener("click", function (e) {
    let node = e.target.parentNode;
    console.log(e.target)
    speak(node.lastElementChild.innerHTML);
    node.classList.add("clicked")
    setTimeout(() => {
        node.classList.remove('clicked');
    }, 500);
});

themeSelector.onchange = function () {
    learningCards.innerHTML = "";
    cardList = [];
    loadCards(language, this.value);
    cardList.forEach(card => learningCards.appendChild(card));
    learn.querySelector("#learning-playzone").removeAttribute("hidden");
}

document.getElementById("training-button").onclick = function () {
    learn.setAttribute("hidden", "hidden");
    train.removeAttribute("hidden");
    cardList.forEach(card => trainingCards.appendChild(card));
}
