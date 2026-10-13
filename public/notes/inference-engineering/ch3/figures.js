(function(){
var N=window.Notes,$=N.$,fmt=N.fmt;

N.figure('gpu',function(){
  N.flow($('#gpu'),{cols:4,rowH:90,nodeH:60,particles:true,read:'#gpu-read',start:'tc',
    nodes:[
      {id:'vram',t:'VRAM',s:'HBM, gigabytes',c:0,r:0,kind:'warn',info:'High bandwidth DRAM holds the weights and KV cache. Its size caps the model and its bandwidth limits decode.'},
      {id:'l2',t:'L2 cache',s:'shared, tens of MB',c:1,r:0,info:'Global on-chip SRAM shared by all Streaming Multiprocessors. An H100 has 50 MB.'},
      {id:'l1',t:'L1 and L0',s:'per SM and core',c:2,r:0,info:'L1 is shared memory per SM (256 KB on an H100). L0 is the instruction cache of one Tensor Core.'},
      {id:'tc',t:'Tensor Cores',s:'matrix compute',c:3,r:0,kind:'acc',info:'Matrix multiply and accumulate units. Inference compute is measured here, in dense FLOPS at a given precision.'}],
    edges:[{a:'vram',b:'l2',kind:'w'},{a:'l2',b:'l1'},{a:'l1',b:'tc',kind:'a'}]});
});

N.figure('fit',function(){
  var gpus={h100:[80,3.35],h200:[141,4.8],b200:[192,8]};
  N.calc($('#fit-calc'),{
    inputs:[{k:'p',label:'Model parameters (billions)',min:1,max:700,step:1,value:70},
            {k:'b',label:'Precision',opts:[{l:'FP16',v:2},{l:'FP8',v:1},{l:'FP4',v:.5}],value:2},
            {k:'g',label:'GPU',opts:[{l:'H100',v:'h100'},{l:'H200',v:'h200'},{l:'B200',v:'b200'}],value:'h100'}],
    outputs:[{label:'Weights',fn:function(v){return v.p*v.b},fmt:function(v){return fmt.n(v)+' GB'}},
             {label:'With 50% headroom',fn:function(v){return v.p*v.b*1.5},fmt:function(v){return fmt.n(v)+' GB'},sub:'weights plus KV cache room'},
             {label:'GPUs needed',fn:function(v){return Math.ceil(v.p*v.b*1.5/gpus[v.g][0])},sub:'by memory only'},
             {label:'Decode ceiling, batch 1',fn:function(v){return gpus[v.g][1]*1000/(v.p*v.b)},fmt:function(v){return fmt.n(v)+' tok/s'},sub:'bandwidth divided by weights, per GPU'}],
    read:function(v,o){var n=o[2];return n>8?['More than a node','Needs '+n+' GPUs, so this model must span nodes with a slower interconnect.',true]:n>1?['Multi-GPU model','Needs '+n+' GPUs for memory, so NVLink bandwidth will matter.',false]:['Fits on one GPU','The weights plus headroom fit in one GPU. Halving precision halves the weight bytes, which also roughly doubles the decode ceiling.',false]}});
});

N.figure('gen',function(){
  var g=[['L4',242,24,300],['L40',362,48,864],['H100',1979,80,3350],['H200',1979,141,4800],['B200',5000,192,8000],['B300',5000,288,8000]];
  N.compare($('#gen-cmp'),{
    metrics:[{label:'FP8 dense compute'},{label:'Memory'},{label:'Bandwidth',kind:'w'}],initial:2,
    options:g.map(function(r){return{label:r[0],vals:[r[1]/5000,r[2]/288,r[3]/8000],text:[fmt.n(r[1])+(r[0][0]=='B'?'~':''),r[2]+' GB',fmt.n(r[3]/1000,2)+' TB/s'],
      h:r[0],p:{L4:'Cheap and convenient for small embedding and vision models.',L40:'Rarely the best choice. Fractional H100s give more compute and bandwidth for the same memory.',H100:'Widely used workhorse with mature software and kernels.',H200:'Same compute as H100 with more memory and bandwidth, so better decode throughput.',B200:'The new gold standard with FP4 support. Bandwidth is up to 8 TB/s.',B300:'Same compute class as B200 with 288 GB of memory.'}[r[0]]}})});
});

N.figure('link',function(){
  N.barchart($('#link-bars'),{read:'#link-read',max:1800,rows:[
    {label:'NVLink, Blackwell',value:1800,text:'1800',info:'GPU to GPU inside a node. NVSwitch gives all to all connectivity over NVLink.'},
    {label:'NVLink, Hopper',value:900,text:'900',info:'Same role on Hopper nodes. Lovelace GPUs have no NVLink at all.'},
    {label:'InfiniBand, per NIC',value:50,text:'50',kind:'w',info:'400 Gb/s is about 50 GB/s. The fastest node to node link, but an order of magnitude slower than NVLink.'},
    {label:'Ethernet, per NIC',value:12.5,text:'12.5',kind:'w',info:'100 Gb/s is about 12.5 GB/s. The common fallback between nodes.'}]});
  var h=$('#link-read');$('h4',h).textContent='Why it matters';$('p',h).textContent='Splitting a model across GPUs is cheap inside a node and expensive across nodes, so keep chatty parallelism inside the NVLink domain.';
});

N.figure('mig',function(){
  N.calc($('#mig-calc'),{
    inputs:[{k:'k',label:'Slices given to one instance',min:1,max:7,step:1,value:3}],
    outputs:[{label:'Compute share',fn:function(v){return v.k/7},fmt:fmt.pct,sub:'k of 7 slices'},
             {label:'Streaming multiprocessors',fn:function(v){return v.k*18},sub:'18 per slice, 132 total'},
             {label:'Idle SMs on the whole GPU',fn:function(){return 132-7*18},sub:'left over from uneven division'}],
    bars:[{label:'Compute',fn:function(v){return v.k/7},max:1,fmt:fmt.pct}],
    read:function(v){return v.k===3?['The book example','Three slices give about 3/7 of the compute and up to half of the VRAM, 40 GB, plus about half of the host CPU, memory, storage and network share.']:['One GPU, many small models','Slices let small models use a fraction of a new GPU instead of an old whole one. The memory share per slice depends on the profile you choose.']}});
});

N.figure('acc',function(){
  N.tabs($('#acc-tabs'),[
    {label:'Memory bandwidth',html:'<h4>Bet on decode speed</h4><p>Cerebras and Groq reach high tokens per second by serving decode from ultra-high-bandwidth memory, removing the memory bottleneck.</p>'},
    {label:'Power efficiency',html:'<h4>Bet on running cost</h4><p>Furiosa and Qualcomm design chips for low power draw, which makes operation cheaper.</p>'},
    {label:'Platform integration',html:'<h4>Bet on the cloud stack</h4><p>Amazon and Google build deep integration between their chips, cloud services and proprietary models.</p>'},
    {label:'Shared challenges',html:'<h4>What holds them back</h4><ul><li>Software: without CUDA each vendor rebuilds the whole inference stack.</li><li>Manufacturing: chips are the most complex objects humans build.</li><li>Distribution: chips must be installed and brought online to put capacity on the market.</li></ul>'}]);
});

N.figure('desk',function(){
  N.compare($('#desk-cmp'),{
    metrics:[{label:'Memory'},{label:'Bandwidth'},{label:'Cost',kind:'w'}],
    options:[{label:'RTX 5090 PC',vals:[32/512,1792/1792,.5],text:['32 GB','1,792 GB/s','$5,000'],h:'NVIDIA RTX 5090',p:'Fast memory but small. Great for models that fit in 32 GB.'},
             {label:'Apple M3 Ultra',vals:[1,819/1792,1],text:['512 GB','819 GB/s','$10,000'],h:'Apple M3 Ultra',p:'Unified memory is huge but slower, so large quantized models fit but decode more slowly.'}]});
});

N.figure('chapter-map',function(){
  N.mindmap($('#map-svg'),[
    ['3.1 GPU',['Tensor Cores: compute','VRAM size and bandwidth','Weights plus 50% headroom']],
    ['3.2 Generations',['Hopper: FP8','Lovelace: small models','Blackwell: FP4, new gold standard']],
    ['3.3 Instances',['Node of eight, NVLink','InfiniBand between nodes','MIG: up to seven slices']],
    ['3.4 Others',['Bandwidth, power, integration','Software moat is CUDA']],
    ['3.5 Local',['No latency, private, free','Hardware, heat, battery limits']]
  ],'Hardware');
});
N.figure('recall',function(){
  N.flashcards($('#fcs'),[
    ['Which compute unit matters for inference, and which FLOPS figure?','Tensor Cores, using dense FLOPS at the precision you will run. Sparse figures assume 2:4 sparsity.'],
    ['Which resource limits prefill, and which limits decode?','Prefill and image generation are limited by compute. Decode is limited by memory bandwidth at low to medium batch sizes.'],
    ['How much VRAM do you need for a model?','The weights plus at least 50 percent headroom for the KV cache, more for long context, big batches or video.'],
    ['What does a GPU name like B200 mean?','The letter is the architecture generation and the number identifies the model within it. Bigger means more powerful and costlier.'],
    ['What did Hopper and Blackwell add for inference?','Hopper added FP8. Blackwell added FP4 and microscaling formats like MXFP4 and NVFP4.'],
    ['What is the difference between NVLink and InfiniBand?','NVLink connects GPUs inside a node at up to 1800 GB/s on Blackwell. InfiniBand connects nodes at up to 400 Gb/s per NIC, an order of magnitude slower.'],
    ['What is MIG and why seven slices?','Multi-instance GPU splits a large GPU into up to seven fractional instances. An H100 has 132 SMs, which do not divide evenly, so some idle.'],
    ['Where do non-NVIDIA accelerators try to win?','Memory bandwidth, power efficiency and platform integration, but they all lack CUDA.'],
    ['What are the trade-offs of local inference?','Zero latency, offline use, privacy and no cost, against weak hardware, thermal limits, fragmented support and battery drain.']
  ]);
});
})();
