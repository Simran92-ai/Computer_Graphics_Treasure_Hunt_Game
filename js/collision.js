/* collision.js
 * Generic tile-collision check and axis-separated movement helper,
 * shared by the player and the computer opponent.
 * Exposes: TH.Collision = { collides, moveEntity }
 */
(function(){
  function collides(px,py,w,h,gw,gh,g,keyFlag){
    const TS=TH.GameState.TS;
    const pts=[[px,py],[px+w,py],[px,py+h],[px+w,py+h]];
    for(const [x,y] of pts){
      const tx=Math.floor(x/TS), ty=Math.floor(y/TS);
      if(tx<0||ty<0||tx>=gw||ty>=gh) return true;
      if(TH.Maps.isSolidChar(g[ty][tx],keyFlag)) return true;
    }
    return false;
  }

  function moveEntity(e,dx,dy,dt,speed,gw,gh,g,keyFlag){
    if(dx===0&&dy===0) return;
    const len=Math.hypot(dx,dy)||1; dx/=len; dy/=len;
    const step=speed*dt;
    let nx=e.px+dx*step, ny=e.py;
    if(!collides(nx,e.py,e.w,e.h,gw,gh,g,keyFlag)) e.px=nx;
    ny=e.py+dy*step;
    if(!collides(e.px,ny,e.w,e.h,gw,gh,g,keyFlag)) e.py=ny;
  }

  window.TH = window.TH || {};
  TH.Collision = {collides, moveEntity};
})();
