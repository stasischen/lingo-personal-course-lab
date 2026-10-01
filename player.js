/* Article-level controls, using the same Android-compatible speech path. */
(() => {
  const el = id => document.getElementById(id);
  const cards = () => [...document.querySelectorAll('.sentence-card')];
  let index = 0, playing = false, paused = false, continuous = false, generation = 0;
  const paint = () => {
    el('pause-reading').disabled = !playing && !paused;
    el('pause-reading').textContent = paused ? '繼續' : '暫停';
    el('stop-reading').disabled = !playing && !paused;
    el('player-position').textContent = cards().length ?
      `${index + 1} / ${cards().length}${paused ? ' · 已暫停，繼續將重播本句' : ''}` : '開啟文章即可聆聽';
  };
  window.lingoStopped = () => {
    generation++; playing = false; paused = false;
    cards().forEach(card => card.classList.remove('speaking'));
    paint();
  };
  const play = () => {
    const list = cards();
    if (!list[index]) return;
    const current = ++generation;
    playing = true; paused = false;
    const card = list[index];
    list.forEach(c => c.classList.remove('speaking'));
    card.classList.add('speaking');
    if (el('follow-reading').checked) card.scrollIntoView({behavior:'smooth',block:'center'});
    paint();
    window.lingoSpeak(card.dataset.text, card.dataset.language, {
      continueQueue:true,
      onError: () => { if (generation === current) window.lingoStopped(); },
      onEnd: () => {
        if (generation !== current) return;
        if (el('loop-reading').checked) { play(); return; }
        if (continuous && index + 1 < cards().length) { index++; play(); }
        else { playing = false; card.classList.remove('speaking'); paint(); }
      }
    });
  };
  window.lingoSentence = selected => {
    window.lingoStop(); index = selected; continuous = false; play();
  };
  window.lingoPlayerReset = () => {
    window.lingoStop(); index = 0;
    el('loop-reading').checked = false;
    paint();
  };
  el('read-all').addEventListener('click', () => {
    window.lingoStop(); index = 0; continuous = true; play();
  });
  el('read-from').addEventListener('click', () => {
    window.lingoStop(); continuous = true; play();
  });
  el('pause-reading').addEventListener('click', () => {
    if (paused) { play(); return; }
    if (!playing) return;
    window.lingoStop(); paused = true; paint();
  });
  el('stop-reading').addEventListener('click', () => window.lingoStop());
  el('speech-rate').addEventListener('change', () => { if (playing) play(); });
  paint();
})();
