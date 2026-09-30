/* renderer.js
 * All main-canvas and minimap drawing. Reads state, never mutates it.
 * Exposes: TH.Renderer = { init, resizeCanvas, render }
 */
(function(){
  let canvas, ctx, mmCanvas, mmCtx;

  const palettes={
    jungle:{floor:'#1c3b23',wall:'#0e2415',accent:'#2f6b3c',water:'#1e5f8a'},
    mansion:{floor:'#221f2b',wall:'#141119',accent:'#3a2f47',water:'#221f2b'},
    pirate:{floor:'#d9c789',wall:'#8a6a3a',accent:'#c9a24a',water:'#1e6f8a'},
    city:{floor:'#3a3d42',wall:'#1c1e21',accent:'#5a4632',water:'#3a3d42'},
    spacestation:{floor:'#1a1f2e',wall:'#0c0f18',accent:'#2a3550',water:'#1a1f2e'},
    mirror:{floor:'#152233',wall:'#0a1420',accent:'#1f3d55',water:'#152233'}
  };

  function init(){
    canvas=document.getElementById('gameCanvas'); ctx=canvas.getContext('2d');
    mmCanvas=document.getElementById('minimapCanvas'); mmCtx=mmCanvas.getContext('2d');
  }

  function resizeCanvas(){
    const wrap=document.getElementById('gameWrap');
    const vw=Math.min(wrap.clientWidth-20,900), vh=Math.min(wrap.clientHeight-20,560);
    canvas.width=Math.max(480,vw); canvas.height=Math.max(340,vh);
  }

  function drawDot(x,y,color,glyph){
    const TS=TH.GameState.TS;
    ctx.fillStyle=color;
    if(glyph){ ctx.font='18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(glyph,x*TS+TS/2,y*TS+TS/2); }
    else { ctx.beginPath(); ctx.arc(x*TS+TS/2,y*TS+TS/2,6,0,7); ctx.fill(); }
  }

  function drawChar(e,color){
    const bob=TH.Animation.bobOffset(e.anim);
    const cx=e.px+e.w/2, cy=e.py+e.h/2+bob;
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.ellipse(cx,cy+8,10,6,0,0,7); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx,e.py+e.h+4,9,3,0,0,7); ctx.fill();
    ctx.fillStyle=color; ctx.beginPath(); ctx.arc(cx,cy,10,0,7); ctx.fill();
    ctx.fillStyle='#fff';
    let ix=0,iy=0;
    if(e.dir==='left') ix=-1; else if(e.dir==='right') ix=1; else if(e.dir==='up') iy=-1; else iy=1;
    ctx.beginPath(); ctx.moveTo(cx+ix*4-4*(iy!==0),cy+iy*4-4*(ix!==0));
    ctx.arc(cx+ix*11,cy+iy*11,4,0,7); ctx.fill();
  }

  function render(){
    const s=TH.GameState.State;
    const g=TH.GameState.activeGrid();
    const T=TH.Maps.T;
    const pal=palettes[s.map.theme];
    const TS=TH.GameState.TS, ZOOM=TH.GameState.ZOOM;
    const animOn=TH.UI.Settings.anim;

    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    const cam=TH.Camera.compute(s.player,s.camLeadX,s.camLeadY,canvas.width,canvas.height,ZOOM,s.gw*TS,s.gh*TS);
    const {camX,camY,viewW,viewH}=cam;

    ctx.save(); ctx.scale(ZOOM,ZOOM); ctx.translate(-camX,-camY);
    const time=performance.now()/1000;
    const x0=Math.max(0,Math.floor(camX/TS)), x1=Math.min(s.gw,Math.ceil((camX+viewW)/TS));
    const y0=Math.max(0,Math.floor(camY/TS)), y1=Math.min(s.gh,Math.ceil((camY+viewH)/TS));

    // tiles + pickups
    for(let y=y0;y<y1;y++){
      for(let x=x0;x<x1;x++){
        const cell=g[y][x];
        let color=pal.floor;
        if(cell===T.WALL) color=pal.wall;
        else if(cell===T.OBST) color=pal.accent;
        else if(cell===T.WATER) color = animOn ? TH.Animation.shimmerColor(time,x,y) : pal.water;
        else if(cell===T.DOOR) color = s.hasKey ? '#6b5222' : '#7a4a1e';
        ctx.fillStyle=color;
        ctx.fillRect(x*TS,y*TS,TS,TS);
        ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.strokeRect(x*TS,y*TS,TS,TS);
        if(cell===T.COIN) drawDot(x,y,'#e8c34a');
        if(cell===T.CLUE) drawDot(x,y,'#e0e0e0','▤');
        if(cell===T.KEY && s.collected.clues>0) drawDot(x,y,'#ffd76b','🔑');
        if(cell===T.CHECK) drawDot(x,y,'#4ac3a8','◆');
        if(cell===T.HAZARD) drawDot(x,y,'#c14545','!');
        if(cell===T.TREASURE && s.collected.clues>0) drawDot(x,y,'#ffcf4a','★');
        if(cell===T.OBST && animOn){ // gentle sway
          ctx.save(); ctx.translate(x*TS+TS/2,y*TS+TS/2);
          ctx.rotate(Math.sin(time*1.5+x+y)*0.05);
          ctx.fillStyle=pal.accent; ctx.beginPath(); ctx.arc(0,-6,10,0,7); ctx.fill();
          ctx.restore();
        }
      }
    }

    // hint path flash
    if(s.hintFlashT>0){
      ctx.globalAlpha=0.5;
      s.hintFlashPath.forEach(p=>{ ctx.fillStyle='#ffd76b'; ctx.fillRect(p.x*TS+8,p.y*TS+8,TS-16,TS-16); });
      ctx.globalAlpha=1;
    }

    // moving obstacles
    s.patrolStates.forEach(ps=>{
      const def=ps.def;
      ctx.globalAlpha=(def.label==='ghost'||def.label==='wisp') ? 0.55+Math.sin(time*4)*0.15 : 1;
      ctx.fillStyle=def.color;
      if(def.label==='car'){ ctx.fillRect(ps.x-6,ps.y-4,20,16); }
      else if(def.label==='monster'){ TH.Animation.drawMonsterBlob(ctx,ps.x,ps.y,time,def.color); }
      else { ctx.beginPath(); ctx.arc(ps.x+4,ps.y+4,12,0,7); ctx.fill(); }
      ctx.globalAlpha=1;
    });

    // mirror-world tint
    if(s.map.dual && s.worldMode==='mirror'){ ctx.fillStyle='rgba(60,120,220,.14)'; ctx.fillRect(camX,camY,viewW,viewH); }

    // characters
    if(s.ai) drawChar(s.ai,'#e0705a');
    drawChar(s.player,'#5ac0e0');

    // player reflection (scale(1,-1) mirror render)
    if(animOn){
      ctx.save();
      ctx.globalAlpha=0.28;
      ctx.translate(s.player.px+s.player.w/2, s.player.py+s.player.h+18);
      ctx.scale(1,-1);
      ctx.translate(-(s.player.px+s.player.w/2), -(s.player.py+s.player.h+18-(s.player.py+s.player.h)));
      drawChar({px:s.player.px,py:s.player.py+s.player.h,w:s.player.w,h:s.player.h,dir:s.player.dir,anim:s.player.anim},'#5ac0e0');
      ctx.restore();
    }
    ctx.restore();

    // atmosphere flicker overlays
    if(s.map.theme==='mansion' && animOn){
      ctx.fillStyle='rgba(0,0,0,'+(0.08+Math.random()*0.06)+')';
      ctx.fillRect(0,0,canvas.width,canvas.height);
    } else if(s.map.theme==='spacestation' && animOn){
      ctx.fillStyle='rgba(255,90,60,'+(0.03+Math.random()*0.05)+')';
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    renderMinimap();
  }

  function renderMinimap(){
    const s=TH.GameState.State; const T=TH.Maps.T; const TS=TH.GameState.TS;
    if(!TH.UI.Settings.minimap){ mmCanvas.style.display='none'; return; }
    mmCanvas.style.display='block';
    mmCtx.fillStyle='#161a24'; mmCtx.fillRect(0,0,mmCanvas.width,mmCanvas.height);
    const sx=mmCanvas.width/s.gw, sy=mmCanvas.height/s.gh;
    const g=TH.GameState.activeGrid();
    for(let y=0;y<s.gh;y++){
      for(let x=0;x<s.gw;x++){
        const cell=g[y][x];
        const seen=s.visited.has(x+','+y);
        let color;
        if(cell===T.WALL) color = seen?'#5a6178':'#2a2f3c';
        else if(cell===T.WATER) color = seen?'#3a93c4':'#1e3a4d';
        else if(cell===T.OBST) color = seen?'#6a8a5a':'#2c3a26';
        else if(cell===T.DOOR) color = seen?(s.hasKey?'#c9a24a':'#a06a2a'):'#4a3620';
        else color = seen?'#454c60':'#232838'; // floor
        mmCtx.fillStyle=color;
        mmCtx.fillRect(Math.floor(x*sx),Math.floor(y*sy),Math.ceil(sx+1),Math.ceil(sy+1));
      }
    }
    mmCtx.strokeStyle='rgba(255,255,255,.15)'; mmCtx.strokeRect(0,0,mmCanvas.width,mmCanvas.height);
    const ppx=s.player.px/TS*sx, ppy=s.player.py/TS*sy;
    mmCtx.fillStyle='#0a0d12'; mmCtx.beginPath(); mmCtx.arc(ppx,ppy,4.5,0,7); mmCtx.fill();
    mmCtx.fillStyle='#5ac0e0'; mmCtx.beginPath(); mmCtx.arc(ppx,ppy,3,0,7); mmCtx.fill();
    if(s.ai){
      const apx=s.ai.px/TS*sx, apy=s.ai.py/TS*sy;
      mmCtx.fillStyle='#0a0d12'; mmCtx.beginPath(); mmCtx.arc(apx,apy,4.5,0,7); mmCtx.fill();
      mmCtx.fillStyle='#e0705a'; mmCtx.beginPath(); mmCtx.arc(apx,apy,3,0,7); mmCtx.fill();
    }
  }

  window.TH = window.TH || {};
  TH.Renderer = {init, resizeCanvas, render};
})();
