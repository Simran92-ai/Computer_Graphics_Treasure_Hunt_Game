/* ui.js
 * Everything DOM-facing outside the game canvas: persisted settings,
 * screen navigation, map cards (now showing best scores), the HUD,
 * and the results overlay.
 * Exposes: TH.UI = { Settings, saveSettings, toggleSetting, initSettingsUI,
 *                     goto, closeOverlay, renderMapCards, selectMap,
 *                     setMode, setDiff, updateHUD, showResults }
 */
(function(){
  const Settings = Object.assign({anim:true, minimap:true}, JSON.parse(localStorage.getItem('th_settings')||'{}'));
  function saveSettings(){ localStorage.setItem('th_settings', JSON.stringify(Settings)); }
  function toggleSetting(k){
    Settings[k]=!Settings[k];
    const el=document.getElementById('t_'+k);
    if(el) el.classList.toggle('on',Settings[k]);
    saveSettings();
  }
  function initSettingsUI(){
    ['anim','minimap'].forEach(k=>{
      const e=document.getElementById('t_'+k);
      if(e) e.classList.toggle('on',!!Settings[k]);
    });
  }

  /* ---- navigation ---- */
  function goto(name){
    document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
    const map={menu:'menuScreen',mapSelect:'mapSelectScreen',mode:'modeScreen',diff:'diffScreen',
      instructions:'instructionsScreen',settings:'settingsScreen',game:'gameScreen'};
    document.getElementById(map[name]).classList.add('active');
    if(name==='mapSelect') renderMapCards();
  }
  function closeOverlay(id){ document.getElementById(id).classList.remove('active'); }

  /* ---- selection flow: map -> mode -> difficulty -> start ---- */
  let pendingMode='time';

  function renderMapCards(){
    const el=document.getElementById('mapCards'); el.innerHTML='';
    Object.values(TH.Maps.MAPS).forEach(m=>{
      const best=TH.Score.bestForMap(m.id);
      const c=document.createElement('button'); c.className='card btn';
      c.innerHTML=`<div class="cat">${m.category}</div><h3>${m.name}</h3><p>${m.desc}</p>`+
        `<div class="meta"><span>${m.treasureName}</span><span>${m.difficulty}</span></div>`+
        (best!==null ? `<div class="meta"><span>Best Score</span><span>${best}</span></div>` : '');
      c.onclick=()=>selectMap(m.id);
      el.appendChild(c);
    });
    TH.Maps.COMING_SOON.forEach(m=>{
      const c=document.createElement('div'); c.className='card locked';
      c.innerHTML=`<div class="cat">${m.category}</div><h3>${m.name}</h3><p>Coming soon</p><div class="meta"><span>${m.treasureName}</span><span>—</span></div>`;
      el.appendChild(c);
    });
  }
  function selectMap(id){
    TH.GameState.State.currentMapId=id;
    const btn=document.getElementById('competeBtn');
    btn.disabled=!TH.Maps.MAPS[id].compete;
    btn.title = TH.Maps.MAPS[id].compete ? '' : 'Not available on this map';
    goto('mode');
  }
  function setMode(m){
    if(m==='compete' && !TH.Maps.MAPS[TH.GameState.State.currentMapId].compete) return;
    pendingMode=m;
    goto('diff');
  }
  function setDiff(d){
    TH.Game.start(TH.GameState.State.currentMapId, pendingMode, d);
  }

  /* ---- HUD ---- */
  function updateHUD(){
    const s=TH.GameState.State;
    document.getElementById('hudLives').textContent='♥'.repeat(Math.max(0,s.lives));
    document.getElementById('hudScore').textContent='Score: '+s.score;
    document.getElementById('healthfill').style.width=Math.max(0,s.health)+'%';
    const tEl=document.getElementById('hudTimer');
    tEl.textContent=TH.Timer.format(Math.max(0,s.timeLeft));
    tEl.classList.toggle('warn', s.timeLeft<20);

    const oEl=document.getElementById('hudObjectives'); oEl.innerHTML='';
    s.map.objectives.forEach((o,i)=>{
      const d=document.createElement('div');
      d.textContent=(s.objectivesDone[i]?'✓ ':'• ')+o;
      if(s.objectivesDone[i]) d.className='done';
      oEl.appendChild(d);
    });

    const invEl=document.getElementById('hudInv'); invEl.innerHTML='';
    if(s.hasKey){ const d=document.createElement('div'); d.className='inv-item'; d.textContent='🔑'; invEl.appendChild(d); }
    if(s.collected.clues>0){ const d=document.createElement('div'); d.className='inv-item'; d.textContent='📜'; invEl.appendChild(d); }
    TH.Hints.updateButtons();
  }

  /* ---- results overlay ---- */
  function row(l,v){ return `<div><span>${l}</span><span>${v}</span></div>`; }

  function showResults(data){
    const {kind,map,mode,diff,collected,playerTime,aiTime,winner,timeBonus,finalScore,bestScore,isNewBest}=data;
    document.getElementById('resultsTitle').textContent =
      kind==='win' ? 'TREASURE FOUND!' :
      kind==='gameover' ? 'GAME OVER' :
      kind==='lose' ? 'THE COMPUTER WON' : 'TIME UP';

    const wsEl=document.getElementById('winScene');
    if(kind==='win'){ wsEl.style.display='block'; TH.Animation.drawWinScene(wsEl.getContext('2d'),wsEl); }
    else { wsEl.style.display='none'; }

    let html='';
    html+=row('Map',map.name);
    html+=row('Mode', mode==='compete'?'Compete with Computer':'Time Challenge');
    html+=row('Difficulty', diff);
    html+=row('Treasure', kind==='win' ? map.treasureName : '—');
    html+=row('Coins',collected.coins); html+=row('Clues',collected.clues);
    html+=row('Keys',collected.keys); html+=row('Checkpoints',collected.checkpoints);
    if(mode==='compete'){
      html+=row('Player Time', playerTime ? TH.Timer.format(playerTime) : '—');
      html+=row('Computer Time', aiTime ? TH.Timer.format(aiTime) : '—');
      html+=row('Winner', winner==='player' ? 'You!' : (winner==='ai' ? 'Computer' : '—'));
    }
    if(kind==='win') html+=row('Time Bonus','+'+timeBonus);
    html+=row('Best Score', bestScore!==null ? bestScore+(isNewBest?' 🏆 New Best!':'') : '—');
    html+='<div class="final">Final Score '+finalScore+'</div>';

    document.getElementById('resultsBody').innerHTML=html;
    const ov=document.getElementById('resultsOverlay');
    ov.classList.add('active');
    ov.scrollTop=0;
  }

  window.TH = window.TH || {};
  TH.UI = {Settings, saveSettings, toggleSetting, initSettingsUI, goto, closeOverlay,
    renderMapCards, selectMap, setMode, setDiff, updateHUD, showResults};
})();
