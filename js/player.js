/* player.js
 * Player entity factory and per-frame update: keyboard input,
 * collision-aware movement, tile pickups, and explored-tile tracking
 * (used by the minimap).
 * Exposes: TH.Player = { create, update }
 */
(function(){
  function create(startTile){
    const TS=TH.GameState.TS;
    return {px:startTile.x*TS+8, py:startTile.y*TS+8, w:24, h:24, dir:'down', moving:false, anim:0};
  }

  function readInput(keys){
    let dx=0, dy=0;
    if(keys['w']||keys['arrowup']) dy-=1;
    if(keys['s']||keys['arrowdown']) dy+=1;
    if(keys['a']||keys['arrowleft']) dx-=1;
    if(keys['d']||keys['arrowright']) dx+=1;
    return {dx,dy};
  }

  function update(dt,keys){
    const s=TH.GameState.State;
    const {dx,dy}=readInput(keys);
    s.player.moving = dx!==0||dy!==0;
    if(dx!==0||dy!==0){
      s.player.dir = Math.abs(dx)>Math.abs(dy) ? (dx>0?'right':'left') : (dy>0?'down':'up');
    }
    TH.Collision.moveEntity(s.player,dx,dy,dt,180,s.gw,s.gh,TH.GameState.activeGrid(),s.hasKey);
    s.player.anim += s.player.moving ? dt*8 : 0;
    TH.Collectibles.playerCollect(s.player);
    TH.Collectibles.updateMirrorObjectives();
    const pv=TH.GameState.tileAt(s.player.px,s.player.py);
    s.visited.add(pv.x+','+pv.y);
  }

  window.TH = window.TH || {};
  TH.Player = {create, update};
})();
