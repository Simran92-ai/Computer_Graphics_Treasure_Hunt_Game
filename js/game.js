/* game.js
 * The orchestrator. Owns the requestAnimationFrame loop, keyboard
 * state, pause/resume/restart, life loss, and the win/lose/end-game
 * flow. It coordinates the other modules but holds no gameplay rules
 * of its own beyond that.
 * Exposes: TH.Game = { start, stop, pause, resume, restart, loseLife,
 *                       finishPlayer, finishAI, endGame, isRunning }
 */
(function(){
  let raf=null, lastT=0;
  const keys={};

  window.addEventListener('keydown', e=>{
    keys[e.key.toLowerCase()]=true;
    const s=TH.GameState.State;
    if((e.key==='p'||e.key==='P'||e.key==='Escape') && s.running && !s.ended){
      e.preventDefault();
      if(s.paused){ window.resumeGame(); } else { window.pauseGame(); }
    }
    if((e.key==='m'||e.key==='M') && s.running && !s.paused && !s.ended && s.map.dual){
      s.worldMode = s.worldMode==='normal' ? 'mirror' : 'normal';
      s.worldSwitchCount++;
      s.aiTimer=0; // force the AI to re-plan in the new world
    }
  });
  window.addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });

  function start(mapId,mode,diff){
    TH.GameState.reset(mapId,mode,diff);
    const s=TH.GameState.State;
    document.getElementById('hudMapName').textContent =
      s.map.name.toUpperCase()+(mode==='compete' ? ' • RACE' : ' • TIME CHALLENGE');
    TH.Hints.buildPanel();
    TH.Renderer.resizeCanvas();
    TH.UI.goto('game');
    TH.UI.closeOverlay('resultsOverlay');
    TH.UI.closeOverlay('pauseOverlay');
    lastT=performance.now();
    if(raf) cancelAnimationFrame(raf);
    raf=requestAnimationFrame(loop);
  }
  function stop(){ TH.GameState.State.running=false; if(raf) cancelAnimationFrame(raf); }
  function pause(){ TH.GameState.State.paused=true; }
  function resume(){ TH.GameState.State.paused=false; lastT=performance.now(); }
  function restart(){
    const s=TH.GameState.State;
    start(s.currentMapId, s.mode, s.diff);
  }

  function loseLife(){
    const s=TH.GameState.State;
    s.lives--; s.health=100;
    s.player.px=s.lastCheckpoint.x; s.player.py=s.lastCheckpoint.y;
    if(s.lives<=0) endGame('gameover');
  }

  function finishPlayer(){
    const s=TH.GameState.State;
    if(s.playerFinishTime!==null) return;
    s.playerFinishTime=(performance.now()-s.startTime)/1000;
    s.objectivesDone=s.objectivesDone.map(()=>true);
    if(s.mode==='compete' && s.ai && s.aiFinishTime===null){
      s.winner='player'; TH.Score.add(200); endGame('win');
    } else if(s.mode==='compete'){
      endGame(s.winner==='ai' ? 'lose' : 'win');
    } else {
      endGame('win');
    }
  }
  function finishAI(){
    const s=TH.GameState.State;
    if(s.aiFinishTime!==null) return;
    s.aiFinishTime=(performance.now()-s.startTime)/1000;
    if(s.playerFinishTime===null) s.winner='ai';
  }

  function endGame(kind){
    const s=TH.GameState.State;
    if(s.ended) return;
    s.ended=true; s.running=false;
    const timeBonus = kind==='win' ? TH.Score.timeBonus(s.timeLeft) : 0;
    const finalScore = Math.max(0, s.score + timeBonus);
    let isNewBest=false;
    if(kind==='win' && (s.mode!=='compete' || s.winner==='player')){
      isNewBest = TH.Score.setBestIfHigher(s.map.id, s.mode, s.diff, finalScore);
    }
    const bestScore = TH.Score.getBest(s.map.id, s.mode, s.diff);
    TH.UI.showResults({
      kind, map:s.map, mode:s.mode, diff:s.diff, collected:s.collected,
      playerTime:s.playerFinishTime, aiTime:s.aiFinishTime, winner:s.winner,
      timeBonus, finalScore, bestScore, isNewBest
    });
  }

  function loop(t){
    const s=TH.GameState.State;
    if(!s.running) return;
    raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(t-lastT)/1000); lastT=t;
    if(s.paused||s.ended){ TH.Renderer.render(); return; }
    TH.Player.update(dt,keys);
    TH.AI.update(dt);
    TH.Obstacles.update(dt);
    TH.Timer.tick(dt);
    if(s.hintFlashT>0) s.hintFlashT-=dt;
    if(s.timeLeft<=0 && !s.ended){ s.timeLeft=0; endGame('timeup'); }
    TH.Renderer.render();
    TH.UI.updateHUD();
  }

  window.TH = window.TH || {};
  TH.Game = {start, stop, pause, resume, restart, loseLife, finishPlayer, finishAI, endGame,
    isRunning:()=>TH.GameState.State.running};
})();
