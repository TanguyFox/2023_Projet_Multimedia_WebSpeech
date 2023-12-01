let speechMSG = document.getElementById("speech-available");
let voiceSelector = document.getElementById("voiceSelector");

function checkSpeechAvailable(){
    if('speechSynthesis' in window) {
        speechMSG.innerHTML = "Votre navigateur supporte la la synthèse de la parole"
        speechMSG.classList.add("speechAvailable");
        loadVoices();
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

loadVoices();