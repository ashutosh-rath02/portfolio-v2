/* Figures for Inference Engineering, chapter 1. Shared helpers live in /notes/assets/notes.js. */
(function(){
'use strict';
var N=window.Notes,$=N.$,$$=N.$$,se=N.se,sp=N.sp,clamp=N.clamp,setPressed=N.setPressed,reduce=N.reduce;

/* Fig A: triangle */
N.figure('tri',function(){
  var svg=$('#tri'),T={x:360,y:80},L={x:120,y:350},R={x:600,y:350},V=[T,L,R];
  var grid=$('#tri-grid');
  for(var i=0;i<3;i++){var a=V[i],b=V[(i+1)%3],c=V[(i+2)%3];
    for(var k=1;k<4;k++){var f=k/4;
      se('line',{x1:a.x*f+b.x*(1-f),y1:a.y*f+b.y*(1-f),x2:a.x*f+c.x*(1-f),y2:a.y*f+c.y*(1-f),'class':'ln soft thin'},grid)}}
  var pulls=V.map(function(v){return se('line',{x1:v.x,y1:v.y,x2:384,y2:188,'class':'ln a'},$('#tri-pulls'))});
  var dot=$('#tri-dot'),fills=$$('.bar-fill',$('#tri-bars')),vals=$$('.bar-val',$('#tri-bars')),w=[.6,.15,.25];
  function set(nw){
    w=nw;var x=w[0]*T.x+w[1]*L.x+w[2]*R.x,y=w[0]*T.y+w[1]*L.y+w[2]*R.y;
    dot.style.transform='translate('+x+'px,'+y+'px)';
    pulls.forEach(function(p,i){p.setAttribute('x2',x);p.setAttribute('y2',y);p.style.strokeOpacity=(.15+.85*w[i]).toFixed(2)});
    fills.forEach(function(f,i){f.style.width=(w[i]*100).toFixed(0)+'%';vals[i].textContent=Math.round(w[i]*100)+'%'});
  }
  function bary(x,y){
    var d=(L.y-R.y)*(T.x-R.x)+(R.x-L.x)*(T.y-R.y);
    var w1=((L.y-R.y)*(x-R.x)+(R.x-L.x)*(y-R.y))/d,w2=((R.y-T.y)*(x-R.x)+(T.x-R.x)*(y-R.y))/d;
    return [w1,w2,1-w1-w2];
  }
  var btns=$$('#tri-presets button'),cancel=null;
  function place(e){var p=sp(svg,e),b=bary(p.x,p.y).map(function(v){return Math.max(0,v)}),s=b[0]+b[1]+b[2];if(cancel)cancel();set(b.map(function(v){return v/s}));setPressed(btns,null)}
  N.drag(svg,place);
  btns.forEach(function(b){b.addEventListener('click',function(){
    setPressed(btns,b);if(cancel)cancel();
    cancel=N.tween(w.slice(),b.dataset.w.split(',').map(Number),380,set);
  })});
  set(w);
});

/* Fig B: five inputs */
N.figure('five-inputs',function(){
  N.radial($('#five'),{
    read:'#five-read',list:'#five-list',center:['Your','product'],
    items:[
      ['Model requirements','Which model or models do you need to run inference on?'],
      ['Application interface','How will inputs be delivered to the model, and how should the output be formatted?'],
      ['Latency budget','End to end, how fast does your product need to respond to a user action?'],
      ['Unit economics','What does it make sense to spend per request, per user or per month?'],
      ['Usage patterns','How many concurrent users do you serve, and does usage follow a pattern such as business hours?']
    ]
  });
});

/* Fig C: cost */
N.figure('cost',function(){
  var sl=$('#cost-v'),line=$('#cost-line'),d1=$('#cost-d1'),d2=$('#cost-d2'),o=$('#cost-o'),r=$('#cost-read');
  function upd(){
    var v=sl.value/100,x=70+610*v,y=300-240*v;
    line.setAttribute('x1',x);line.setAttribute('x2',x);d1.setAttribute('cx',x);d1.setAttribute('cy',y);d2.setAttribute('cx',x);
    o.textContent=sl.value+'%';
    var below=v<110/240;
    $('h4',r).textContent=below?'Shared is cheaper here':'Dedicated is cheaper here';
    $('p',r).textContent=below?'At this volume, paying per token costs less than keeping GPUs running, and you avoid the engineering work. Stay on shared inference.':'Per-token spend has passed the cost of running your own GPUs. If you also have specialization or orchestration needs, the case for dedicated is strong.';
  }
  sl.addEventListener('input',upd);upd();
});

/* Fig E: online / offline */
N.figure('online-offline',function(){
  var g=$('#lanes'),btns=$$('#oo-modes button');
  var M={online:{n:2,d:1.0,h:'Online',p:'A person is waiting, so each request is served fast. Few requests are in flight at once, which leaves GPU capacity on the table.'},
         offline:{n:24,d:5.0,h:'Offline batch',p:'No one waits on a single request, so many are packed in parallel. Each one takes longer, and the system finishes far more of them per hour.'}};
  function build(m){
    var c=M[m];g.innerHTML='';
    var sp2=c.n<=3?56:170/(c.n-1);
    for(var i=0;i<c.n;i++){
      var y=125+(i-(c.n-1)/2)*sp2;
      se('line',{x1:230,x2:490,y1:y,y2:y,'class':'ln soft thin'},g);
      var d=se('circle',{cx:230,cy:y,'class':'req',r:c.n>8?2.8:5.5},g);
      if(reduce){d.setAttribute('cx',230+(i/c.n)*260);d.style.animation='none'}
      else d.style.animation='run '+c.d+'s linear '+(-(i/c.n)*c.d)+'s infinite';
    }
    $('#oo-lat').style.width=(c.d/5*100)+'%';$('#oo-lat-v').textContent=c.d.toFixed(1)+' s';
    var thr=c.n/c.d;$('#oo-thr').style.width=(thr/5*100)+'%';$('#oo-thr-v').textContent=thr.toFixed(1);
    var r=$('#oo-read');$('h4',r).textContent=c.h;$('p',r).textContent=c.p;
  }
  btns.forEach(function(b){b.addEventListener('click',function(){setPressed(btns,b);build(b.dataset.m)})});
  build('online');
});

/* Fig F: path highlight */
N.figure('path',function(){
  var btns=$$('#path-modes button'),svg=$('#path');
  btns.forEach(function(b){b.addEventListener('click',function(){
    setPressed(btns,b);var s=b.dataset.s;
    $('.p-early',svg).classList.toggle('dim',s==='scale');
    $('.p-scale',svg).classList.toggle('dim',s==='early');
  })});
});

/* Fig H: fine-tune grid */
N.figure('fine-tune',function(){
  var grid=$('#ft-grid'),sl=$('#ft-v'),base=[],tuned=[],cells=[];
  var changed={3:1,8:1,10:1,15:1,16:1,22:1,27:1,31:1};
  for(var i=0;i<36;i++){
    base[i]=(i*7+3)%10;
    tuned[i]=changed[i]?(base[i]<5?base[i]+4+(i%2):base[i]-4-(i%2)):base[i];
    var c=document.createElement('i');c.textContent=base[i];grid.appendChild(c);cells.push(c);
  }
  function upd(){
    var v=sl.value/100,n=0;
    cells.forEach(function(c,i){
      var val=Math.round(base[i]+(tuned[i]-base[i])*v);
      c.textContent=val;var diff=val!==base[i];c.classList.toggle('ch',diff);if(diff)n++;
    });
    $('#ft-n').textContent=n;$('#ft-o').textContent=sl.value+'%';
  }
  sl.addEventListener('input',upd);upd();
});

/* Fig I: distillation */
N.figure('distill',function(){
  var tok=['SELECT','WITH','INSERT','UPDATE','DELETE'],soft=[.70,.18,.06,.04,.02],hard=[1,0,0,0,0];
  var box=$('#ds-bars'),rows=[],btns=$$('#ds-modes button');
  tok.forEach(function(t){
    var r=document.createElement('div');r.className='ds-row';
    r.innerHTML='<span>'+t+'</span><span class="bar-t"><i class="bar-fill"></i></span><span class="bar-val"></span>';
    box.appendChild(r);rows.push(r);
  });
  function show(m){
    var d=m==='soft'?soft:hard;
    rows.forEach(function(r,i){$('.bar-fill',r).style.width=(d[i]*100)+'%';$('.bar-val',r).textContent=Math.round(d[i]*100)+'%'});
    var rd=$('#ds-read');
    $('h4',rd).textContent=m==='soft'?'Distillation':'Training on answers';
    $('p',rd).textContent=m==='soft'?'The student sees how confident the teacher was in every option, including the near misses. That is more information per example than the final pick alone.':'The student only sees the single correct token. Every other option reads as equally wrong.';
  }
  btns.forEach(function(b){b.addEventListener('click',function(){setPressed(btns,b);show(b.dataset.m)})});
  show('soft');
});

/* Fig J: token timeline */
N.figure('tokens',function(){
  var N=12,X0=40,X1=680;
  var sT=$('#tt-ttft'),sI=$('#tt-itl'),sU=$('#tt-users'),pre=$('#tt-pre'),g=$('#tt-ticks'),ticks=[];
  for(var k=0;k<N;k++)ticks.push(se('rect',{width:3,height:44,y:96,fill:'var(--acc)'},g));
  var head=$('#tt-head'),TT,IT,total,raf=0;
  function layout(){
    TT=+sT.value;IT=+sI.value;total=TT+(N-1)*IT+IT*.6;
    var sc=(X1-X0)/total,xT=X0+TT*sc,x1=xT+IT*sc;
    pre.setAttribute('width',TT*sc);
    ticks.forEach(function(r,k){r.setAttribute('x',X0+(TT+k*IT)*sc-1.5);r.setAttribute('opacity',1)});
    $('#tt-bt').setAttribute('d','M'+X0+' 160 V170 H'+xT+' V160');
    $('#tt-bi').setAttribute('d','M'+xT+' 205 V215 H'+x1+' V205');
    var lt=$('#tt-lt'),li=$('#tt-li');
    lt.setAttribute('x',clamp((X0+xT)/2,95,625));lt.textContent='TTFT '+TT+' ms';
    li.setAttribute('x',clamp((xT+x1)/2,70,650));li.textContent='ITL '+IT+' ms';
    $('#tt-ttft-o').textContent=TT+' ms';$('#tt-itl-o').textContent=IT+' ms';$('#tt-users-o').textContent=sU.value;
    var tps=1000/IT;
    $('#tt-tps').textContent=tps%1?tps.toFixed(1):tps;
    $('#tt-100').textContent=((TT+99*IT)/1000).toFixed(2)+' s';
    $('#tt-total').textContent=Math.round(tps*sU.value).toLocaleString('en-US');
  }
  function play(){
    cancelAnimationFrame(raf);var start=performance.now(),dur=3400;
    head.style.opacity=1;
    function f(now){
      var p=clamp((now-start)/dur,0,1),x=X0+p*(X1-X0),time=p*total,n=0;
      head.setAttribute('x1',x);head.setAttribute('x2',x);
      ticks.forEach(function(r,k){var on=TT+k*IT<=time;if(on)n++;r.setAttribute('opacity',on?1:.2)});
      $('#tt-count').textContent=p<1?'Tokens received: '+n+' of '+N:'All '+N+' tokens received. TTFT was '+TT+' ms.';
      if(p<1)raf=requestAnimationFrame(f);else{head.style.opacity=0;ticks.forEach(function(r){r.setAttribute('opacity',1)})}
    }
    raf=requestAnimationFrame(f);
  }
  [sT,sI,sU].forEach(function(s){s.addEventListener('input',layout)});
  $('#tt-play').addEventListener('click',play);
  layout();
});

/* Fig K: percentiles */
N.figure('percentiles',function(){
  var m=.8,s=.6,mu=Math.log(m),TMAX=4,X0=60,PW=630,Y0=290,YH=225;
  function pdf(t){return t<=0?0:Math.exp(-Math.pow(Math.log(t)-mu,2)/(2*s*s))/(t*s*Math.sqrt(2*Math.PI))}
  function erf(x){var t=1/(1+.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return x>=0?y:-y}
  function cdf(t){return t<=0?0:.5*(1+erf((Math.log(t)-mu)/(s*Math.SQRT2)))}
  function X(t){return X0+t/TMAX*PW}
  var mode=m*Math.exp(-s*s),vmax=pdf(mode),pts=[];
  for(var t=.02;t<=TMAX+1e-9;t+=.02)pts.push([X(t),Y0-pdf(t)/vmax*YH]);
  var d='M'+pts.map(function(p){return p[0].toFixed(1)+' '+p[1].toFixed(1)}).join(' L');
  $('#pct-curve').setAttribute('d',d);
  var area=d+' L'+X(TMAX)+' '+Y0+' L'+pts[0][0].toFixed(1)+' '+Y0+' Z';
  $('#pct-areaL').setAttribute('d',area);$('#pct-areaR').setAttribute('d',area);
  var marks=$('#pct-marks'),q={P50:0,P90:1.2816,P95:1.6449,P99:2.3263};
  [0,1,2,3,4].forEach(function(v){
    se('line',{x1:X(v),x2:X(v),y1:Y0,y2:Y0+6,'class':'ln'},marks);
    var tx=se('text',{'class':'tm',x:X(v),y:Y0+22,'text-anchor':'middle'},marks);tx.textContent=v+' s';
  });
  Object.keys(q).forEach(function(k){
    var tt=m*Math.exp(s*q[k]);
    se('line',{x1:X(tt),x2:X(tt),y1:Y0-20,y2:Y0,'class':'ln w'},marks);
    var a=se('text',{'class':'t tw',x:X(tt),y:Y0+48,'text-anchor':'middle'},marks);a.textContent=k;
    var b=se('text',{'class':'tm',x:X(tt),y:Y0+63,'text-anchor':'middle'},marks);b.textContent=tt.toFixed(2)+' s';
  });
  var mean=m*Math.exp(s*s/2);
  se('line',{x1:X(m),x2:X(m),y1:44,y2:Y0,'class':'ln a dash'},marks);
  se('line',{x1:X(mean),x2:X(mean),y1:44,y2:Y0,'class':'ln w dash'},marks);
  var ta=se('text',{'class':'t ta',x:X(m)-6,y:40,'text-anchor':'end'},marks);ta.textContent='MEDIAN '+m.toFixed(2)+' s';
  var tw=se('text',{'class':'t tw',x:X(mean)+6,y:40},marks);tw.textContent='MEAN '+mean.toFixed(2)+' s';
  var svg=$('#pct'),sl=$('#pct-t');
  function upd(t){
    t=clamp(t,.2,TMAX);var x=X(t),slower=(1-cdf(t))*100;
    $('#pct-scrub').setAttribute('x1',x);$('#pct-scrub').setAttribute('x2',x);
    $('#pct-handle').setAttribute('cx',x);
    $('#clipL-r').setAttribute('width',x-X0);$('#clipR-r').setAttribute('x',x);$('#clipR-r').setAttribute('width',X0+PW+10-x);
    sl.value=t;$('#pct-o').textContent=t.toFixed(2)+' s';
    var pct=slower<1?slower.toFixed(1):Math.round(slower);
    $('#pct-read').innerHTML='<strong>'+pct+'%</strong> of requests take longer than <strong>'+t.toFixed(2)+' s</strong>. The mean is '+mean.toFixed(2)+' s against a median of '+m.toFixed(2)+' s, because slow outliers pull the mean to the right.';
  }
  function fromEvent(e){var p=sp(svg,e);upd((p.x-X0)/PW*TMAX)}
  N.drag(svg,fromEvent,{hover:true});
  sl.addEventListener('input',function(){upd(+sl.value)});
  upd(1.73);

  /* dots */
  var dots=$('#pct-dots'),ds=[];
  for(var i=0;i<100;i++)ds.push(se('circle',{cx:10+(i%10)*20,cy:10+Math.floor(i/10)*20,r:6,fill:'var(--line2)',stroke:'var(--line)','stroke-width':.8},dots));
  function hl(k){ds.forEach(function(c,i){var s=i>=100-k;c.setAttribute('fill',s?'var(--warn)':'var(--line2)');c.setAttribute('stroke',s?'var(--warn)':'var(--line)')})}
  $$('#pct-tbl tr[data-k]').forEach(function(r){
    var k=+r.dataset.k;
    r.addEventListener('mouseenter',function(){hl(k)});r.addEventListener('focus',function(){hl(k)});
  });
  hl(10);
});

/* Fig L: end to end */
N.figure('end-to-end',function(){
  var net=$('#e2e-net'),q=$('#e2e-q'),inf=$('#e2e-inf'),btns=$$('#e2e-presets button'),wrap=$('#brk-wrap');
  function upd(){
    var n=+net.value,w=+q.value,i=+inf.value,tot=n+w+i,half=n/2;
    $('#sg-up').style.flexGrow=half;$('#sg-down').style.flexGrow=half;$('#sg-q').style.flexGrow=w||.001;$('#sg-gpu').style.flexGrow=i;
    $('#e2e-net-o').textContent=n+' ms';$('#e2e-q-o').textContent=w+' ms';$('#e2e-inf-o').textContent=i+' ms';
    var W=wrap.clientWidth,left=(half+w)/tot*W,width=i/tot*W,b=$('#brk-inf'),sp1=$('#brk-inf-l');
    b.style.left=left+'px';b.style.width=width+'px';
    sp1.textContent='inference time '+i+' ms';
    var c=clamp(left+width/2,85,W-85);sp1.style.left=(c-left)+'px';sp1.style.transform='translateX(-50%)';
    var all=$('#brk-all-l');all.textContent='end-to-end time '+tot+' ms';all.style.left='50%';all.style.transform='translateX(-50%)';
    var share=i/tot,r=$('#e2e-read'),slow=share<.5;
    r.classList.toggle('warn',slow);
    $('h4',r).textContent=slow?'Look at infrastructure first':'Model performance work pays off';
    $('p',r).textContent='Inference is '+Math.round(share*100)+'% of the '+tot+' ms end-to-end time. '+(slow?'Most of the wait is network and queueing, so faster kernels would barely move what users feel.':'Most of the wait is on the GPU, so speeding up the model is the lever that moves what users feel.');
  }
  [net,q,inf].forEach(function(s){s.addEventListener('input',function(){setPressed(btns,null);upd()})});
  btns.forEach(function(b){b.addEventListener('click',function(){var v=b.dataset.v.split(',');net.value=v[0];q.value=v[1];inf.value=v[2];setPressed(btns,b);upd()})});
  addEventListener('resize',upd);
  upd();
});

/* Fig M: chapter map */
N.figure('chapter-map',function(){
  N.mindmap($('#map-svg'),[
    ['1.1 Specialize',['Shared API: pay per token','Dedicated GPUs: pay per hour','Switch: scale, specialization, orchestration']],
    ['1.2 Know your app',['Vertical apps: add every constraint','Online: latency. Offline: throughput','Consumer: cost. B2B: uptime']],
    ['1.3 Pick the model',['Smaller model, faster and cheaper','Evals set the bar and the baseline','Fine-tune for domain, distill for size']],
    ['1.4 Measure',['TTFT and TPS, plus inter-token latency','Percentiles, not averages','End to end versus inference only']]
  ],'Prerequisites');
});

/* Recall cards */
N.figure('recall',function(){
  N.flashcards($('#fcs'),[
    ['What three things do you trade off when optimizing inference?','Latency, throughput and quality. Optimization is finding the right balance, not maximizing one.'],
    ['Name the five things to know before optimizing.','Model requirements, application interface, latency budget, unit economics and usage patterns.'],
    ['Why start on shared inference, and when do you leave it?','Early requirements are unclear, and shared has no overhead and no cold starts. Move to dedicated for scale, specialization or orchestration, and only with a clear business need.'],
    ['What do you optimize for in online versus offline workloads?','Online workloads optimize for latency. Offline batch workloads optimize for throughput by running many requests in parallel.'],
    ['What is the most important performance decision?','Which model you use. A smaller model is faster and cheaper, so find the smallest one that passes your evals.'],
    ['Why can public benchmarks not replace your own evals?','They saturate and get gamed, per Goodhart\'s Law. They help shortlist models, but only your own evals measure your application.'],
    ['How do fine-tuning and distillation differ?','Fine-tuning adapts a model to a domain with new data. Distillation trains a small student on a large teacher\'s probability distributions.'],
    ['What do TTFT and TPS measure, and what limits each?','TTFT is the wait for the first token, limited by compute-bound prefill. TPS is the token rate after that, limited by bandwidth-bound decode.'],
    ['Why use percentiles, and what is the end-to-end rule?','Response times are right-skewed, so averages hide outliers and P90 and P99 matter. If inference is fast but end-to-end is slow, fix infrastructure.']
  ]);
});

})();
