(function(){
var N=window.Notes,$=N.$,fmt=N.fmt;

N.figure('gen',function(){
  N.flow($('#gen'),{cols:5,rowH:90,nodeH:60,particles:true,read:'#gen-read',start:'pre',
    nodes:[
      {id:'tok',t:'Tokenize',s:'text to ids',c:0,r:0,info:'The prompt is wrapped in the chat template and split into subword tokens from a vocabulary of over 100,000.'},
      {id:'pre',t:'Prefill',s:'whole prompt',c:1,r:0,kind:'acc',info:'All prompt tokens are processed in parallel and the KV cache is built. This phase is compute bound and sets time to first token.'},
      {id:'dec',t:'Decode',s:'one token each',c:2,r:0,kind:'warn',info:'One token per step. Each step reloads the weights and reads the KV cache, so it is memory bound and sets tokens per second.'},
      {id:'samp',t:'Sample',s:'pick a token',c:3,r:0,info:'Logits become probabilities. Temperature, top-k and top-p decide which token is chosen.'},
      {id:'out',t:'Output',s:'until stop',c:4,r:0,info:'Tokens stream out until a stop token or max_tokens is reached.'}],
    edges:[{a:'tok',b:'pre'},{a:'pre',b:'dec',kind:'a'},{a:'dec',b:'samp',kind:'w'},{a:'samp',b:'out'}]});
});

function soft(l,t,k){
  var idx=l.map(function(v,i){return i}).sort(function(a,b){return l[b]-l[a]}).slice(0,k);
  var m=Math.max.apply(null,l),e=l.map(function(v,i){return idx.indexOf(i)>=0?Math.exp((v-m)/t):0}),s=e.reduce(function(a,b){return a+b},0);
  return e.map(function(v){return v/s});
}
N.figure('act',function(){
  var relu=function(x){return Math.max(0,x)},silu=function(x){return x/(1+Math.exp(-x))};
  N.calc($('#act-calc'),{
    inputs:[{k:'x',label:'Input x',min:-6,max:6,step:.1,value:1.5,fmt:function(v){return fmt.n(v,1)}}],
    outputs:[{label:'Linear (no activation)',fn:function(v){return v.x},fmt:function(v){return fmt.n(v,2)},sub:'passes straight through'},
             {label:'ReLU',fn:function(v){return relu(v.x)},fmt:function(v){return fmt.n(v,2)},sub:'negatives become zero'},
             {label:'SiLU',fn:function(v){return silu(v.x)},fmt:function(v){return fmt.n(v,2)},sub:'smooth, small dip below zero'}],
    bars:[{label:'ReLU',fn:function(v){return relu(v.x)},max:6,fmt:function(v){return fmt.n(v,2)}},{label:'SiLU',fn:function(v){return Math.max(0,silu(v.x))},max:6,fmt:function(v){return fmt.n(v,2)}}],
    read:function(v){return v.x<0?['Negative input','ReLU cuts it to zero. SiLU lets a small negative value through, which keeps gradients smooth.']:['Positive input','Both functions pass most of the value through. They differ mainly near and below zero.']}});
});

N.figure('samp',function(){
  var words=['mat','floor','sofa','moon','banana'],lg=[3.0,2.2,1.6,.4,-.5];
  N.calc($('#samp-calc'),{
    inputs:[{k:'t',label:'Temperature',min:.2,max:2,step:.1,value:1,fmt:function(v){return fmt.n(v,1)}},{k:'k',label:'Top-k',min:1,max:5,step:1,value:5}],
    bars:words.map(function(w,i){return{label:'"'+w+'"',fn:function(v){return soft(lg,v.t,v.k)[i]},max:1,fmt:fmt.pct,kind:i===0?'':''}}),
    read:function(v){var p=soft(lg,v.t,v.k);return [v.k===1?'Greedy':(v.t<.6?'Focused':v.t>1.4?'Adventurous':'Balanced'),
      'Top choice has '+Math.round(p[0]*100)+'% of the probability. Low temperature sharpens the distribution, high temperature flattens it, and top-k removes unlikely words before sampling.']}});
});

N.figure('block',function(){
  N.flow($('#block'),{cols:4,rowH:90,nodeH:60,read:'#block-read',start:'attn',
    nodes:[
      {id:'emb',t:'Embedding',s:'ids to vectors',c:0,r:0,info:'Each token id becomes a vector of the model dimension.'},
      {id:'attn',t:'Attention',s:'mix tokens',c:1,r:0,kind:'acc',info:'Tokens look at earlier tokens through queries, keys and values. This is where the KV cache is used.'},
      {id:'ffn',t:'Feed-forward',s:'per token',c:2,r:0,info:'Linear layers with an activation process each token independently. Most weights live here, or in experts for MoE models.'},
      {id:'head',t:'LM head',s:'logits',c:3,r:0,info:'A final linear layer produces one score per vocabulary entry. Normalization layers sit around each sublayer.'}],
    edges:[{a:'emb',b:'attn'},{a:'attn',b:'ffn',kind:'a'},{a:'ffn',b:'head'}]});
});

N.figure('kv',function(){
  N.calc($('#kv-calc'),{
    inputs:[{k:'n',label:'Tokens so far',min:100,max:8000,step:100,value:2000}],
    outputs:[{label:'Without cache',fn:function(v){return v.n*v.n},sub:'token pairs recomputed per step, about N squared'},
             {label:'With KV cache',fn:function(v){return v.n},sub:'new query against stored keys, about N'},
             {label:'Saving',fn:function(v){return v.n},fmt:function(v){return fmt.n(v)+'x'},sub:'ratio at this length'}],
    read:function(v){return ['Cache turns quadratic into linear','At '+fmt.n(v.n)+' tokens the cache avoids redoing about '+fmt.n(v.n)+' times the work per step. The price is memory: the cache grows with every token and must be read each step.',false]}});
});

N.figure('moe',function(){
  var base=7.8,per=1.775;
  N.calc($('#moe-calc'),{
    inputs:[{k:'k',label:'Experts picked per token (of 128)',min:1,max:32,step:1,value:8}],
    outputs:[{label:'Total parameters',fn:function(){return 235},fmt:function(v){return v+'B'},sub:'all must sit in memory'},
             {label:'Active per token',fn:function(v){return base+per*v.k},fmt:function(v){return fmt.n(v,1)+'B'},sub:'what a token computes with'}],
    bars:[{label:'Active share',fn:function(v){return (base+per*v.k)/235},max:1,fmt:fmt.pct,kind:'w'}],
    read:function(v){return ['Sparse compute, full memory','With '+v.k+' experts the active share is about '+Math.round((base+per*v.k)/235*100)+'%. At 8 experts this is the 22B of 235B Qwen3 example. Memory still has to hold everything, and large batches touch nearly every expert.']}});
});

N.figure('den',function(){
  N.calc($('#den-calc'),{
    inputs:[{k:'s',label:'Denoising steps',min:1,max:50,step:1,value:50},{k:'g',label:'Guidance passes per step',opts:[{l:'Two (guided)',v:2},{l:'One',v:1}],value:2}],
    outputs:[{label:'Forward passes',fn:function(v){return v.s*v.g}},{label:'Time vs 50 steps',fn:function(v){return v.s*v.g/100},fmt:fmt.pct,sub:'relative to 100 passes'}],
    bars:[{label:'Cost',fn:function(v){return v.s*v.g},max:100,kind:'w'}],
    read:function(v){return v.s<=8?['Few-step regime','Eight steps or fewer is where distilled few-step models live: roughly 80 to 90 percent faster, with lower output quality.']:['Standard regime','Typical models use 30 to 50 steps, so inference is 60 to 100 passes of a large denoiser.']}});
});

N.figure('img',function(){
  N.compare($('#img-cmp'),{
    metrics:[{label:'Parameters'},{label:'Latent size'},{label:'Speed',kind:'w'}],
    options:[
      {label:'Image model',vals:[.3,.1,.5],text:['1x','1x','50 steps'],h:'Standard image model',p:'Denoises a 2D latent in 30 to 50 steps. Compute bound, runs at modest batch sizes.'},
      {label:'Few-step image',vals:[.3,.1,.92],text:['1x','1x','8 steps'],h:'Few-step image model',p:'Distilled or latent consistency models finish in eight steps or fewer, 80 to 90 percent faster, with noticeably lower quality.'},
      {label:'Video model',vals:[.9,1,.12],text:['3 to 5x','10 to 100x','seconds per second'],h:'Video model',p:'Holds the whole clip in a 3D latent where every frame attends to every other. Often batch size one on a full eight GPU node.'}]});
});

N.figure('roof',function(){
  var peak=989,bw=3.35;
  N.calc($('#roof-calc'),{
    inputs:[{k:'i',label:'Arithmetic intensity (ops per byte)',min:1,max:1000,step:1,value:62}],
    outputs:[{label:'Achievable',fn:function(v){return Math.min(peak,v.i*bw)},fmt:function(v){return fmt.n(v)+' TFLOPS'},sub:'min of both ceilings'},
             {label:'Hardware ops:byte',fn:function(){return 295},sub:'H100, FP16'}],
    bars:[{label:'Of peak compute',fn:function(v){return Math.min(peak,v.i*bw)/peak},max:1,fmt:fmt.pct}],
    read:function(v){return v.i<295?['Memory bound','At '+v.i+' ops per byte the GPU is waiting on memory and uses about '+Math.round(v.i*bw/peak*100)+'% of its compute. 62 is the decode attention example in the book, so more compute helps nothing.',true]:['Compute bound','At '+v.i+' ops per byte compute is the limit. This is where prefill and image generation live.',false]}});
});

N.figure('bn',function(){
  N.flow($('#bn'),{cols:3,rowH:90,nodeH:60,read:'#bn-read',start:'dec',
    nodes:[
      {id:'pre',t:'LLM prefill',s:'compute bound',c:0,r:0,kind:'acc',info:'Weights load once, then large matrix multiplications run on the whole prompt. Sets TTFT.'},
      {id:'dec',t:'LLM decode',s:'memory bound',c:1,r:0,kind:'warn',info:'Weights reload for each token and the work per byte is small. Batching helps because more compute rides on the same memory traffic. Sets TPS.'},
      {id:'img',t:'Image and video',s:'compute bound',c:2,r:0,kind:'acc',info:'Attention over the full latent is heavy, like prefill. Techniques for these appear in sections 6.5 and 6.6.'}],
    edges:[]});
});

N.figure('att',function(){
  N.tabs($('#att-tabs'),[
    {label:'FlashAttention',html:'<h4>Implementation, lossless</h4><p>Hand-fused kernels written for specific GPUs, with different code for H100 and B200. They remove excess memory reads and writes and fit the algorithm to the hardware. Best for compute bound work such as prefill and video.</p>'},
    {label:'PagedAttention',html:'<h4>Implementation, lossless</h4><p>Splits the KV cache into blocks reached through a lookup table, so the cache can sit in fragmented GPU memory instead of one contiguous block.</p>'},
    {label:'Sliding window',html:'<h4>New algorithm</h4><p>Attend only to the last w tokens, often 8K to 32K. Cost drops from N squared to N times w. Training with it keeps quality high.</p>'},
    {label:'Other variants',html:'<h4>New algorithms</h4><ul><li>Gated attention: layers that approximate attention over chunks in linear time.</li><li>Linear attention: replaces softmax with a linear-time approximation.</li><li>Compressed attention: compresses old context, attends to compressed plus recent tokens.</li><li>Multi-latent attention: works in a low dimensional latent space.</li></ul>'},
    {label:'Beyond attention',html:'<h4>Different architecture</h4><p>Mamba style state-space models replace self-attention with a recurrent state update that scales linearly. Hybrids mix them with transformer blocks.</p>'}]);
});

N.figure('win',function(){
  N.calc($('#win-calc'),{
    inputs:[{k:'n',label:'Sequence length N',min:1000,max:128000,step:1000,value:64000},{k:'w',label:'Window w',min:1000,max:32000,step:1000,value:8000}],
    outputs:[{label:'Full attention',fn:function(v){return v.n*v.n/1e6},fmt:function(v){return fmt.n(v)+'M'},sub:'pairs, N squared'},
             {label:'Sliding window',fn:function(v){return v.n*Math.min(v.w,v.n)/1e6},fmt:function(v){return fmt.n(v)+'M'},sub:'pairs, N times w'}],
    bars:[{label:'Window cost',fn:function(v){return Math.min(v.w,v.n)/v.n},max:1,fmt:fmt.pct}],
    read:function(v){return ['Saving grows with length','At N='+fmt.n(v.n)+' the window does about '+Math.round(Math.min(v.w,v.n)/v.n*100)+'% of full attention. The longer the sequence, the larger the saving.']}});
});

N.figure('chapter-map',function(){
  N.mindmap($('#map-svg'),[
    ['2.1 Networks',['Layers of matmul','Activations add nonlinearity']],
    ['2.2 LLMs',['Prefill then decode','KV cache, sampling','Blocks, attention, MoE']],
    ['2.3 Image models',['Pipeline: encoder, denoiser, VAE','30 to 50 steps, two passes each','Few-step and video']],
    ['2.4 Bottlenecks',['Ops:byte vs intensity','Prefill compute, decode memory']],
    ['2.5 Attention',['FlashAttention, PagedAttention','Sliding window and others']]
  ],'Models');
});
N.figure('recall',function(){
  N.flashcards($('#fcs'),[
    ['Why do models need activation functions?','Without them stacked linear layers collapse into one. ReLU, SiLU and SwiGLU add the needed nonlinearity.'],
    ['What are prefill and decode?','Prefill processes the whole prompt in parallel and builds the KV cache. Decode produces one token at a time.'],
    ['What do temperature, top-k and top-p do?','Temperature sharpens or flattens probabilities, top-k keeps the k likeliest tokens, top-p keeps the smallest set reaching probability p.'],
    ['Why does the KV cache exist?','It stores keys and values of earlier tokens so each new token costs about N instead of N squared, at the price of memory.'],
    ['How can an MoE model have 235B parameters but 22B active?','A router picks a few experts per token, for example 8 of 128, so only those weights compute. Memory still holds all of them.'],
    ['Why does image generation need so many forward passes?','30 to 50 denoising steps, each with a prompt-conditioned and an unconditioned pass, so up to 100 passes.'],
    ['How do you tell compute bound from memory bound?','Compare arithmetic intensity with the hardware ops:byte ratio (about 295 for an H100 in FP16). Below it is memory bound.'],
    ['Which phase is which?','Prefill is compute bound and sets TTFT. Decode is memory bound and sets TPS. Image and video generation are compute bound.'],
    ['Name two ways to optimize attention.','Better implementations such as FlashAttention and PagedAttention, or new algorithms such as sliding window attention.']
  ]);
});
})();
