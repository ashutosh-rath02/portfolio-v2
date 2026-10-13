(function(){
var N=window.Notes,$=N.$,fmt=N.fmt;

N.figure('stack',function(){
  N.flow($('#stack'),{cols:1,rowH:78,nodeH:56,read:'#stack-read',start:'eng',
    nodes:[
      {id:'dyn',t:'NVIDIA Dynamo',s:'orchestration at scale',c:0,r:0,w:440,info:'Sits on top of engines to run large deployments: KV aware routing, disaggregation and multi-node parallelism.'},
      {id:'eng',t:'Inference engines',s:'vLLM, SGLang, TensorRT-LLM',c:0,r:1,w:440,kind:'acc',info:'Pre-optimized, configurable servers. Most inference engineering happens at this level, testing combinations of techniques.'},
      {id:'fw',t:'Frameworks',s:'PyTorch, safetensors, ONNX',c:0,r:2,w:440,info:'PyTorch describes tensor operations for training and inference. torch.compile targets a GPU and selects and fuses kernels.'},
      {id:'cuda',t:'CUDA and kernels',s:'cuBLAS, CUTLASS, FlashAttention',c:0,r:3,w:440,info:'The programming platform for NVIDIA GPUs. Kernels are functions that run in parallel across thousands of threads.'},
      {id:'gpu',t:'GPU hardware',s:'SMs, Tensor Cores, VRAM',c:0,r:4,w:440,kind:'warn',info:'The silicon from chapter 3. Kernels are tuned to specifics of each GPU generation.'}],
    edges:[{a:'gpu',b:'cuda',kind:'a'},{a:'cuda',b:'fw',kind:'a'},{a:'fw',b:'eng',kind:'a'},{a:'eng',b:'dyn',kind:'a'}]});
});

N.figure('kern',function(){
  N.tabs($('#kern-tabs'),[
    {label:'cuBLAS',html:'<h4>Prebuilt linear algebra</h4><p>The CUDA version of BLAS, a specification from the 1970s. It supplies ready kernels for operations like GEMM, general matrix-matrix multiplication, which every linear layer uses.</p>'},
    {label:'cuDNN',html:'<h4>Neural network primitives</h4><p>CUDA Deep Neural Network library, with building blocks for network operations.</p>'},
    {label:'CUTLASS and CuTe',html:'<h4>Templates for custom kernels</h4><p>CUTLASS gives building blocks for high-performance kernels, and FlashAttention 3 uses it. CuTe adds abstractions for tiled tensor operations on recent architectures.</p>'},
    {label:'FlashInfer',html:'<h4>LLM kernel library</h4><p>High-performance kernels for LLM inference, including optimized attention kernels and fused sampling functions.</p>'},
    {label:'DeepGEMM',html:'<h4>A swap-in example</h4><p>DeepSeek released it with an updated V3 for FP8 matrix multiplication on Hopper. You can plug it in for specific matrix shapes, but must check compatibility when changing GPU generation.</p>'}]);
});

N.figure('fuse',function(){
  N.compare($('#fuse-cmp'),{
    metrics:[{label:'Memory reads'},{label:'Memory writes',kind:'w'},{label:'Kernels'}],
    options:[{label:'Two kernels',vals:[1,1,1],text:['2','2','2'],h:'Separate multiply_by_2 and multiply_by_3',p:'Read [1,2,3], multiply by 2, write [2,4,6], read it back, multiply by 3, write [6,12,18]. The middle write and read are wasted.'},
             {label:'Fused kernel',vals:[.5,.5,.5],text:['1','1','1'],h:'One multiply_by_6 kernel',p:'Read [1,2,3], multiply by 6, write [6,12,18]. Half the memory traffic, which matters in bandwidth bound decode.'}]});
});

N.figure('fw',function(){
  N.tabs($('#fw-tabs'),[
    {label:'PyTorch',html:'<h4>The standard</h4><p>A Python package for tensor operations, created at Meta and now part of the Linux Foundation. You write fast code in Python and can drop into CUDA with custom kernels. torch.compile targets one GPU and does automatic kernel selection and fusion, but cannot fuse plugin kernels like FlashAttention, so it helps most with rare architectures and long chains of small kernels.</p>'},
    {label:'Safetensors',html:'<h4>Weight format</h4><p>The dominant format, from Hugging Face. It stores only tensors, so unlike general formats it cannot run code when loaded, and models are split across dozens of files that are memory mapped for fast, safe loading.</p>'},
    {label:'ONNX',html:'<h4>Weights plus graph</h4><p>Bundles weights with the execution graph, so it is portable across hardware. ONNX Runtime is an open community standard that runs on many GPUs. TensorRT is NVIDIA only and compiles ONNX into an optimized engine, and is strong for image and video models. Exporting struggles with unusual operations such as multi-latent attention.</p>'},
    {label:'Transformers and Diffusers',html:'<h4>Reference code</h4><p>Hugging Face libraries on PyTorch. They are not built for production serving but give reference implementations, config.json details and download utilities. For production, write compiled PyTorch or use an engine.</p>'}]);
});

N.figure('eng',function(){
  N.compare($('#eng-cmp'),{
    metrics:[{label:'Performance'},{label:'Ease of use'},{label:'Model support'},{label:'Hardware breadth'}],
    options:[
      {label:'vLLM',vals:[.7,1,1,1],text:['Good','Easy','Most','GPU, TPU'],h:'vLLM',p:'Largest market share, the oldest (summer 2023) and hosted by the PyTorch Foundation project. Broadest hardware support: NVIDIA, AMD, Intel GPUs and Google TPUs. Apache 2.0.'},
      {label:'SGLang',vals:[.7,1,1,.6],text:['Good','Easy','Most','NVIDIA, AMD'],h:'SGLang',p:'Released December 2023, strong with DeepSeek, Qwen and Kimi, and the engine at xAI. Fast backend with a flexible frontend language. Apache 2.0.'},
      {label:'TensorRT-LLM',vals:[1,.3,.55,.3],text:['Best','Hard','Some','NVIDIA only'],h:'TensorRT-LLM',p:'NVIDIA open source engine with the best performance thanks to NVIDIA written and closed kernels. Version 1.x is a standalone PyTorch based package, while 0.x plugs into TensorRT. Always check which version you run.'}]});
});

N.figure('use',function(){
  N.tabs($('#use-tabs'),[
    {label:'vLLM',html:'<h4>Use vLLM when</h4><ul><li>You want a model server up quickly with solid performance for almost any open model.</li><li>You are running an Omni model with several input and output modalities.</li><li>You use a smaller or older GPU where TensorRT-LLM offers little.</li></ul>'},
    {label:'SGLang',html:'<h4>Use SGLang when</h4><ul><li>You want great throughput with decent latency on large MoE models like DeepSeek and Kimi.</li><li>You want an engine experience for image and video generation, through SGLang Diffusion.</li><li>You want control and customization and want to join the community.</li></ul>'},
    {label:'TensorRT-LLM',html:'<h4>Use TensorRT-LLM when</h4><ul><li>The model architecture is well supported and the GPU is Hopper or newer.</li><li>You will do extra engineering work for the best performance.</li><li>You plan to serve with Dynamo and want the deepest integration.</li></ul>'}]);
});

N.figure('dyn',function(){
  N.flow($('#dyn'),{cols:4,rowH:120,nodeH:62,particles:true,read:'#dyn-read',start:'router',play:['req','router','pre','dec','plan'],playBtn:'#dyn-play',
    nodes:[
      {id:'req',t:'Request',s:'prompt arrives',c:0,r:0,info:'A user request enters the system.'},
      {id:'router',t:'KV aware router',s:'prefix match',c:1,r:0,kind:'acc',info:'Sends the request to a worker that already holds a matching prefix in its KV cache, so less prefill work is repeated.'},
      {id:'pre',t:'Prefill workers',s:'compute bound',c:2,r:0,info:'Engines tuned for the compute bound prompt phase, scaled independently.'},
      {id:'dec',t:'Decode workers',s:'memory bound',c:3,r:0,kind:'warn',info:'Engines tuned for memory bound token generation. The KV cache moves from prefill to decode.'},
      {id:'plan',t:'SLA planner',s:'TTFT and TPS targets',c:2,r:1,info:'Scales prefill and decode workers up and down to meet user defined TTFT and TPS constraints as traffic changes.'}],
    edges:[{a:'req',b:'router'},{a:'router',b:'pre',kind:'a'},{a:'pre',b:'dec',kind:'w',label:'KV'},{a:'plan',b:'pre'},{a:'plan',b:'dec'}]});
});

N.figure('dim',function(){
  N.tabs($('#dim-tabs'),[
    {label:'Sequence lengths',html:'<h4>Input and output length</h4><p>TTFT and memory depend on the number of tokens in the prompt (ISL) and response (OSL).</p>'},
    {label:'Traffic',html:'<h4>Volume and pattern</h4><p>Batching and server load depend on concurrent requests. Add jitter to mimic real usage.</p>'},
    {label:'Contents',html:'<h4>Request contents</h4><p>The actual prompts change cache hit rate and draft token acceptance, so use realistic ones.</p>'},
    {label:'Parameters',html:'<h4>Input parameters</h4><p>Temperature, reasoning effort and similar settings should match what you expect in production.</p>'}]);
});

N.figure('loop',function(){
  N.flow($('#loop'),{cols:4,rowH:100,nodeH:60,read:'#loop-read',start:'bench',particles:true,extra:30,
    nodes:[
      {id:'base',t:'Baseline',s:'before any change',c:0,r:0,info:'Measure the current system with a realistic benchmark so every later change has something to beat.'},
      {id:'chg',t:'Change one thing',s:'single variable',c:1,r:0,info:'Alter a single optimization or traffic setting, so the effect is clear.'},
      {id:'bench',t:'Benchmark',s:'how it performs',c:2,r:0,kind:'acc',info:'Repeat runs and compare to the baseline. If the result is surprising, profile to find out why.'},
      {id:'ship',t:'Deploy',s:'with confidence',c:3,r:0,info:'Once benchmarks and eval spot checks confirm gains without quality loss, ship the change.'}],
    edges:[{a:'base',b:'chg'},{a:'chg',b:'bench',kind:'a'},{a:'bench',b:'ship',kind:'a'}]});
});

N.figure('chapter-map',function(){
  N.mindmap($('#map-svg'),[
    ['4.1 CUDA',['Kernels do the work','Select, do not write','Fusion saves memory trips']],
    ['4.2 Frameworks',['PyTorch standard','Safetensors, ONNX','Compile targets a GPU']],
    ['4.3 Engines',['vLLM: broad','SGLang: MoE, diffusion','TensorRT-LLM: fastest']],
    ['4.4 Dynamo',['KV aware routing','Disaggregation, planner','Only at real scale']],
    ['4.5 Benchmarks',['Shadow or simulate traffic','One change at a time','Profile to learn why']]
  ],'Software');
});
N.figure('recall',function(){
  N.flashcards($('#fcs'),[
    ['What is a CUDA kernel?','A function that runs parallel work on the GPU, specified in a language like C++ and compiled for the GPU.'],
    ['Why is kernel fusion useful?','It merges kernels so intermediate results skip a write and read through memory, saving bandwidth, which matters in decode.'],
    ['What does torch.compile do and not do?','It targets a GPU with automatic kernel selection and fusion, but cannot fuse plugin kernels like FlashAttention or DeepGEMM.'],
    ['Why is safetensors the standard weight format?','It holds only tensor data so it cannot run code at load, and memory mapping across many files makes loading fast.'],
    ['How do ONNX Runtime and TensorRT differ?','ONNX Runtime is an open standard on many GPUs. TensorRT is NVIDIA only and compiles models into optimized engines.'],
    ['How do vLLM, SGLang and TensorRT-LLM compare?','vLLM and SGLang are easy with broad model support, TensorRT-LLM is hardest but usually fastest and NVIDIA only.'],
    ['What does Dynamo add and when is it worth it?','KV aware routing, disaggregation and multi-node parallelism over engines. Worth it with large models and heavy traffic, otherwise use engines directly.'],
    ['What makes a benchmark realistic?','Match sequence lengths, traffic pattern, request contents and input parameters, ideally by shadowing production traffic.'],
    ['Benchmarking versus profiling?','Benchmarking shows how the system performs. Profiling shows why, by showing where time and memory went.']
  ]);
});
})();
