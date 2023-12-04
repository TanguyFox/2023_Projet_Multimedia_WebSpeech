//GET VOICE ATTRIBUTS
let voiceSelector = document.getElementById("voiceSelector");
let volume = document.getElementById("volume");
let vitesse = document.getElementById("rate");
let pitch = document.getElementById("pitch");

//GET DOM ELEMENTS
let speechMSG = document.getElementById("speech-available");
let accueil = document.getElementById("container-accueil");
let learn = document.getElementById("container-learning");
let train = document.getElementById("training-container");

//READ Dict
let dict = [];
fetch("resources/dict/dict.json")
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

function loadVoices() {
    let voices = window.speechSynthesis.getVoices();
    console.log(voices);
    voices.forEach(voice => {
        console.log("option");
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
    train.removeAttribute("hidden");
    loadCards();
}

document.getElementById("training-button").onclick = function () {
    train.setAttribute("hidden", "hidden");
    learn.removeAttribute("hidden");
}

document.getElementById("voiceTest").onclick = function () {
    speak("Bonjour");
}

function loadCards(lang = "English"){
    let nbCards = 9;
    cards = dict.slice(0, nbCards);
    for (let i = 0; i < nbCards; i++) {
        let card = createCard(cards[i]["language"][lang], cards[i]["path"]);
        document.getElementById("train-cards").appendChild(card);
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

