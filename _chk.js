window.__chk=function(){const R=e=>e.getBoundingClientRect();const W=innerWidth;const out=[];
const inter=(a,b)=>{const x=Math.min(a.right,b.right)-Math.max(a.left,b.left),y=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return (x>1&&y>1)?Math.round(x)+'x'+Math.round(y):null};
if(document.documentElement.scrollWidth>W+1)out.push('SCROLL-X '+document.documentElement.scrollWidth+'>'+W);
const v=e=>{const r=R(e);return r.width>0&&r.height>0&&!e.closest('[hidden]')};
const palco=document.querySelector('.palco'),pr=R(palco);const m=palco.querySelector('.m'),mr=R(m);
const dcs=[...palco.querySelectorAll('.dc')].filter(v);
dcs.forEach(d=>{const r=R(d);let i=inter(r,mr);if(i)out.push('dc x mascote '+i);if(r.left<pr.left-1||r.right>pr.right+1||r.top<pr.top-1||r.bottom>pr.bottom+1)out.push('dc fora do palco');if(r.right>W+1||r.left<-1)out.push('dc fora da tela')});
for(let i=0;i<dcs.length;i++)for(let j=i+1;j<dcs.length;j++){const k=inter(R(dcs[i]),R(dcs[j]));if(k)out.push('dc x dc '+k)}
if(mr.right>W+1||mr.left<-1)out.push('mascote fora da tela '+Math.round(mr.right-W));
if(mr.top<pr.top-1||mr.bottom>pr.bottom+1)out.push('mascote fora do palco v');
document.querySelectorAll('#hero .txt > *').forEach(t=>{if(!v(t))return;const k=inter(R(t),pr);if(k&&getComputedStyle(palco).position==='absolute')out.push('texto x palco: '+t.className+' '+k);const tr=R(t);dcs.forEach(d=>{const q=inter(tr,R(d));if(q)out.push('texto x doodle '+q)});const q2=inter(tr,mr);if(q2)out.push('texto x mascote '+q2)});
document.querySelectorAll('.painel:not([hidden]) .cab, #contato .wrap').forEach(c=>{const kids=[...c.children].filter(v);for(let i=0;i<kids.length;i++)for(let j=i+1;j<kids.length;j++){const k=inter(R(kids[i]),R(kids[j]));if(k)out.push('sobreposto em '+(c.className||c.tagName)+': '+kids[i].className+' x '+kids[j].className+' '+k)}});
document.querySelectorAll('h1,h2,h3,p,.btn,.aba,.chip,.etq,.sel').forEach(e=>{if(v(e)&&e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible')out.push('texto cortado: '+e.textContent.slice(0,25))});
document.querySelectorAll('main *, header *').forEach(e=>{if(e.closest('[hidden]')||e.closest('.palco'))return;const r=R(e);if(r.width&&(r.right>W+2)&&getComputedStyle(e).position!=='fixed')out.push('fora da tela: '+(e.className||e.tagName).toString().slice(0,25)+' '+Math.round(r.right-W))});
return {w:W,problemas:out.slice(0,12)}};
