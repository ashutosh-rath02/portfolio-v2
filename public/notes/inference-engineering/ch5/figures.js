(function(){
var N=window.Notes,$=N.$,fmt=N.fmt;

N.figure('five',function(){
  N.flow($('#five'),{cols:5,rowH:90,nodeH:60,read:'#five-read',start:'q',
    nodes:[
      {id:'q',t:'Quantize',s:'lower precision',c:0,r:0,kind:'warn',w:120,info:'Targets both phases: prefill gets faster Tensor Cores, decode moves fewer bytes. The only technique here that can change output quality, so it needs testing.'},
      {id:'s',t:'Speculate',s:'draft and verify',c:1,r:0,w:120,info:'Targets decode latency by using idle compute to produce several tokens per pass. Best at low batch sizes. Lossless.'},
      {id:'c',t:'Cache',s:'reuse the KV',c:2,r:0,w:120,info:'Targets prefill and TTFT by skipping work for repeated prefixes. Lossless, and pays off with long shared contexts.'},
      {id:'p',t:'Parallelize',s:'many GPUs',c:3,r:0,w:120,info:'Targets models and caches too large for one GPU. TP for latency, EP for MoE throughput. Lossless.'},
      {id:'d',t:'Disaggregate',s:'split the phases',c:4,r:0,w:120,info:'Targets interference between prefill and decode at scale by running them on separate engines. Lossless, but needs heavy traffic.'}],
    edges:[]});
});

N.figure('q',function(){
  N.calc($('#q-calc'),{
    inputs:[{k:'p',label:'Model parameters (billions)',min:7,max:700,step:1,value:70},{k:'b',label:'Precision',opts:[{l:'FP16 / BF16',v:2},{l:'FP8',v:1},{l:'FP4',v:.5}],value:2}],
    outputs:[{label:'Weight memory',fn:function(v){return v.p*v.b},fmt:function(v){return fmt.n(v)+' GB'}},
             {label:'Typical speedup',fn:function(v){return Math.round(Math.log(2/v.b)/Math.LN2)},fmt:function(s){return s===0?'baseline':fmt.n(Math.pow(1.3,s),2)+' to '+fmt.n(Math.pow(1.5,s),2)+'x'},sub:'30 to 50% per step down'}],
    bars:[{label:'Weight bytes',fn:function(v){return v.p*v.b/1400},max:1,fmt:function(v){return fmt.pct(v)}}],
    read:function(v){return v.b===2?['Native precision','No quantization. Highest quality and the baseline for every comparison.']:v.b===1?['FP8, the sweet spot','Half the memory and a solid speedup with high dynamic range, usually without perceptible quality loss when tested.']:['FP4, higher risk','A quarter of the memory. Favor NVFP4 or MXFP4 with block scaling, and test quality carefully against the original.',true]}});
});

N.figure('pi',function(){
  var tp=Math.pow(Math.PI,3);
  N.calc($('#pi-calc'),{
    inputs:[{k:'x',label:'Pi stored as',opts:[{l:'3.14159',v:3.14159},{l:'3.14',v:3.14},{l:'3',v:3}],value:3.14159}],
    outputs:[{label:'Squared',fn:function(v){return v.x*v.x},fmt:function(v){return fmt.n(v,6)}},
             {label:'Cubed',fn:function(v){return Math.pow(v.x,3)},fmt:function(v){return fmt.n(v,6)}},
             {label:'Error after cubing',fn:function(v){return Math.abs(Math.pow(v.x,3)-tp)/tp},fmt:function(v){return fmt.n(v*100,2)+'%'},sub:'against full precision'}],
    read:function(v){return v.x===3?['Coarse values hurt','Rounding pi to 3 makes the cube about 13% off. Each further operation builds on the last error, which is why careful quantization matters.',true]:['Small error, but it grows','Each multiplication carries the earlier error forward. Inference chains thousands of operations.']}});
});

N.figure('sens',function(){
  N.barchart($('#sens-bars'),{read:'#sens-read',max:4,rows:[
    {label:'Weights',value:1,text:'least',info:'Linear layer weights are least sensitive. Early and late layers may still stay in original precision.'},
    {label:'Activations',value:2,text:'some',info:'Intermediate outputs are somewhat sensitive. Activation functions themselves are rarely quantized because they are so small.'},
    {label:'KV cache',value:3,text:'moderate',kind:'w',info:'Moderately sensitive, but quantizing it stores more cache and reads it faster, helping prefix caching and disaggregation. Errors compound token to token.'},
    {label:'Attention',value:4,text:'high',kind:'w',info:'Highly sensitive to dynamic range and each calculation depends on all earlier ones, so errors accumulate. Softmax usually stays in original precision.'}]});
  var h=$('#sens-read');$('h4',h).textContent='A moderate recipe';$('p',h).textContent='Use FP8 or MXFP8 on selected linear layers, activations and often the KV cache, and leave attention components alone.';
});

N.figure('spec',function(){
  N.calc($('#spec-calc'),{
    inputs:[{k:'n',label:'Draft tokens per pass',min:1,max:8,step:1,value:4},
            {k:'a',label:'Acceptance rate per token (%)',min:30,max:98,step:1,value:75},
            {k:'c',label:'Draft cost per token (% of a target pass)',min:1,max:25,step:1,value:5}],
    outputs:[{label:'Tokens per target pass',fn:function(v){var a=v.a/100;return (1-Math.pow(a,v.n+1))/(1-a)},fmt:function(x){return fmt.n(x,2)},sub:'accepted drafts plus one'},
             {label:'Net speedup',fn:function(v){var a=v.a/100;return ((1-Math.pow(a,v.n+1))/(1-a))/(1+v.c/100*v.n)},fmt:function(x){return fmt.n(x,2)+'x'},sub:'after paying for drafting'}],
    bars:[{label:'Speedup',fn:function(v){var a=v.a/100;return ((1-Math.pow(a,v.n+1))/(1-a))/(1+v.c/100*v.n)},max:4,fmt:function(x){return fmt.n(x,2)+'x'}}],
    read:function(v,o){return o[1]<1?['Slower than no speculation','Drafts are too costly or rejected too often. Shorten the draft or improve acceptance.',true]:v.a<60?['Marginal gain','Low acceptance, as with high temperature or off-topic content, wastes verification work. Short drafts work best.',false]:['Healthy speedup','Short drafts with high acceptance pay off. Remember this only helps at low to moderate batch sizes with spare compute.',false]}});
});

N.figure('alg',function(){
  N.tabs($('#alg-tabs'),[
    {label:'Draft-target',html:'<h4>Two models</h4><p>A small draft model, ideally at least ten times smaller and from the same family, proposes tokens and the target verifies them. Quick to set up with no training, but it has the most overhead: extra weights, KV cache and prefill, and coordination between models.</p>'},
    {label:'Medusa',html:'<h4>Extra heads</h4><p>Fine-tunes the target with two to four additional decoder heads that draft sequential tokens, so no separate model is needed. Limited draft length and acceptance, and rarely used now, but it inspired EAGLE.</p>'},
    {label:'EAGLE',html:'<h4>The general purpose choice</h4><p>A purpose-built draft model, often under 1B parameters, trained on hidden states from an early, middle and late layer. It drafts up to eight tokens with high acceptance and lives in the same module as the target, avoiding extra CPU round trips. Needs training, and lower batch sizes.</p>'},
    {label:'N-gram',html:'<h4>No draft model</h4><p>Builds a dictionary of observed token sequences during prefill and drafts from it, with drafts that can exceed ten tokens. Acceptance is high only when output resembles input, so it shines for code completion and revision.</p>'},
    {label:'Lookahead',html:'<h4>Generates its own n-grams</h4><p>Fills the n-gram dictionary during inference, so it relies less on repetitive context, at the cost of extra compute. It generalizes in systems with spare compute.</p>'}]);
});

N.figure('prefix',function(){
  N.calc($('#prefix-calc'),{
    inputs:[{k:'len',label:'Prompt length (tokens)',min:500,max:32000,step:500,value:8000},{k:'pos',label:'Where the first changing token sits (% into prompt)',min:0,max:100,step:1,value:90}],
    outputs:[{label:'Tokens served from cache',fn:function(v){return Math.round(v.len*v.pos/100)}},
             {label:'Prefill saved',fn:function(v){return v.pos/100},fmt:fmt.pct}],
    bars:[{label:'Cached share',fn:function(v){return v.pos/100},max:1,fmt:fmt.pct}],
    read:function(v){return v.pos<20?['Change comes too early','The prefix ends at the first novel token, so nearly everything is recomputed even if the rest of the prompt is identical.',true]:['Novel tokens are late','Static system prompt and context come first, so most of the prompt hits the cache. Put per-request text at the end.']}});
});

N.figure('tier',function(){
  N.barchart($('#tier-bars'),{read:'#tier-read',max:4,rows:[
    {label:'G1 GPU VRAM',value:4,text:'TB/s',info:'10s to 100s of gigabytes. Fastest, holds the hottest blocks.'},
    {label:'G2 CPU RAM',value:3,text:'10s to 100s GB/s',info:'100s of gigabytes to terabytes. Superchips such as GB200 have much faster CPU to GPU links, making this tier attractive.'},
    {label:'G3 Local SSD',value:2,text:'5 to 10 GB/s',kind:'w',info:'Terabytes of capacity at moderate speed.'},
    {label:'G4 Network SSD',value:1,text:'GB/s',kind:'w',info:'10s of terabytes. Enables a global cache shared across replicas.'}]});
  var h=$('#tier-read');$('h4',h).textContent='Rule of thumb';$('p',h).textContent='Keep the most frequently used blocks in the faster tiers and let the rest wait in slower storage.';
});

N.figure('par',function(){
  N.tabs($('#par-tabs'),[
    {label:'Pipeline (PP)',html:'<h4>Split the layers</h4><p>Each GPU handles a stage of the model. Poor latency and utilization from the step-by-step pipeline, so it is only used between nodes.</p>'},
    {label:'Tensor (TP)',html:'<h4>Split inside each layer</h4><p>Matrix multiplications are shared across GPUs. Needs synchronization after each layer, so it is best for low latency inside a node and unsuitable across nodes.</p>'},
    {label:'Expert (EP)',html:'<h4>Shard the experts</h4><p>For MoE models, each expert lives on one GPU. Needs routing between GPUs, but total throughput improves and communication is lighter than TP.</p>'},
    {label:'Context',html:'<h4>Data parallel variants</h4><p>Strategies such as context parallelism are rare for LLMs but essential for video generation (section 6.6).</p>'}]);
});

N.figure('ep',function(){
  N.calc($('#ep-calc'),{
    inputs:[{k:'g',label:'GPUs in the EP group',opts:[{l:'EP1',v:1},{l:'EP2',v:2},{l:'EP4',v:4},{l:'EP8',v:8},{l:'EP16',v:16}],value:8}],
    outputs:[{label:'Experts per GPU',fn:function(v){return 128/v.g},sub:'of 128'},{label:'GPUs',fn:function(v){return v.g}}],
    bars:[{label:'Experts per GPU',fn:function(v){return 128/v.g},max:128,fmt:function(x){return fmt.n(x)}}],
    read:function(v){return v.g===8?['The book example','On EP8 each GPU hosts 16 complete experts, so in-expert inference stays fast and the router is replicated on every GPU.']:v.g>8?['Crosses nodes','EP needs less communication than TP, so it scales across nodes over InfiniBand better.']:['Fewer GPUs, more experts each','Each GPU holds more experts, using more memory per GPU and exposing less parallelism.']}});
});

N.figure('pick',function(){
  N.compare($('#pick-cmp'),{
    metrics:[{label:'Per-user latency'},{label:'Total throughput'},{label:'Interconnect need',kind:'w'}],
    options:[
      {label:'Dense, one node',vals:[1,.5,.5],text:['best','medium','NVLink'],h:'TP8',p:'Default choice. Tensor parallelism inside a node over NVLink.'},
      {label:'MoE, one node',vals:[.8,1,.5],text:['good','best','NVLink'],h:'TP with EP',p:'Mix tensor and expert parallelism for both latency and throughput.'},
      {label:'Dense, two nodes',vals:[.7,.5,.9],text:['good','medium','InfiniBand'],h:'TP8PP2',p:'Tensor parallelism in each node and pipeline parallelism between nodes.'},
      {label:'MoE, two nodes',vals:[.7,1,.7],text:['TP8PP2: lower','EP16: higher','InfiniBand'],h:'EP16 or TP8PP2',p:'TP8PP2 gives lower latency per user, EP16 gives higher system throughput. Only worth it if the model and cache need more than one node.'}]});
});

N.figure('dis',function(){
  N.flow($('#dis'),{cols:4,rowH:120,nodeH:62,particles:true,read:'#dis-read',start:'chk',play:['req','chk','pre','dec'],playBtn:'#dis-play',
    nodes:[
      {id:'req',t:'Request',s:'arrives',c:0,r:0,info:'A request reaches the decode engine first.'},
      {id:'chk',t:'Decode engine',s:'check the input',c:1,r:0,kind:'acc',info:'Conditional disaggregation: if the input is short or already cached, the decode engine prefills it locally. Otherwise it hands the request over.'},
      {id:'pre',t:'Prefill engine',s:'long inputs',c:2,r:0,info:'Builds the KV cache and computes the first token. Tuned for compute, often with lower TP than decode.'},
      {id:'dec',t:'Decode engine',s:'all later tokens',c:3,r:0,kind:'warn',info:'Receives the KV cache over the interconnect and generates every following token.'},
      {id:'loc',t:'Local prefill',s:'short or cached',c:1,r:1,info:'No disaggregation needed. Skips the transfer cost for requests where it would not pay off.'}],
    edges:[{a:'req',b:'chk'},{a:'chk',b:'pre',kind:'w',label:'long'},{a:'pre',b:'dec',kind:'w',label:'KV'},{a:'chk',b:'loc',kind:'a',label:'short'}]});
});

N.figure('when',function(){
  N.calc($('#when-calc'),{
    inputs:[{k:'v',label:'Daily traffic',opts:[{l:'Under 100M tokens',v:0},{l:'100M to 1B+ tokens',v:1}],value:0},
            {k:'m',label:'Model size',opts:[{l:'Under 100B',v:0},{l:'100B or more',v:1}],value:0},
            {k:'p',label:'Traffic shape',opts:[{l:'Short inputs',v:0},{l:'Long, prefill heavy',v:1}],value:0}],
    read:function(v){var n=v.v+v.m+v.p;
      if(!v.v||!v.m)return ['Probably not worth it','Without enough traffic or a large enough model the extra hardware buys little. Stay with aggregated serving.',true];
      if(!v.p)return ['Scale replicas instead','Decode engines handle short sequences and cache hits efficiently, so extra GPUs work better as horizontal replicas.',true];
      return ['Good candidate','High volume, a large model and prefill heavy traffic is the textbook case, such as a trillion parameter model behind a code editor.',false]}});
});

N.figure('xpyd',function(){
  N.calc($('#xpyd-calc'),{
    inputs:[{k:'p',label:'Prefill engines (x)',min:1,max:8,step:1,value:5},{k:'d',label:'Decode engines (y)',min:1,max:8,step:1,value:3}],
    outputs:[{label:'Layout',fn:function(v){return v.p*10+v.d},fmt:function(n){return Math.floor(n/10)+'P'+(n%10)+'D'}},{label:'Prefill to decode ratio',fn:function(v){return v.p/v.d},fmt:function(x){return fmt.n(x,2)}}],
    read:function(v){var r=v.p/v.d;return r<.5?['Watch the prefill queue','Few prefill engines can let the queue grow and raise TTFT. Add prefill capacity or raise the local prefill threshold.',true]:r>2.5?['Decode may starve','Plenty of prefill but few decode engines can run out of KV cache under load. Add decode engines, quantize the KV cache or offload it.',true]:['Roughly balanced','Revisit the ratio at runtime as traffic shifts. The right split depends on input lengths and load.']}});
});

N.figure('chapter-map',function(){
  N.mindmap($('#map-svg'),[
    ['5.1 Quantization',['30 to 50% per step','FP8 sweet spot','Attention most sensitive','Test quality three ways']],
    ['5.2 Speculation',['Draft, verify, N+1 tokens','EAGLE general purpose','N-gram for code','Low batch sizes only']],
    ['5.3 Caching',['Prefix first, novel last','Tiers G1 to G4','Route to the warm replica']],
    ['5.4 Parallelism',['TP for latency','EP for MoE throughput','TP8PP2 or EP16 across nodes']],
    ['5.5 Disaggregation',['Split prefill and decode','Conditional, xPyD','Needs scale and big models']]
  ],'Techniques');
});
N.figure('recall',function(){
  N.flashcards($('#fcs'),[
    ['Why does quantization speed up both phases?','Prefill runs on lower-precision Tensor Cores with more FLOPS, and decode loads fewer bytes per value, easing the bandwidth limit.'],
    ['Which components are most and least sensitive to quantization?','Least: weights. Then activations, the KV cache and finally attention, which is the most sensitive.'],
    ['Why are floating point formats preferred for inference?','The exponent gives a larger dynamic range, which represents outlier values better than integers.'],
    ['How do you check quality after quantizing?','Perplexity, standard benchmarks and your own evals, looking for differences that are indistinguishable from noise.'],
    ['How does speculative decoding work, and what does it improve?','A speculator drafts tokens, the target verifies them and adds one, giving N+1 tokens per pass. It improves TPS, not TTFT.'],
    ['When does speculation stop helping?','At high batch sizes with no spare compute, with high temperature, or when acceptance is low.'],
    ['What is the rule for prefix caching?','The prefix ends at the first differing token, so put novel tokens as late as possible.'],
    ['Where can the KV cache live?','G1 GPU memory, G2 host memory, G3 local SSD and G4 networked SSD, in descending bandwidth.'],
    ['TP versus EP versus PP?','TP splits layers internally and lowers latency in a node. EP shards MoE experts and raises throughput. PP splits layers across stages and is for multi-node.'],
    ['When is disaggregation worth it?','High traffic (about 100M to 1B tokens per day), a model of 100B or more, and prefill heavy inputs.'],
    ['What does 5P3D mean?','Five prefill engines and three decode engines serving one deployment.']
  ]);
});
})();
