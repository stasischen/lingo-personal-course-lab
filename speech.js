/* Browser speech API. Let the installed engine choose its voice from lang. */
(() => {
  let ticket = 0;
  let active = null; // Keep the utterance alive until the engine finishes.
  let startupTimer = null;
  const status = text => { document.getElementById('status').textContent = text; };
  const locale = language => {
    const tag = String(language || '').replaceAll('_', '-');
    return ({en:'en-US',ja:'ja-JP',ko:'ko-KR',zh:'zh-TW',th:'th-TH',
      de:'de-DE',fr:'fr-FR',es:'es-ES'})[tag.toLowerCase()] || tag;
  };
  const clearTimer = () => { clearTimeout(startupTimer); startupTimer = null; };
  window.lingoStop = () => {
    ticket++;
    clearTimer();
    const synth = window.speechSynthesis;
    // Avoid cancel() immediately before the very first idle speak on mobile.
    if (active || synth?.speaking || synth?.pending) synth?.cancel();
    active = null;
  };
  window.lingoSpeak = (text, language) => {
    window.lingoStop();
    const current = ticket;
    const synth = window.speechSynthesis;
    if (!synth || !window.SpeechSynthesisUtterance) {
      status('此瀏覽器不支援發音，請用 Chrome 或其他支援語音的瀏覽器開啟。'); return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      active = utterance;
      utterance.lang = locale(language);
      utterance.rate = 1;
      // No voice-list gate and no forced voice. Android engines can speak even
      // when getVoices() is empty, incomplete, or uses different locale labels.
      utterance.onstart = () => {
        if (current !== ticket) return;
        clearTimer();
        status(`正在發音（${utterance.lang}）：${text}`);
      };
      utterance.onend = () => {
        if (current !== ticket) return;
        clearTimer(); active = null; status('發音完成。');
      };
      utterance.onerror = event => {
        if (current !== ticket) return;
        clearTimer(); active = null;
        const code = event.error || 'unknown';
        status(`發音失敗（${code}；${utterance.lang}）。請再點一次；若仍無聲，請把這段訊息與瀏覽器名稱提供給我們。`);
      };
      status(`正在啟動 ${utterance.lang} 發音…`);
      startupTimer = setTimeout(() => {
        if (current !== ticket || active !== utterance) return;
        status(`語音引擎尚未回應（${utterance.lang}）。請再點一次發音；若仍無聲，請告知瀏覽器名稱。`);
      }, 8000);
      // Stay in the original click handler to retain user activation.
      if (synth.paused) synth.resume();
      synth.speak(utterance);
    } catch (_) {
      clearTimer(); active = null;
      status('無法啟動發音，請重新點擊，或用手機 Chrome 直接開啟此頁。');
    }
  };
})();
