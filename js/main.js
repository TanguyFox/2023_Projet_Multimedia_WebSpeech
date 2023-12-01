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

