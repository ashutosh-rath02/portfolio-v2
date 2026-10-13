(function(){
var N=window.Notes,$=N.$,fmt=N.fmt;

N.figure('arch',function(){
  N.flow($('#arch'),{cols:5,rowH:110,nodeH:56,read:'#arch-read',start:'vlm',
    nodes:[
      {id:'vlm',t:'Vision language',s:'image to text',c:0,r:0,w:128,info:'A vision encoder turns images into tokens for an LLM. Autoregressive token generation.'},
      {id:'emb',t:'Embedding',s:'input to vector',c:1,r:0,w:128,info:'Encoder-only or LLM based models that output a fixed length vector. A transformer, but no token by token generation.'},
      {id:'asr',t:'ASR',s:'audio to text',c:2,r:0,w:128,info:'Encoder-decoder such as Whisper. Most time is in the autoregressive decoder.'},
      {id:'tts',t:'TTS',s:'text to audio',c:3,r:0,w:128,info:'A fine-tuned LLM that generates audio tokens, then a decoder makes a waveform.'},
      {id:'gen',t:'Image and video',s:'iterative denoising',c:4,r:0,w:128,kind:'warn',info:'Start from noise and refine over about 30 to 50 steps. Compute bound, with different tooling than LLMs.'},
      {id:'tok',t:'Autoregressive and encoder transformers',s:'LLM tools mostly apply',c:1.5,r:1,w:380,kind:'acc',info:'Engines like vLLM, SGLang and TensorRT-LLM carry over, along with quantization, caching and parallelism.'},
      {id:'den',t:'Denoising',s:'its own toolbox',c:4,r:1,w:128,kind:'warn',info:'Kernel selection, fusion, compilation, guidance tricks and context parallelism.'}],
    edges:[{a:'vlm',b:'tok'},{a:'emb',b:'tok'},{a:'asr',b:'tok'},{a:'tts',b:'tok'},{a:'gen',b:'den',kind:'w'}]});
});

N.figure('img',function(){
  N.calc($('#img-calc'),{
    inputs:[{k:'n',label:'Images in the request',min:1,max:20,step:1,value:3},{k:'r',label:'Resolution',opts:[{l:'High, 1,000 tokens each',v:1000},{l:'Downsampled, about 250 each',v:250}],value:1000}],
    outputs:[{label:'Visual tokens',fn:function(v){return v.n*v.r}},{label:'Text prompt (assumed)',fn:function(){return 500},sub:'for comparison'}],
    bars:[{label:'Image share',fn:function(v){return v.n*v.r/(v.n*v.r+500)},max:1,fmt:fmt.pct,kind:'w'}],
    read:function(v){var t=v.n*v.r;return t>10000?['The image dominates the sequence','Over '+fmt.n(t)+' visual tokens means a long prefill and a big KV cache. Consider downsampling, prefix caching for repeated images, and KV quantization.',true]:['Manageable','Still far longer than the text prompt alone, so prefill and cache costs are mostly from the images.']}});
});

N.figure('vt',function(){
  N.tabs($('#vt-tabs'),[
    {label:'Quantization',html:'<h4>KV cache quantization</h4><p>Cuts memory bandwidth and storage overhead for longer sequences.</p>'},
    {label:'Speculation',html:'<h4>Same decode as an LLM</h4><p>Decode matches LLM decode, so speculation works, especially EAGLE.</p>'},
    {label:'Prefix caching',html:'<h4>Reuse image KV</h4><p>Reuse the cache for images in multi-turn chats and repeated queries.</p>'},
    {label:'Parallelism',html:'<h4>Tensor parallelism</h4><p>Faster inference with access to more VRAM for large models and long contexts.</p>'},
    {label:'Disaggregation',html:'<h4>Specialized prefill</h4><p>Move prefill to workers that scale independently to handle long sequences.</p>'}]);
});

N.figure('vid',function(){
  N.calc($('#vid-calc'),{
    inputs:[{k:'s',label:'Clip length (seconds)',min:1,max:10,step:1,value:4},{k:'f',label:'Frames per second used',opts:[{l:'24',v:24},{l:'8',v:8},{l:'2',v:2}],value:24}],
    outputs:[{label:'Frames',fn:function(v){return v.s*v.f}},{label:'Naive tokens',fn:function(v){return v.s*v.f*1000},sub:'1,000 per frame, no downsampling'}],
    bars:[{label:'Naive tokens',fn:function(v){return v.s*v.f*1000},max:240000,kind:'w',fmt:function(x){return fmt.n(x/1000)+'K'}}],
    read:function(v){return v.s===4&&v.f===24?['The book example','Four seconds at 24 frames per second is nearly 100,000 tokens, which is why downsampling is practically obligatory.',true]:['Frames drive the cost','Lowering resolution and frame rate is what lets a whole clip fit in one request, and video models still only accept very short clips.']}});
});

N.figure('emb',function(){
  N.compare($('#emb-cmp'),{
    metrics:[{label:'Throughput focus'},{label:'Latency focus',kind:'w'},{label:'Queueing need'}],
    options:[{label:'Backfill',vals:[1,.15,1],text:['high','low','essential'],h:'High-throughput backfills',p:'Indexing millions of documents, updating catalogs or preparing pretraining data. Maximize batch size and use a robust queue.'},
             {label:'Lookup',vals:[.3,1,.3],text:['moderate','high','light'],h:'Low-latency lookups',p:'User facing search, retrieval or recommendation where every millisecond counts.'}]});
});

N.figure('dim',function(){
  N.calc($('#dim-calc'),{
    inputs:[{k:'m',label:'Vectors stored (millions)',min:1,max:1000,step:1,value:100},{k:'d',label:'Dimensions',opts:[{l:'256',v:256},{l:'1,024',v:1024},{l:'4,096',v:4096}],value:1024}],
    outputs:[{label:'Raw storage',fn:function(v){return v.m*1e6*v.d*4/1e9},fmt:function(x){return fmt.n(x)+' GB'},sub:'4 bytes per value'},{label:'Inference time effect',fn:function(){return 0},fmt:function(){return 'little'},sub:'mostly storage and retrieval'}],
    bars:[{label:'Storage',fn:function(v){return v.m*1e6*v.d*4/1e9},max:16400,kind:'w',fmt:function(x){return fmt.n(x)+' GB'}}],
    read:function(v){return ['Dimensionality is a downstream cost','Longer vectors keep more information but multiply storage and similarity compute. Matryoshka models let you truncate with less quality loss.']}});
});

N.figure('rtf',function(){
  N.calc($('#rtf-calc'),{
    inputs:[{k:'g',label:'GPUs (or MIGs) transcribing chunks',min:1,max:16,step:1,value:8},{k:'m',label:'Audio length (minutes)',min:5,max:180,step:5,value:60}],
    outputs:[{label:'Real-time factor',fn:function(v){return v.g*125},fmt:function(x){return fmt.n(x)+'x'},sub:'about linear in GPUs'},{label:'Time to transcribe',fn:function(v){return v.m*60/(v.g*125)},fmt:function(x){return fmt.n(x,1)+' s'}}],
    bars:[{label:'RTF',fn:function(v){return v.g*125},max:2000,fmt:function(x){return fmt.n(x)+'x'}}],
    read:function(v){return v.g===8&&v.m===60?['The book example','An hour of audio in under four seconds is an RTF of about 1000x, reached by parallel chunks over several GPUs with in-flight batching.']:['Linear scaling','The per-GPU rate here is assumed. What the book states is that RTF improves roughly linearly with more GPUs.']}});
});

N.figure('asrflow',function(){
  N.flow($('#asrflow'),{cols:4,rowH:90,nodeH:60,particles:true,read:'#asrflow-read',start:'vad',play:['vad','chunk','asr','stitch'],playBtn:'#asrflow-play',
    nodes:[
      {id:'vad',t:'VAD',s:'dedicated hardware',c:0,r:0,info:'Voice activity detection removes silence and finds speech boundaries, so words are not cut in half.'},
      {id:'chunk',t:'Chunks',s:'speech segments',c:1,r:0,info:'Meaningful segments, each within the 30 second Whisper limit.'},
      {id:'asr',t:'Parallel ASR',s:'many GPUs or MIGs',c:2,r:0,kind:'acc',info:'Chunks run in parallel with in-flight batching. Bad chunks are re-run at a higher temperature or re-chunked smaller.'},
      {id:'stitch',t:'Stitch',s:'by timestamp',c:3,r:0,info:'Chunk transcripts are joined back in order using timestamps.'}],
    edges:[{a:'vad',b:'chunk'},{a:'chunk',b:'asr',kind:'a'},{a:'asr',b:'stitch',kind:'a'}]});
});

N.figure('ttsflow',function(){
  N.flow($('#ttsflow'),{cols:4,rowH:90,nodeH:60,particles:true,read:'#ttsflow-read',start:'llm',
    nodes:[
      {id:'txt',t:'Text',s:'input',c:0,r:0,info:'The text to speak.'},
      {id:'llm',t:'LLM backbone',s:'audio tokens',c:1,r:0,kind:'acc',info:'A fine-tuned LLM with a vocabulary extended by tens of thousands of audio tokens. FP8 weights and KV cache, TensorRT-LLM and in-flight batching all apply.'},
      {id:'dec',t:'Audio decoder',s:'compiled, 15 ms batching',c:2,r:0,kind:'warn',info:'Turns audio tokens into a waveform. Use PyTorch compiled for the target GPU and dynamic batching with a short timeout. In-flight batching is not possible, so watch it as a bottleneck.'},
      {id:'wav',t:'Waveform',s:'streamed out',c:3,r:0,info:'Streamed over a WebSocket so playback starts as soon as the first sentence is ready.'}],
    edges:[{a:'txt',b:'llm'},{a:'llm',b:'dec',kind:'a'},{a:'dec',b:'wav',kind:'a'}]});
});

N.figure('streams',function(){
  N.calc($('#streams-calc'),{
    inputs:[{k:'t',label:'GPU capacity (tokens per second, total)',min:500,max:20000,step:500,value:6000},{k:'r',label:'Tokens needed per real-time stream',min:80,max:100,step:5,value:90}],
    outputs:[{label:'Concurrent streams',fn:function(v){return Math.floor(v.t/v.r)}},{label:'Relative cost per stream',fn:function(v){return 6000/90/Math.floor(v.t/v.r)},fmt:function(x){return fmt.n(x,2)+'x'},sub:'versus the default setting'}],
    bars:[{label:'Streams',fn:function(v){return Math.floor(v.t/v.r)},max:250}],
    read:function(){return ['Throughput is the lever','Once a stream gets its 80 to 100 tokens per second, extra speed per stream is wasted. More concurrent streams per GPU is what lowers cost per user.']}});
});

N.figure('s2s',function(){
  N.compare($('#s2s-cmp'),{
    metrics:[{label:'Capability'},{label:'Cost',kind:'w'},{label:'Pipeline complexity',kind:'w'}],
    options:[{label:'Cascade',vals:[1,.5,1],text:['higher','lower','high'],h:'ASR, LLM and TTS pipeline',p:'More capable and cheaper today, with open models available. Needs VAD and helper models and careful orchestration.'},
             {label:'Speech-to-speech',vals:[.6,1,.3],text:['lower','higher','low'],h:'Unified model such as gpt-realtime',p:'Merges the stages into one model. At publication there is no commercially viable open option, and closed ones trail cascades. Research is active.'}]});
});

N.figure('ik',function(){
  N.tabs($('#ik-tabs'),[
    {label:'SGLang Diffusion',html:'<h4>Engine for popular architectures</h4><p>Quick to adopt. Offers a pipeline abstraction, diffusion-specific parallelism, and reuses the main SGLang scheduler and kernels.</p>'},
    {label:'TensorRT',html:'<h4>Black box, fast</h4><p>High-quality implementations of popular models using NVIDIA in-house kernels. Works well and works now.</p>'},
    {label:'PyTorch',html:'<h4>Control</h4><p>Careful kernel selection and fusion gives flexibility and the best ceiling for advanced engineers who want deep customization.</p>'}]);
});

N.figure('guid',function(){
  N.calc($('#guid-calc'),{
    inputs:[{k:'s',label:'Late steps with guidance off (of 50)',min:0,max:40,step:1,value:20}],
    outputs:[{label:'Denoiser passes',fn:function(v){return 100-v.s}},{label:'Saved',fn:function(v){return v.s/100},fmt:fmt.pct,sub:'versus 100 passes'}],
    bars:[{label:'Passes',fn:function(v){return 100-v.s},max:100,kind:'w'}],
    read:function(v){return v.s===20?['The book example','Skipping guidance for the last 20 of 50 steps leaves 80 passes, and quality generally stays high because the outline is already set.']:v.s>30?['Getting aggressive','Guidance steers prompt adherence mostly in the early steps, so cutting very many risks drifting from the prompt. Check outputs.',true]:['Free speedup','Late steps only add detail, so removing the unconditioned pass there saves work without reducing step count.']}});
});

N.figure('amd',function(){
  N.calc($('#amd-calc'),{
    inputs:[{k:'a',label:'Attention share of compute time (%)',min:70,max:80,step:1,value:75},{k:'x',label:'Attention speedup',min:1,max:4,step:.1,value:2,fmt:function(v){return fmt.n(v,1)+'x'}}],
    outputs:[{label:'Overall speedup',fn:function(v){var a=v.a/100;return 1/((1-a)+a/v.x)},fmt:function(x){return fmt.n(x,2)+'x'}},{label:'Overall time saved',fn:function(v){var a=v.a/100;return 1-((1-a)+a/v.x)},fmt:fmt.pct}],
    bars:[{label:'Speedup',fn:function(v){var a=v.a/100;return 1/((1-a)+a/v.x)},max:4,fmt:function(x){return fmt.n(x,2)+'x'}}],
    read:function(){return ['Optimize where the time is','Because attention is 70 to 80 percent of the time, a faster attention kernel moves the total far more than speeding up anything else.']}});
});

N.figure('vq',function(){
  N.tabs($('#vq-tabs'),[
    {label:'Caching',html:'<h4>Reuse model outputs</h4><p>Timestep-based caching reuses outputs of certain steps to skip whole steps. Transformer-based caching reuses hidden states to skip layers. Can speed generation by 30 to 40 percent, with quality from negligible loss to unusable.</p>'},
    {label:'Blockwise MXFP8',html:'<h4>Preserve outliers</h4><p>Blockwise quantization with a microscaling format keeps outlier values that matter for attention accuracy. Available on Hopper and Blackwell.</p>'},
    {label:'By step',html:'<h4>Early steps stay precise</h4><p>Keep early steps in FP16 and quantize later ones, because early steps set the outline and prompt adherence.</p>'},
    {label:'By layer',html:'<h4>Protect first and last</h4><p>Keep the first and last layers in full precision and quantize hidden layers, which only do intermediate work. SageAttention is an 8-bit attention kernel that applies these ideas.</p>'}]);
});

N.figure('cp',function(){
  N.compare($('#cp-cmp'),{
    metrics:[{label:'Weights per GPU'},{label:'Splits'},{label:'Memory need',kind:'w'}],
    options:[{label:'Context parallel',vals:[1,.5,1],text:['full copy','attention','high'],h:'Context parallelism',p:'Copy the weights to every GPU and split the attention calculation, for example with ring attention, where each GPU passes intermediate results around a ring. Fits video models, which are small enough to replicate on a B200.'},
             {label:'Tensor parallel',vals:[.125,1,.3],text:['one eighth','weights','lower'],h:'Tensor parallelism',p:'Split each layer across GPUs. The usual choice for LLMs, but video models are small and their bottleneck is attention over a huge sequence, not weight size.'}]});
});

N.figure('chapter-map',function(){
  N.mindmap($('#map-svg'),[
    ['6.1 VLMs',['Image tokens add up','Downsample for video','Techniques carry over']],
    ['6.2 Embeddings',['Backfill or lookup','FP8, cosine over 99%','One replica per GPU']],
    ['6.3 ASR',['Whisper encoder-decoder','Stream with VAD','Parallel chunks, RTF']],
    ['6.4 TTS',['LLM plus audio decoder','TTFB and streams','Cascade beats unified']],
    ['6.5 Images',['Compute bound','Kernels, fusion, compile','Skip late guidance']],
    ['6.6 Video',['Attention is 70 to 80%','Cache, quantize by step','Context parallelism']]
  ],'Modalities');
});
N.figure('recall',function(){
  N.flashcards($('#fcs'),[
    ['What are the two archetypes of generative models?','Autoregressive token generation and iterative denoising.'],
    ['Why do VLMs stress prefill and the KV cache?','Each high-resolution image adds about 1,000 tokens, so inputs and caches are much longer.'],
    ['What is the speed and quality trade in VLMs?','Downsampling. A high-resolution image costs about four times the tokens of a low-resolution one.'],
    ['What are the two embedding workloads?','High-throughput backfills and low-latency lookups. Build separate systems if you need both at scale.'],
    ['How do you check an embedding model after quantizing?','Compare output vectors from original and quantized models by cosine similarity, aiming for at least 99 percent.'],
    ['Why does streaming ASR need VAD?','A voice activity model segments the live audio stream into chunks that the ASR model transcribes.'],
    ['What is real-time factor?','Audio length divided by processing time. An hour in four seconds is about 1000x.'],
    ['What are the TTS latency metrics?','Time to first byte, time to first sentence, and tokens per second, where real-time needs only about 80 to 100 per stream.'],
    ['What is the one weird trick for image generation?','Turn off guidance for the last steps, since the outline is set early, saving passes without cutting steps.'],
    ['Why is video generation limited to batch size one?','It is compute bound, so batching does not help, and each request uses a full eight GPU node.'],
    ['How does context parallelism differ from tensor parallelism?','It replicates weights and splits attention across GPUs, for example with ring attention.']
  ]);
});
})();
