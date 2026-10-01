/* Browser speech API; no application server or audio service is configured. */
(() => {
  let ticket = 0;
  const status = text => { document.getElementById('status').textContent = text; };
  window.lingoStop = () => { ticket++; window.speechSynthesis?.cancel(); };
  window.lingoSpeak = (text, language) => {
    window.lingoStop();
    const current = ticket;
    const synth = window.speechSynthesis;
    if (!synth || !window.SpeechSynthesisUtterance) {
      status('此瀏覽器不支援發音，請改用支援語音的瀏覽器。'); return;
    }
    try {
      const tag = language.toLowerCase();
      const voices = synth.getVoices();
      const voice = voices.find(v => v.lang.toLowerCase() === tag)
        || voices.find(v => v.lang.toLowerCase().split('-')[0] === tag.split('-')[0]);
      if (voices.length && !voice) {
        status(`此裝置沒有 ${language} 語音，請先安裝該語言的系統語音。`); return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.85;
      if (voice) utterance.voice = voice;
      utterance.onstart = () => { if (current === ticket) status(`正在發音（${language}）：${text}`); };
      utterance.onend = () => { if (current === ticket) status('發音完成。'); };
      utterance.onerror = () => { if (current === ticket) status(`發音失敗，請確認裝置有 ${language} 語音或改用其他瀏覽器。`); };
      status(`正在啟動 ${language} 發音…`);
      synth.speak(utterance);
    } catch (_) { status('無法啟動發音，請改用其他瀏覽器。'); }
  };
})();
