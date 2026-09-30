/* obstacles.js
 * Moving hazards (ghosts, guards, cars, drones, wildlife, monsters).
 * Each patrols between two points and damages the player on contact;
 * monsters hit harder than other patrollers.
 * Exposes: TH.Obstacles = { init, update }
 */
(function(){
  function init(patrolDefs){
    const TS=TH.GameState.TS;
    return (patrolDefs||[]).map(p=>({x:p.a.x*TS+8, y:p.a.y*TS+8, dir:1, def:p}));
  }

  function update(dt){
    const s=TH.GameState.State; const TS=TH.GameState.TS;
    if(!s.patrolStates.length) return;
    s.patrolStates.forEach(ps=>{
      const a=ps.def.a, b=ps.def.b, spd=ps.def.speed||40;
      const tx=(ps.dir>0?b.x:a.x)*TS+8, ty=(ps.dir>0?b.y:a.y)*TS+8;
      const dx=tx-ps.x, dy=ty-ps.y, dist=Math.hypot(dx,dy);
      if(dist<3) ps.dir*=-1;
      else { ps.x+=dx/dist*spd*dt; ps.y+=dy/dist*spd*dt; }

      const isMonster = ps.def.label==='monster';
      const dmg = isMonster ? 45 : 25;
      const grace = isMonster ? 900 : 1500;
      if(s.player && Math.hypot(s.player.px-ps.x, s.player.py-ps.y)<20 && !s.player._patrolHit){
        s.player._patrolHit=true;
        s.health-=dmg;
        TH.Score.spend(25);
        setTimeout(()=>{ s.player._patrolHit=false; },grace);
        if(s.health<=0) TH.Game.loseLife();
      }
    });
  }

  window.TH = window.TH || {};
  TH.Obstacles = {init, update};
})();
