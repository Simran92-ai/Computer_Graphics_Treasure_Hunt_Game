/* maps.js
 * Tile-type constants, grid helpers, and every map/level definition
 * (layout, collectibles, doors, patrol/monster placements).
 * Exposes: TH.Maps = { T, makeGrid, isSolidChar, MAPS, COMING_SOON }
 */
(function(){
  const T={WALL:'#',FLOOR:'.',WATER:'~',OBST:'O',TREASURE:'T',DOOR:'D',KEY:'K',COIN:'C',CLUE:'L',HAZARD:'H',CHECK:'B'};

  function makeGrid(w,h){
    const g=[];
    for(let y=0;y<h;y++){const row=[];for(let x=0;x<w;x++){row.push((x===0||y===0||x===w-1||y===h-1)?T.WALL:T.FLOOR);}g.push(row);}
    return g;
  }
  function isSolidChar(ch,hasKey){
    if(ch===T.WALL||ch===T.OBST||ch===T.WATER) return true;
    if(ch===T.DOOR) return !hasKey;
    return false;
  }

  
   function buildCity(){
    const w=18,h=11; const g=makeGrid(w,h); const S=(x,y,c)=>g[y][x]=c;
    [[3,2],[4,2],[3,3],[13,2],[14,2],[13,3],[5,7],[6,7],[9,3],[10,3],[7,8],[12,4]].forEach(p=>S(p[0],p[1],T.OBST));
    S(8,4,T.CLUE); S(11,5,T.KEY); S(2,8,T.COIN); S(9,7,T.HAZARD); S(4,5,T.CHECK); S(10,8,T.HAZARD);
    // sealed warehouse room around treasure at (15,7), entrance via door at (14,7)
    S(15,6,T.WALL); S(16,6,T.WALL);
    S(15,8,T.WALL); S(16,8,T.WALL);
    S(14,6,T.WALL); S(14,8,T.WALL); S(14,7,T.DOOR);
    S(15,7,T.TREASURE);
    [[2,5],[9,6],[16,3],[4,8]].forEach(p=>S(p[0],p[1],T.COIN));
    return {id:'city',grid:g,w,h,name:'City Detective',category:'Modern / Real-World',treasureName:'Stolen Diamond',
      difficulty:'Easy',desc:'Follow the evidence trail through the city to recover the stolen diamond.',
      playerStart:{x:2,y:2}, computerStart:{x:16,y:2}, hasDoor:true,
      objectives:['Collect the evidence','Find the access key','Unlock the warehouse','Recover the Stolen Diamond'],
      objEvents:['clue','key','door','treasure'],
      theme:'city', compete:true,
      patrols:[
        {a:{x:8,y:2},b:{x:8,y:8},color:'#e8c34a',speed:55,label:'car'},
        {a:{x:12,y:7},b:{x:12,y:5},color:'#8a9098',speed:45,label:'guard'},
        {a:{x:4,y:3},b:{x:4,y:9},color:'#7a1a3a',speed:52,label:'monster'},
        {a:{x:14,y:3},b:{x:6,y:9},color:'#1a7a4a',speed:50,label:'monster'}
      ]};
  }
  function buildSpaceStation(){
    const w=18,h=11; const g=makeGrid(w,h); const S=(x,y,c)=>g[y][x]=c;
    [[3,3],[4,3],[13,3],[12,7],[6,3],[7,3],[10,6],[6,7]].forEach(p=>S(p[0],p[1],T.OBST));
    S(8,3,T.CLUE); S(5,6,T.KEY); S(15,3,T.COIN); S(9,5,T.HAZARD); S(3,7,T.CHECK); S(11,4,T.HAZARD);
    // sealed control room around treasure at (14,7), entrance via door at (14,8)
    S(13,6,T.WALL); S(13,7,T.WALL); S(13,8,T.WALL);
    S(15,6,T.WALL); S(15,7,T.WALL); S(15,8,T.WALL);
    S(14,6,T.WALL); S(14,8,T.DOOR);
    S(14,7,T.TREASURE);
    [[2,4],[9,7],[16,5],[5,8]].forEach(p=>S(p[0],p[1],T.COIN));
    return {id:'spacestation',grid:g,w,h,name:'Abandoned Space Station',category:'Sci-Fi',treasureName:'Alien Artifact',
      difficulty:'Easy',desc:'Restore power, unlock the airlock and recover the alien artifact.',
      playerStart:{x:2,y:7}, computerStart:{x:15,y:3}, hasDoor:true,
      objectives:['Find the access card','Restore power','Unlock the airlock','Recover the Alien Artifact'],
      objEvents:['key','clue','door','treasure'],
      theme:'spacestation', compete:true,
      patrols:[
        {a:{x:9,y:3},b:{x:9,y:8},color:'#6bd0e0',speed:60,label:'drone'},
        {a:{x:11,y:7},b:{x:11,y:5},color:'#e06b6b',speed:50,label:'sentry'},
        {a:{x:4,y:3},b:{x:4,y:8},color:'#8a3aa0',speed:58,label:'monster'},
        {a:{x:12,y:3},b:{x:16,y:8},color:'#a04a2a',speed:56,label:'monster'}
      ]};
  }

  function buildMansion(){
    const w=18,h=11; const g=makeGrid(w,h); const S=(x,y,c)=>g[y][x]=c;
    [[3,2],[4,2],[3,3],[10,3],[11,3],[7,6],[12,7],[9,5],[13,5],[15,2],[8,2]].forEach(p=>S(p[0],p[1],T.OBST));
    S(13,3,T.KEY); S(6,5,T.COIN); S(10,6,T.CLUE); S(5,4,T.HAZARD); S(14,6,T.CHECK); S(11,8,T.HAZARD);
    S(3,7,T.WALL); S(4,7,T.WALL); S(5,7,T.WALL);
    S(3,9,T.WALL); S(4,9,T.WALL); S(5,9,T.WALL);
    S(2,7,T.WALL); S(2,9,T.WALL); S(2,8,T.DOOR);
    S(6,7,T.WALL); S(6,8,T.WALL); S(6,9,T.WALL);
    S(4,8,T.TREASURE);
    [[15,4],[9,8],[16,7],[2,5]].forEach(p=>S(p[0],p[1],T.COIN));
    return {id:'mansion',grid:g,w,h,name:'Haunted Mansion',category:'Horror / Mystery',treasureName:'Cursed Diamond',
      difficulty:'Medium',desc:'Search dark rooms, dodge the wandering ghost, unlock the restricted room.',
      playerStart:{x:14,y:2}, computerStart:{x:14,y:8}, hasDoor:true,
      objectives:['Find the key','Avoid the ghost','Unlock the restricted room','Reach the Cursed Diamond'],
      objEvents:['key','clue','door','treasure'],
      theme:'mansion', compete:true,
      patrols:[
        {a:{x:8,y:3},b:{x:8,y:7},color:'#dfe6ee',speed:40,label:'ghost'},
        {a:{x:2,y:4},b:{x:2,y:9},color:'#b9a7d8',speed:35,label:'ghost'},
        {a:{x:9,y:2},b:{x:9,y:8},color:'#8a1a3a',speed:50,label:'monster'},
        {a:{x:14,y:3},b:{x:14,y:9},color:'#6a1a5a',speed:54,label:'monster'}
      ]};
  }
  function buildPirate(){
    const w=20,h=12; const g=makeGrid(w,h); const S=(x,y,c)=>g[y][x]=c;
    for(let x=1;x<=18;x++){ S(x,1,T.WATER); S(x,10,T.WATER); }
    [[4,4],[5,4],[14,3],[6,7],[13,7],[9,3],[10,3],[5,8],[12,4],[7,3],[12,7],[15,6],[3,5]].forEach(p=>S(p[0],p[1],T.OBST));
    S(9,4,T.CLUE); S(8,6,T.KEY); S(3,8,T.COIN); S(16,4,T.HAZARD); S(11,8,T.CHECK); S(7,8,T.HAZARD);
    // sealed cave room around treasure at (17,7), entrance via door at (16,7)
    S(17,6,T.WALL); S(18,6,T.WALL);
    S(17,8,T.WALL); S(18,8,T.WALL);
    S(16,6,T.WALL); S(16,8,T.WALL); S(16,7,T.DOOR);
    S(17,7,T.TREASURE);
    [[2,3],[9,6],[15,4],[4,9]].forEach(p=>S(p[0],p[1],T.COIN));
    return {id:'pirate',grid:g,w,h,name:'Pirate Island',category:'Historical / Fantasy',treasureName:'Pirate Gold',
      difficulty:'Medium',desc:'Follow the torn map pieces through camps and caves to the buried gold.',
      playerStart:{x:2,y:5}, computerStart:{x:17,y:2}, hasDoor:true,
      objectives:['Find the map piece','Find the cave key','Unlock the cave','Reach the Pirate Gold'],
      objEvents:['clue','key','door','treasure'],
      theme:'pirate', compete:true,
      patrols:[
        {a:{x:3,y:3},b:{x:3,y:9},color:'#c9a24a',speed:50,label:'scout'},
        {a:{x:15,y:7},b:{x:15,y:5},color:'#8a3a2a',speed:55,label:'guard'},
        {a:{x:9,y:2},b:{x:9,y:9},color:'#1a6a4a',speed:52,label:'monster'},
        {a:{x:5,y:3},b:{x:12,y:9},color:'#2a4a8a',speed:56,label:'monster'}
      ]};
  }
 

  function buildJungle(){
    const w=20,h=12; const g=makeGrid(w,h); const S=(x,y,c)=>g[y][x]=c;
    S(9,3,T.COIN); S(5,5,T.KEY);
    [[3,3],[4,3],[3,4],[15,3],[16,3],[7,2],[10,2],[6,8],[14,7],[8,4],[12,2],[17,4],[3,9]].forEach(p=>S(p[0],p[1],T.OBST));
    for(let x=1;x<=18;x++){ if(x!==9&&x!==10) S(x,6,T.WATER); }
    S(12,8,T.CLUE); S(5,9,T.CHECK); S(13,7,T.HAZARD); S(4,7,T.HAZARD);
    S(15,9,T.DOOR); S(15,8,T.WALL); S(15,10,T.WALL);
    S(16,8,T.WALL); S(17,8,T.WALL); S(18,8,T.WALL);
    S(16,10,T.WALL); S(17,10,T.WALL); S(18,10,T.WALL);
    S(17,9,T.TREASURE);
    [[2,5],[8,9],[11,4],[18,2],[6,3]].forEach(p=>S(p[0],p[1],T.COIN));
    return {id:'jungle',grid:g,w,h,name:'Lost Jungle',category:'Adventure / Exploration',treasureName:'Ancient Golden Chest',
      difficulty:'Hard',desc:'Cross the river, uncover ruins and unlock the ancient chamber.',
      playerStart:{x:2,y:2}, computerStart:{x:17,y:2}, hasDoor:true,
      objectives:['Find the hidden key','Cross the river','Unlock the ancient chamber','Reach the Golden Chest'],
      objEvents:['key','clue','door','treasure'],
      theme:'jungle', compete:true,
      patrols:[
        {a:{x:2,y:9},b:{x:8,y:9},color:'#c9a23a',speed:50,label:'panther'},
        {a:{x:13,y:9},b:{x:13,y:7},color:'#7a5a2a',speed:55,label:'guard'},
        {a:{x:9,y:3},b:{x:9,y:9},color:'#c1354a',speed:55,label:'monster'},
        {a:{x:5,y:2},b:{x:18,y:9},color:'#7a2ab0',speed:60,label:'monster'}
      ]};
  }

  function buildMirror(){
    const w=18,h=12; const gn=makeGrid(w,h), gm=makeGrid(w,h);
    const S=(g,x,y,c)=>{ g[y][x]=c; };
    // First divide (x=6): the gap only exists in the Normal World, at y=3.
    for(let y=1;y<=10;y++){ S(gn,6,y, y===3?T.FLOOR:T.WALL); S(gm,6,y,T.WALL); }
    // Second divide (x=12): the gap only exists in the Mirror World, at y=8.
    for(let y=1;y<=10;y++){ S(gn,12,y,T.WALL); S(gm,12,y, y===8?T.FLOOR:T.WALL); }
    // Obstacles differ between the two worlds - true reflection/transformation.
    [[3,2],[3,9],[9,4],[9,7],[15,3]].forEach(p=>S(gn,p[0],p[1],T.OBST));
    [[3,4],[3,7],[9,2],[9,9],[15,8]].forEach(p=>S(gm,p[0],p[1],T.OBST));
    // Hazards and coins are shared so nothing vanishes on a world switch.
    [[4,6],[14,5]].forEach(p=>{ S(gn,p[0],p[1],T.HAZARD); S(gm,p[0],p[1],T.HAZARD); });
    [[2,2],[2,9],[10,2],[10,9],[16,5]].forEach(p=>{ S(gn,p[0],p[1],T.COIN); S(gm,p[0],p[1],T.COIN); });
    S(gn,8,5,T.CLUE); S(gm,8,5,T.CLUE);
    S(gn,15,6,T.TREASURE); S(gm,15,6,T.TREASURE);
    return {id:'mirror',grid:gn,mirrorGrid:gm,w,h,name:'Mirror World',category:'Creative / Unusual',treasureName:'Mirror Crystal',
      difficulty:'Hard',desc:'Two connected worlds - switch dimensions to open new paths, and dodge what drifts between them.',
      playerStart:{x:2,y:5}, computerStart:{x:2,y:8}, hasDoor:false,
      objectives:['Cross the first divide (Normal World)','Find the clue','Switch to the Mirror World (press M)','Cross the second divide (Mirror World)','Reach the Mirror Crystal'],
      theme:'mirror', compete:true, dual:true,
      patrols:[
        {a:{x:2,y:7},b:{x:2,y:2},color:'#9fd8ff',speed:45,label:'wisp'},
        {a:{x:8,y:2},b:{x:8,y:9},color:'#9a4ad8',speed:52,label:'monster'},
        {a:{x:14,y:2},b:{x:14,y:9},color:'#d84a9a',speed:50,label:'monster'}
      ]};
  }

  const MAPS={city:buildCity(), spacestation:buildSpaceStation(), mansion:buildMansion(),pirate:buildPirate(), jungle:buildJungle(), mirror:buildMirror()};
  const COMING_SOON=[];

  window.TH = window.TH || {};
  TH.Maps = {T, makeGrid, isSolidChar, MAPS, COMING_SOON};
})();
