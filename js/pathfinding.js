/* pathfinding.js
 * Grid-based A* search. Used by the computer opponent to race the
 * player, and by the hint system to draw a path preview.
 * Exposes: TH.Pathfinding = { astar }
 */
(function(){
  function astar(grid,w,h,start,goal,hasKey){
    function key(x,y){ return x+','+y; }
    const open=[{x:start.x,y:start.y,g:0,f:0,parent:null}];
    const closed=new Set();
    const gscore={}; gscore[key(start.x,start.y)]=0;
    let iterations=0;
    while(open.length && iterations<4000){
      iterations++;
      open.sort((a,b)=>a.f-b.f);
      const cur=open.shift();
      if(cur.x===goal.x && cur.y===goal.y){
        const path=[]; let n=cur; while(n){ path.unshift({x:n.x,y:n.y}); n=n.parent; } return path;
      }
      closed.add(key(cur.x,cur.y));
      const neigh=[[1,0],[-1,0],[0,1],[0,-1]];
      for(const [dx,dy] of neigh){
        const nx=cur.x+dx, ny=cur.y+dy;
        if(nx<0||ny<0||nx>=w||ny>=h) continue;
        if(closed.has(key(nx,ny))) continue;
        const ch=grid[ny][nx];
        if(TH.Maps.isSolidChar(ch,hasKey)) continue;
        const ng=cur.g+1;
        const k=key(nx,ny);
        if(gscore[k]===undefined || ng<gscore[k]){
          gscore[k]=ng;
          const h2=Math.abs(nx-goal.x)+Math.abs(ny-goal.y);
          open.push({x:nx,y:ny,g:ng,f:ng+h2,parent:cur});
        }
      }
    }
    return null;
  }

  window.TH = window.TH || {};
  TH.Pathfinding = {astar};
})();
