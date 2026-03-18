import { ELEMENTS, DUCK_HEIGHT, PLAYER_HEIGHT } from './GameConstants';

export function drawPlayer(ctx, player, idx, pT) {
  if (player.dead) return;
  const element = ELEMENTS[player.element];
  const sizeMult = player.sizeMultiplier || 1;
  const height = (player.ducking ? DUCK_HEIGHT : PLAYER_HEIGHT) * sizeMult;
  const baseY = player.y - height;
  const limbs = player.limbAngles;
  const isAttacking = player.attacking || player.jumpAttack;

  ctx.save();
  ctx.translate(player.x, player.y - height / 2);
  if (player.ragdoll) ctx.rotate(player.ragdollAngle);
  if (player.tornadoKick) ctx.rotate(player.tornadoAngle);
  ctx.translate(-player.x, -(player.y - height / 2));

  if (player.inMirrorDimension) { ctx.globalAlpha = 0.85; ctx.shadowColor = '#ff8c00'; ctx.shadowBlur = 18; }
  else { ctx.shadowColor = element.color; ctx.shadowBlur = isAttacking ? 22 : 9; }

  if (player.shielded) {
    const sg = ctx.createRadialGradient(player.x, baseY+height/2, 28*sizeMult, player.x, baseY+height/2, 38*sizeMult);
    sg.addColorStop(0,'rgba(112,128,144,0.5)'); sg.addColorStop(1,'rgba(112,128,144,0)');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(player.x,baseY+height/2,38*sizeMult,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(192,192,192,0.7)'; ctx.lineWidth=2.5; ctx.globalAlpha=0.6;
    ctx.beginPath(); ctx.arc(player.x,baseY+height/2,33*sizeMult,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
  }

  // Beast mode aura
  if (player.beastMode) {
    ctx.strokeStyle='#8b6914'; ctx.lineWidth=3; ctx.globalAlpha=0.5+Math.sin(pT*3)*0.2;
    ctx.shadowColor='#8b6914'; ctx.shadowBlur=20;
    ctx.beginPath(); ctx.arc(player.x,baseY+height/2,40*sizeMult,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=1; ctx.shadowBlur=0;
  }

  // Element aura on attack
  if (isAttacking) {
    const auraG = ctx.createRadialGradient(player.x,baseY+height*0.5,0,player.x,baseY+height*0.5,42*sizeMult);
    auraG.addColorStop(0,`${element.color}40`); auraG.addColorStop(1,`${element.color}00`);
    ctx.fillStyle=auraG; ctx.beginPath(); ctx.ellipse(player.x,baseY+height*0.5,42*sizeMult,32*sizeMult,0,0,Math.PI*2); ctx.fill();
  }

  ctx.strokeStyle = player.ragdoll ? '#888' : player.grown ? '#90EE90' : player.beastMode ? '#c8a050' : '#fff';
  ctx.lineWidth = 3.5 * sizeMult; ctx.lineCap = 'round';

  const headY = baseY + 10 * sizeMult;
  const bodyTopY = baseY + 19 * sizeMult;
  const bodyBottomY = baseY + height * 0.6;
  const armY = baseY + 24 * sizeMult;
  const armLen = 18 * sizeMult;
  const legLen = (player.ducking ? 12 : 20) * sizeMult;

  // Head
  ctx.beginPath(); ctx.arc(player.x, headY, 9 * sizeMult, 0, Math.PI * 2); ctx.stroke();
  if (isAttacking) {
    ctx.fillStyle = `${element.color}55`;
    ctx.beginPath(); ctx.arc(player.x, headY, 9 * sizeMult, 0, Math.PI * 2); ctx.fill();
  }
  // Eye with glow on attack
  const eyeSize = isAttacking ? 3 : 2;
  ctx.fillStyle = player.blinded ? '#444' : element.color;
  ctx.shadowColor = element.color; ctx.shadowBlur = isAttacking ? 14 : 0;
  ctx.beginPath(); ctx.arc(player.x + player.facing * 3.5, headY - 1.5, eyeSize, 0, Math.PI * 2); ctx.fill();
  if (isAttacking) { ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(player.x+player.facing*3.5,headY-1.5,1.2,0,Math.PI*2); ctx.fill(); }
  ctx.shadowBlur = 0;

  // Body
  ctx.beginPath(); ctx.moveTo(player.x, bodyTopY); ctx.lineTo(player.x + Math.sin(limbs.body || 0) * 4, bodyBottomY); ctx.stroke();

  // Arms
  const armLW = isAttacking ? ctx.lineWidth * 1.35 : ctx.lineWidth;
  ctx.lineWidth = armLW;
  ctx.beginPath(); ctx.moveTo(player.x, armY); ctx.lineTo(player.x + Math.sin(limbs.leftArm) * armLen, armY + Math.cos(limbs.leftArm) * armLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(player.x, armY);
  const rax = player.x + Math.sin(limbs.rightArm) * armLen * player.facing;
  const ray = armY + Math.cos(limbs.rightArm) * armLen;
  ctx.lineTo(rax, ray); ctx.stroke();
  ctx.lineWidth = 3.5 * sizeMult;

  if (player.attacking && player.attackType === 'special') {
    const spR = Math.max(0.5, 18 * player.attackPhase);
    ctx.shadowColor = element.color; ctx.shadowBlur = 40;
    // Outer rings
    ctx.strokeStyle=element.color; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(player.x+player.facing*44,armY-7,spR+10+Math.sin(pT*4)*4,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(player.x+player.facing*44,armY-7,spR+4,0,Math.PI*2); ctx.stroke();
    // Core gradient
    const specG=ctx.createRadialGradient(player.x+player.facing*44,armY-7,0,player.x+player.facing*44,armY-7,spR);
    specG.addColorStop(0,'#fff'); specG.addColorStop(0.35,element.color); specG.addColorStop(1,`${element.color}00`);
    ctx.fillStyle=specG; ctx.beginPath(); ctx.arc(player.x+player.facing*44,armY-7,spR,0,Math.PI*2); ctx.fill();
    // Orbiting sparks
    for(let s=0;s<6;s++){const sa=pT*5+s*(Math.PI/3); ctx.fillStyle=element.color; ctx.globalAlpha=0.8;
    ctx.beginPath(); ctx.arc(player.x+player.facing*44+Math.cos(sa)*(spR+7),armY-7+Math.sin(sa)*(spR+7),2.5,0,Math.PI*2); ctx.fill();}
    ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.lineWidth=3.5*sizeMult; ctx.strokeStyle=player.ragdoll?'#888':player.beastMode?'#c8a050':'#fff';
  } else if (isAttacking) {
    // Normal punch - glowing fist + streak
    ctx.shadowColor=element.color; ctx.shadowBlur=28;
    const fG=ctx.createRadialGradient(rax,ray,0,rax,ray,14);
    fG.addColorStop(0,'#fff'); fG.addColorStop(0.3,element.color); fG.addColorStop(1,`${element.color}00`);
    ctx.fillStyle=fG; ctx.beginPath(); ctx.arc(rax,ray,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=element.color; ctx.beginPath(); ctx.arc(rax,ray,8,0,Math.PI*2); ctx.fill();
    // Motion streak
    const sl=24*(player.attackPhase||0.5);
    ctx.strokeStyle=`${element.color}aa`; ctx.lineWidth=6;
    ctx.beginPath(); ctx.moveTo(rax-player.facing*sl,ray); ctx.lineTo(rax,ray); ctx.stroke();
    // Sparkles
    for(let s=0;s<5;s++){const sa=pT*6+s*(Math.PI*2/5);
    ctx.fillStyle='#fff'; ctx.globalAlpha=0.85;
    ctx.beginPath(); ctx.arc(rax+Math.cos(sa)*10,ray+Math.sin(sa)*10,2,0,Math.PI*2); ctx.fill();}
    ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.lineWidth=3.5*sizeMult; ctx.strokeStyle=player.ragdoll?'#888':player.beastMode?'#c8a050':'#fff';
  }

  // Legs
  ctx.beginPath(); ctx.moveTo(player.x, bodyBottomY); ctx.lineTo(player.x + Math.sin(limbs.leftLeg) * legLen - 4, bodyBottomY + Math.cos(limbs.leftLeg) * legLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(player.x, bodyBottomY); ctx.lineTo(player.x + Math.sin(limbs.rightLeg) * legLen + 4, bodyBottomY + Math.cos(limbs.rightLeg) * legLen); ctx.stroke();

  // ===== STATUS FX =====
  if (player.burning) {
    for(let i=0;i<8;i++){const fx=player.x+(Math.random()-0.5)*34,fy=baseY+Math.random()*height,fs=4+Math.random()*6;
    const fg=ctx.createRadialGradient(fx,fy,0,fx,fy,fs);
    fg.addColorStop(0,'#fffde0'); fg.addColorStop(0.4,`rgba(255,${100+Math.random()*100},0,0.9)`); fg.addColorStop(1,'rgba(255,0,0,0)');
    ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(fx,fy,fs,0,Math.PI*2); ctx.fill();}
    ctx.shadowColor='#ff4500'; ctx.shadowBlur=20; ctx.strokeStyle='rgba(255,100,0,0.3)'; ctx.lineWidth=8;
    ctx.beginPath(); ctx.ellipse(player.x,baseY+height/2,23*sizeMult,height/2*sizeMult,0,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;
  }
  if (player.stunned) {
    for(let i=0;i<4;i++){const a=(pT*1.2+i*(Math.PI/2))%(Math.PI*2);
    ctx.shadowColor='#ffff00'; ctx.shadowBlur=18;
    ctx.fillStyle='#ffff00'; ctx.font=`bold ${14*sizeMult}px Arial`; ctx.textAlign='center';
    ctx.fillText('★',player.x+Math.cos(a)*22,headY-17+Math.sin(a)*7); ctx.shadowBlur=0;}
    ctx.strokeStyle='rgba(255,255,0,0.2)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(player.x,baseY+height/2,32,0,Math.PI*2); ctx.stroke();
  }
  if (player.poisoned) {
    for(let i=0;i<6;i++){const px2=player.x+(Math.random()-0.5)*30,py2=baseY+Math.random()*height;
    const pg2=ctx.createRadialGradient(px2,py2,0,px2,py2,5+Math.random()*4);
    pg2.addColorStop(0,'rgba(200,255,50,0.9)'); pg2.addColorStop(1,'rgba(100,180,0,0)');
    ctx.fillStyle=pg2; ctx.beginPath(); ctx.arc(px2,py2,5+Math.random()*4,0,Math.PI*2); ctx.fill();}
    ctx.shadowColor='#9acd32'; ctx.shadowBlur=14; ctx.strokeStyle='rgba(154,205,50,0.22)'; ctx.lineWidth=6;
    ctx.beginPath(); ctx.ellipse(player.x,baseY+height/2,21*sizeMult,height/2*sizeMult,0,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;
  }
  if (player.frozen) {
    ctx.globalAlpha=0.5; ctx.fillStyle='rgba(160,230,255,0.12)';
    ctx.beginPath(); ctx.ellipse(player.x,baseY+height/2,23*sizeMult,height/2*sizeMult+5,0,0,Math.PI*2); ctx.fill();
    for(let ic=0;ic<8;ic++){const ia=(ic/8)*Math.PI*2,ir=28*sizeMult;
    ctx.strokeStyle=`rgba(200,240,255,0.8)`; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(player.x+Math.cos(ia)*ir*0.65,baseY+height/2+Math.sin(ia)*ir*0.65);
    ctx.lineTo(player.x+Math.cos(ia)*ir,baseY+height/2+Math.sin(ia)*ir); ctx.stroke();}
    ctx.globalAlpha=1;
  }
  if (player.ghostForm) {
    ctx.globalAlpha=0.28;
    const gg=ctx.createRadialGradient(player.x,baseY+height/2,0,player.x,baseY+height/2,32*sizeMult);
    gg.addColorStop(0,'rgba(135,206,235,0.55)'); gg.addColorStop(1,'rgba(100,160,200,0)');
    ctx.fillStyle=gg; ctx.beginPath(); ctx.ellipse(player.x,baseY+height/2,27*sizeMult,height/2*sizeMult+12,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  if (player.lightningFlying) {
    ctx.shadowColor='#ffff00'; ctx.shadowBlur=22;
    for(let i=0;i<9;i++){const lx1=player.x+(Math.random()-0.5)*60,ly1=baseY+Math.random()*height;
    ctx.strokeStyle=`rgba(255,255,${100+Math.floor(Math.random()*155)},${0.5+Math.random()*0.5})`; ctx.lineWidth=1.5+Math.random();
    ctx.beginPath(); ctx.moveTo(lx1,ly1); ctx.lineTo(lx1+(Math.random()-0.5)*24,ly1+(Math.random()-0.5)*24); ctx.stroke();}
    ctx.shadowBlur=0;
  }
  if (player.steamForm) {
    for(let i=0;i<8;i++){const sx2=player.x+(Math.random()-0.5)*42,sy2=baseY+Math.random()*height,sr=7+Math.random()*10;
    const sg=ctx.createRadialGradient(sx2,sy2,0,sx2,sy2,sr);
    sg.addColorStop(0,'rgba(230,230,230,0.55)'); sg.addColorStop(1,'rgba(180,180,180,0)');
    ctx.globalAlpha=0.4; ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx2,sy2,sr,0,Math.PI*2); ctx.fill();}
    ctx.globalAlpha=1;
  }
  if (player.inMirrorDimension) {
    ctx.shadowColor='#ff8c00'; ctx.shadowBlur=25;
    for(let d=0;d<8;d++){const a=(pT*0.9+d*Math.PI/4)%(Math.PI*2);
    ctx.strokeStyle=`rgba(255,${100+d*14},0,${0.4+Math.sin(pT*2+d)*0.2})`; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(player.x+Math.cos(a)*22,baseY+height/2+Math.sin(a)*22);
    ctx.lineTo(player.x+Math.cos(a)*42,baseY+height/2+Math.sin(a)*42); ctx.stroke();}
    ctx.shadowBlur=0; ctx.globalAlpha=1;
  }
  if (player.orbiting) {
    ctx.strokeStyle='rgba(255,215,0,0.15)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(player.x,baseY+height/2,52,36,0,0,Math.PI*2); ctx.stroke();
    for(let o=0;o<3;o++){const oa=player.orbitAngle+o*(Math.PI*2/3);
    const ox=player.x+Math.cos(oa)*52,oy=baseY+height/2+Math.sin(oa)*36;
    ctx.shadowColor='#ffd700'; ctx.shadowBlur=20;
    const oG=ctx.createRadialGradient(ox,oy,0,ox,oy,11);
    oG.addColorStop(0,'#fff'); oG.addColorStop(0.4,'#ffd700'); oG.addColorStop(1,'rgba(255,180,0,0)');
    ctx.fillStyle=oG; ctx.beginPath(); ctx.arc(ox,oy,11,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;}
  }
  if (player.webRopeActive) {
    const segCount=14;
    for(let ws=0;ws<segCount;ws++){const wt=ws/segCount,wt2=(ws+1)/segCount;
    const wx1=player.x+(player.webRopeAnchorX-player.x)*wt;
    const wy1=(player.y-25)+(player.webRopeAnchorY-(player.y-25))*wt+Math.sin(wt*Math.PI)*10;
    const wx2=player.x+(player.webRopeAnchorX-player.x)*wt2;
    const wy2=(player.y-25)+(player.webRopeAnchorY-(player.y-25))*wt2+Math.sin(wt2*Math.PI)*10;
    ctx.strokeStyle=`rgba(220,20,60,${0.6+Math.sin(pT*0.8+ws)*0.3})`; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(wx1,wy1); ctx.lineTo(wx2,wy2); ctx.stroke();}
  }
  if (player.confused) {
    for(let qi=0;qi<3;qi++){const qa=(pT*0.8+qi*2.1)%(Math.PI*2);
    ctx.shadowColor='#ff69b4'; ctx.shadowBlur=12;
    ctx.fillStyle='#ff69b4'; ctx.font=`bold ${14*sizeMult}px Arial`; ctx.textAlign='center';
    ctx.fillText('?',player.x+Math.cos(qa)*18,headY-15+Math.sin(qa)*6); ctx.shadowBlur=0;}
  }
  if (player.controlledBy!==null) {
    ctx.shadowColor='#ff69b4'; ctx.shadowBlur=12;
    ctx.fillStyle='#ff69b4'; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.fillText('MIND CTRL',player.x,baseY-12);
    ctx.shadowBlur=0;
  }
  if (player.grabbing) { ctx.fillStyle='#ff0'; ctx.font='bold 12px Arial'; ctx.textAlign='center'; ctx.fillText('GRAB!',player.x,baseY-9); }
  if (player.spinning) {
    for(let sr2=0;sr2<3;sr2++){const sa=(pT*(1.2+sr2*0.4)+sr2*0.5)%(Math.PI*2);
    ctx.strokeStyle=`rgba(148,0,211,${0.55-sr2*0.12})`; ctx.lineWidth=3.5-sr2;
    ctx.beginPath(); ctx.arc(player.x,baseY+height/2,78+sr2*9,sa,sa+Math.PI*1.5); ctx.stroke();}
  }
  if (player.enchanted) {
    ctx.shadowColor='#ff00ff'; ctx.shadowBlur=15;
    for(let e=0;e<10;e++){const ea=(pT*0.7+e*0.628)%(Math.PI*2),er=30*sizeMult;
    ctx.strokeStyle=`rgba(255,0,255,${0.5+Math.sin(pT+e)*0.3})`; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(player.x+Math.cos(ea)*er*0.65,baseY+height/2+Math.sin(ea)*er*0.65);
    ctx.lineTo(player.x+Math.cos(ea)*er,baseY+height/2+Math.sin(ea)*er); ctx.stroke();}
    ctx.shadowBlur=0;
  }
  if (player.hasClone) {
    ctx.globalAlpha=0.35; ctx.shadowColor='#e6e6fa'; ctx.shadowBlur=10;
    ctx.strokeStyle='#e6e6fa'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(player.cloneX,player.cloneY-height/2,9,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(player.cloneX,player.cloneY-height/2+12); ctx.lineTo(player.cloneX,player.cloneY-8); ctx.stroke();
    ctx.shadowBlur=0; ctx.globalAlpha=1;
  }
  // Combo aura
  if (player.comboCount >= 3) {
    ctx.shadowColor=element.color; ctx.shadowBlur=22;
    ctx.strokeStyle=element.color; ctx.lineWidth=2.5; ctx.globalAlpha=0.35+Math.sin(pT*0.6)*0.2;
    ctx.beginPath(); ctx.ellipse(player.x,baseY+height/2,30*sizeMult,height/2*sizeMult+6,0,0,Math.PI*2); ctx.stroke();
    ctx.shadowBlur=0; ctx.globalAlpha=1;
  }

  ctx.restore();

  // ===== HP BAR =====
  const hpW=72,hpX=player.x-hpW/2,hpY=baseY-30;
  const hpPct=player.hp/player.maxHp;
  ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(hpX-3,hpY-3,hpW+6,13,4); else ctx.rect(hpX-3,hpY-3,hpW+6,13);
  ctx.fill();
  const hpGrad=ctx.createLinearGradient(hpX,hpY,hpX+hpW*hpPct,hpY);
  if(hpPct>0.5){hpGrad.addColorStop(0,'#16a34a');hpGrad.addColorStop(1,'#4ade80');}
  else if(hpPct>0.25){hpGrad.addColorStop(0,'#ca8a04');hpGrad.addColorStop(1,'#facc15');}
  else{hpGrad.addColorStop(0,'#dc2626');hpGrad.addColorStop(1,'#f87171');}
  ctx.shadowColor=hpPct>0.5?'#4ade80':hpPct>0.25?'#facc15':'#f87171'; ctx.shadowBlur=10;
  ctx.fillStyle=hpGrad; ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(hpX,hpY,Math.max(0,hpPct*hpW),7,3); else ctx.rect(hpX,hpY,Math.max(0,hpPct*hpW),7);
  ctx.fill(); ctx.shadowBlur=0;
  ctx.strokeStyle=element.color; ctx.lineWidth=1.5; ctx.beginPath();
  if(ctx.roundRect) ctx.roundRect(hpX-3,hpY-3,hpW+6,13,4); else ctx.rect(hpX-3,hpY-3,hpW+6,13);
  ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font=`bold ${9*sizeMult}px sans-serif`; ctx.textAlign='center';
  ctx.fillText(`P${idx+1}`,player.x,hpY-4);
  if(player.comboCount>=2){
    const cc=player.comboCount>=5?'#ff4500':player.comboCount>=3?'#ff9900':element.color;
    ctx.shadowColor=cc; ctx.shadowBlur=18;
    ctx.fillStyle=cc; ctx.font=`bold ${Math.min(16,11+player.comboCount)*sizeMult}px sans-serif`;
    ctx.fillText(`${player.comboCount}× COMBO`,player.x,hpY-16); ctx.shadowBlur=0;
  }
  // Alt-ability cooldown bar (S/K key)
  const altCD = player._altCooldown || 0;
  if (altCD > 0) {
    const altW = hpW; const altX = hpX; const altY = hpY + 15;
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(altX-3,altY-1,altW+6,7,3); else ctx.rect(altX-3,altY-1,altW+6,7);
    ctx.fill();
    const altPct = 1 - altCD / 300;
    const altG = ctx.createLinearGradient(altX,altY,altX+altW*altPct,altY);
    altG.addColorStop(0,'#1a1aff'); altG.addColorStop(1,'#00aaff');
    ctx.fillStyle=altG; ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(altX,altY,Math.max(0,altPct*altW),5,2); else ctx.rect(altX,altY,Math.max(0,altPct*altW),5);
    ctx.fill();
    ctx.fillStyle='rgba(100,160,255,0.7)'; ctx.font=`bold 7px sans-serif`; ctx.textAlign='center';
    ctx.fillText('S/K CDN',player.x, altY-3);
  }
}

export function drawHitEffects(ctx, hitEffects) {
  hitEffects.forEach(h => {
    const a = Math.max(0, Math.min(1, h.life));
    ctx.save(); ctx.globalAlpha = a;
    ctx.shadowColor=h.color; ctx.shadowBlur=22;
    // Outer ring
    ctx.strokeStyle=h.color; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(h.x,h.y,Math.max(0.1,h.size),0,Math.PI*2); ctx.stroke();
    // Inner ring
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.globalAlpha=a*0.45;
    ctx.beginPath(); ctx.arc(h.x,h.y,Math.max(0.1,h.size*0.5),0,Math.PI*2); ctx.stroke();
    // Shards
    const numS=8;
    for(let sh=0;sh<numS;sh++){const angle=(sh/numS)*Math.PI*2+h.life*2;
    const sLen=h.size*(0.35+0.35);
    ctx.strokeStyle=h.color; ctx.lineWidth=2; ctx.globalAlpha=a*0.65;
    ctx.beginPath(); ctx.moveTo(h.x+Math.cos(angle)*h.size*0.25,h.y+Math.sin(angle)*h.size*0.25);
    ctx.lineTo(h.x+Math.cos(angle)*sLen,h.y+Math.sin(angle)*sLen); ctx.stroke();}
    ctx.shadowBlur=0; ctx.globalAlpha=1; ctx.restore();
  });
}
