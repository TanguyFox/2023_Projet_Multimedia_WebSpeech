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
let languageSelector = document.getElementById("language-selection");
let micro = document.getElementById("micro");

//LANGUAGE ATTRIBUTES
let language, datalang;

let vocalMsg = {
    "Vrai" : {
        "French": "Bonne Réponse",
        "English": "Correct",
        "Chinese": "正确"
    },
    "Faux" : {
        "French": "Mauvaise Réponse",
        "English": "Incorrect",
        "Chinese": "错误"
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

let nbCards = 9;
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

languageSelector.onchange = function () {
    voiceSelector.innerHTML = "";
    let index = this.selectedIndex
    language = this.value;
    datalang = this.options[index].dataset.lang
    loadVoices(datalang);
    document.getElementById("voice-config").removeAttribute("hidden");
}

function loadCards(node, lang){
    node.innerHTML = "";
    for (let i = 0; i < nbCards; i++) {
        let card = createCard(cards[i]["language"][lang], cards[i]["path"]);
        node.appendChild(card);
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
    let node;
    if(e.target.parentNode.classList.contains("card")){
        node = e.target.parentNode;
    }else if(e.target.classList.contains("card")){
        node = e.target;
    }else{
        return;
    }

    window.speechSynthesis.cancel();
    speak(node.lastElementChild.innerHTML);

    node.classList.add("clicked")

    setTimeout(() => {
        node.classList.remove('clicked');
    }, 500);

});

themeSelector.onchange = function () {
    shuffleList(dict);
    cards = dict.filter(card => card['theme'] === themeSelector.value).slice(0, nbCards);
    loadCards(learningCards, language);
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
    loadCards(trainingCards, language);

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
}

let nbEssaies = 1;
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

        speak(vocalMsg['Vrai'][language]);

        node.classList.add("correct");
        old_answers.push(answer);

        shuffleList(cardList);
        question = cardList.pop();
        nbEssaies = 1;
        score++;
        if(question){
            speak(question['texte']);
        }else {
            gameOver();
        }

    }else{

        speak(vocalMsg['Faux'][language]);

        if(nbEssaies > 0){

            node.classList.add("incorrect");
            setTimeout(() => {
                node.classList.remove('incorrect');
            }, 500);
            nbEssaies--;
        }else{
            node.classList.add("incorrect");
            setTimeout(() => {
                node.classList.remove('incorrect');
            }, 500);

            trainingCards.children[question["indice"]].classList.add("incorrect");
            nbEssaies = 1;
            old_answers.push(question["texte"]);

            shuffleList(cardList);
            question = cardList.pop();
            if(question){
                speak(question['texte']);
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
    document.getElementById("fin_jeu-info").textContent = `Fin du jeu ! Votre score est de ${score}.`;
    document.getElementById("again-container").hidden = false;
}

document.getElementById("again-button").onclick = function (){
    location.reload();
}



