var msg = new SpeechSynthesisUtterance("ご飯食べたい");

msg.lang = "ja-JP";

window.speechSynthesis.speak(msg);
