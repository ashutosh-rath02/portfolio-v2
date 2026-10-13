(function(){
var N=window.Notes,$=N.$,fmt=N.fmt,clamp=N.clamp;

N.figure('path',function(){
  N.flow($('#path'),{cols:4,rowH:120,nodeH:62,particles:true,read:'#path-read',start:'q',play:['client','glb','q','rep'],playBtn:'#path-play',
    nodes:[
      {id:'client',t:'Client',s:'browser, agent, app',c:0,r:0,info:'Reuses sessions, may stream, and can go async for bulk work. Client code adds latency too.'},
      {id:'glb',t:'Global balancer',s:'nearest healthy region',c:1,r:0,info:'Geo-aware: avoids queues where spare capacity exists, but not at the cost of crossing oceans. Fails over between clouds.'},
      {id:'q',t:'Queue and router',s:'holds and places',c:2,r:0,kind:'acc',info:'The router picks the best replica using cache and LoRA awareness. The queue holds excess requests while scaling happens.'},
      {id:'rep',t:'Replicas',s:'containers on GPUs',c:3,r:0,kind:'warn',info:'Containerized engines with continuous batching, sized by a concurrency target.'},
      {id:'auto',t:'Autoscaler',s:'traffic and utilization',c:3,r:1,info:'Adds or removes replicas between min and max using traffic, which leads, and utilization, which lags.'}],
    edges:[{a:'client',b:'glb'},{a:'glb',b:'q',kind:'a'},{a:'q',b:'rep',kind:'a'},{a:'auto',b:'rep'}]});
});

N.figure('layers',function(){
  N.flow($('#layers'),{cols:1,rowH:84,nodeH:60,read:'#layers-read',start:'app',
    nodes:[
      {id:'ctr',t:'Container layer',s:'thin, ephemeral, writable',c:0,r:0,w:440,kind:'warn',info:'Created at runtime. Anything written here is lost when the container ends.'},
      {id:'app',t:'Additional layers',s:'dependencies, code, config',c:0,r:1,w:440,kind:'acc',info:'Filesystem changes from Dockerfile steps: Python packages, the inference engine, application code and configuration.'},
      {id:'base',t:'Base image',s:'OS or an engine image',c:0,r:2,w:440,info:'An operating system such as Ubuntu or a richer image from a registry, itself made of layers. vLLM and SGLang publish official ones.'}],
    edges:[{a:'base',b:'app',kind:'a'},{a:'app',b:'ctr',kind:'a'}]});
});

N.figure('dep',function(){
  N.tabs($('#dep-tabs'),[
    {label:'What it holds',html:'<h4>A known good stack</h4><ul><li>CUDA toolkit, cuDNN and driver versions compatible with the rest.</li><li>Python packages such as torch, transformers and diffusers.</li><li>The inference engine version: vLLM, SGLang, TensorRT-LLM or another.</li><li>System packages such as ffmpeg for audio, image and video models.</li></ul><p>Images are built for a specific GPU architecture and model.</p>'},
    {label:'Pack light',html:'<h4>Only what is needed</h4><p>Inference images are often many gigabytes. Including only strictly necessary dependencies speeds deployment and operation.</p>'},
    {label:'Pin versions',html:'<h4>Repeatable builds</h4><p>Pin every dependency. Tools like uv, poetry and pip flag incompatibilities at build time, and once an image builds it keeps resolving to the same versions, which protects against breaking changes.</p>'},
    {label:'New models',html:'<h4>Day-zero support is rough</h4><p>When a model like DeepSeek launches, the ecosystem races to support it, and builds often use nightly or pre-release dependencies. Rebuild on stable releases in the following days and weeks.</p>'}]);
});

N.figure('auto',function(){
  N.calc($('#auto-calc'),{
    inputs:[{k:'t',label:'Concurrent requests',min:0,max:400,step:5,value:120},
            {k:'c',label:'Concurrency target per replica',min:1,max:64,step:1,value:16},
            {k:'lo',label:'Min replicas',min:0,max:5,step:1,value:1},
            {k:'hi',label:'Max replicas',min:5,max:40,step:1,value:6}],
    outputs:[{label:'Replicas needed',fn:function(v){return Math.ceil(v.t/v.c)}},
             {label:'Replicas running',fn:function(v){return clamp(Math.ceil(v.t/v.c),v.lo,v.hi)}},
             {label:'Requests waiting',fn:function(v){var r=clamp(Math.ceil(v.t/v.c),v.lo,v.hi);return Math.max(0,v.t-r*v.c)},sub:'held in the queue'}],
    bars:[{label:'Utilization',fn:function(v){var r=clamp(Math.ceil(v.t/v.c),v.lo,v.hi);return r?Math.min(v.t,r*v.c)/(r*v.c):0},max:1,fmt:fmt.pct}],
    read:function(v,o){return o[2]>0?['At the ceiling','Max replicas is reached, so requests queue and latency suffers. Raise the maximum, or check that the queue feeds new replicas the moment they come online.',true]:o[0]<v.lo?['Paying for the floor','Traffic needs fewer replicas than the minimum, so idle GPUs are being paid for. That buys fast response at a cost.',false]:['Matched','Replica count follows traffic. A scale down delay keeps it from dropping too eagerly on spiky load.',false]}});
});

N.figure('batch',function(){
  N.compare($('#batch-cmp'),{
    metrics:[{label:'Early request wait',kind:'w'},{label:'GPU utilization'},{label:'Latency for users',kind:'w'}],initial:2,
    options:[{label:'Static',vals:[1,.5,1],text:['long','medium','worst'],h:'Static batching',p:'The server waits for a full batch. Early requests wait the longest before inference begins.'},
             {label:'Dynamic',vals:[.5,.7,.5],text:['bounded','good','better'],h:'Dynamic batching',p:'Waits until the batch is full or a configured time passes, which caps the wait.'},
             {label:'Continuous',vals:[.15,1,.25],text:['minimal','best','best'],h:'Continuous batching',p:'Requests join and leave at the token level as slots free up. vLLM, SGLang and TensorRT-LLM (called in-flight batching) all do this.'}]});
});

N.figure('cold',function(){
  var parts=function(v){return [v.p,v.i,v.g/v.b,v.e]};
  N.calc($('#cold-calc'),{
    inputs:[{k:'p',label:'GPU procurement (s)',min:0,max:300,step:5,value:60},
            {k:'i',label:'Image loading (s)',min:0,max:120,step:5,value:30},
            {k:'g',label:'Model size (GB)',min:1,max:800,step:1,value:140},
            {k:'b',label:'Weight bandwidth (GB/s)',min:.5,max:20,step:.5,value:2,fmt:function(v){return fmt.n(v,1)}},
            {k:'e',label:'Engine startup and compile (s)',min:5,max:600,step:5,value:90}],
    outputs:[{label:'Cold start',fn:function(v){return parts(v).reduce(function(a,b){return a+b},0)},fmt:function(x){return fmt.n(x)+' s'}},
             {label:'Weight loading',fn:function(v){return v.g/v.b},fmt:function(x){return fmt.n(x)+' s'},sub:'size divided by bandwidth'}],
    bars:[{label:'Procurement',fn:function(v){return v.p},max:400,fmt:function(x){return fmt.n(x)+' s'}},
          {label:'Image',fn:function(v){return v.i},max:400,fmt:function(x){return fmt.n(x)+' s'}},
          {label:'Weights',fn:function(v){return v.g/v.b},max:400,kind:'w',fmt:function(x){return fmt.n(x)+' s'}},
          {label:'Engine',fn:function(v){return v.e},max:400,fmt:function(x){return fmt.n(x)+' s'}}],
    read:function(v){var w=v.g/v.b,p=parts(v),m=Math.max.apply(null,p);return [w===m?'Weights dominate':'Biggest piece: '+['procurement','image','weights','engine'][p.indexOf(m)],'Quantizing the weights shrinks the file, and loading from storage near the GPU raises bandwidth. Caching compiled engines removes most of the startup term. Each part is optimized separately.']}});
});

N.figure('route',function(){
  N.tabs($('#route-tabs'),[
    {label:'Router',html:'<h4>Where should this request go?</h4><p>Works per request. KV cache aware routing sends it to a replica holding a matching prefix, and LoRA aware routing to one with the needed adapter loaded. Uses engine and orchestrator information such as sequence length, prefix and LoRA needs.</p>'},
    {label:'Load balancer',html:'<h4>Where could it go?</h4><p>Works at the system level to even out load. Equal counts are not equal load, since one 10,000 token request outweighs many 100 token ones. Routing and balancing appear at several points in the stack.</p>'},
    {label:'Queue',html:'<h4>Hold what cannot run yet</h4><p>A first-in first-out buffer for excess traffic while scale up happens, or a priority queue that serves paid users first. New replicas must see the queue and immediately receive up to their concurrency limit.</p>'}]);
});

N.figure('hops',function(){
  N.calc($('#hops-calc'),{
    inputs:[{k:'n',label:'Steps in the pipeline',min:1,max:10,step:1,value:5},{k:'x',label:'Cross-cluster hop (ms), inside is 10',min:20,max:100,step:5,value:50},{k:'s',label:'Latency SLA (ms)',min:500,max:2000,step:100,value:1000}],
    outputs:[{label:'Added latency',fn:function(v){return v.n*(v.x-10)},fmt:function(x){return fmt.n(x)+' ms'}},{label:'Share of the SLA',fn:function(v){return v.n*(v.x-10)/v.s},fmt:fmt.pct}],
    bars:[{label:'SLA used',fn:function(v){return v.n*(v.x-10)/v.s},max:1,kind:'w',fmt:fmt.pct}],
    read:function(v){return v.n===5&&v.x===50&&v.s===1000?['The book example','A 40 ms difference across five steps is 200 ms, or 20 percent of a one second SLA. Keep the whole pipeline in one cluster.',true]:['Hops add up','Every step that crosses clusters pays the extra delay again, so co-locate the models in a pipeline.']}});
});

N.figure('buy',function(){
  N.compare($('#buy-cmp'),{
    metrics:[{label:'Price',kind:'w'},{label:'Flexibility'},{label:'Interruption risk',kind:'w'}],
    options:[{label:'Reserved',vals:[.3,.1,.05],text:['discounted','low','none'],h:'Reserved',p:'Blocks of hundreds or thousands of GPUs for months or years at discounted rates. The baseline of a large deployment.'},
             {label:'On-demand',vals:[1,.8,.1],text:['highest','high','low'],h:'On-demand',p:'Individual instances as needed up to a quota at a relatively high hourly cost. Useful for peaks.'},
             {label:'Spot',vals:[.45,.6,1],text:['discounted','medium','preemptible'],h:'Spot',p:'Discounted instances that can be pre-empted after a notice, often minutes. Good for flexible peak capacity.'}]});
});

N.figure('geo',function(){
  N.calc($('#geo-calc'),{
    inputs:[{k:'z',label:'Time zones crossed',min:0,max:9,step:1,value:3}],
    outputs:[{label:'One way',fn:function(v){return v.z*5},fmt:function(x){return x+' ms'}},{label:'Round trip',fn:function(v){return v.z*10},fmt:function(x){return x+' ms'}}],
    bars:[{label:'Round trip',fn:function(v){return v.z*10},max:90,kind:'w',fmt:function(x){return x+' ms'}}],
    read:function(v){return v.z===3?['New York to San Francisco','Three zones is about 15 ms one way, which is a meaningful slice of a tight latency budget.']:['Run close to users','Each zone adds about 5 ms each way, so global capacity should sit near where users are, balanced against queue depth elsewhere.']}});
});

N.figure('fail',function(){
  N.calc($('#fail-calc'),{
    inputs:[{k:'g',label:'GPUs in the fleet',min:8,max:2048,step:8,value:8},{k:'d',label:'Days of operation',min:30,max:365,step:5,value:365}],
    outputs:[{label:'GPU-hours',fn:function(v){return v.g*24*v.d}},{label:'Expected failures',fn:function(v){return v.g*24*v.d/50000},fmt:function(x){return fmt.n(x,1)},sub:'at 1 per 50,000 GPU-hours'}],
    bars:[{label:'Failures',fn:function(v){return v.g*24*v.d/50000},max:200,kind:'w',fmt:function(x){return fmt.n(x,1)}}],
    read:function(v){var f=v.g*24*v.d/50000;return f>=1?['Expect hardware failures','One node of eight GPUs for a year already exceeds 70,000 GPU-hours. Detect failures, cordon nodes, and cycle pods, because a failed GPU often precedes more failures on the node.',true]:['Lucky, but plan anyway','Over a short period a small fleet may see none, but any production system should assume failures will happen.']}});
});

N.figure('ha',function(){
  N.compare($('#ha-cmp'),{
    metrics:[{label:'Failover speed'},{label:'Idle capacity cost',kind:'w'}],
    options:[{label:'Active-active',vals:[1,.3],text:['seamless','shared'],h:'Active-active',p:'Several regions or clusters serve live traffic together. If one fails, traffic continues on the others.'},
             {label:'Active-passive',vals:[.6,1],text:['cut over','idle standby'],h:'Active-passive',p:'A hot standby is kept ready but idle. If the active plane fails, traffic is cut over to it.'}]});
});

N.figure('sec',function(){
  N.tabs($('#sec-tabs'),[
    {label:'User data',html:'<h4>Protect inputs and outputs</h4><p>The easiest improvement is to not store them, if logging and user agreements allow. That reduces attack surface. Otherwise use encryption, access controls and isolation, validated by third-party penetration tests.</p>'},
    {label:'Model weights',html:'<h4>A trade secret</h4><p>Fine-tuned or proprietary weights are valuable, so treat them like any sensitive asset in a containerized workload.</p>'},
    {label:'Infrastructure',html:'<h4>Targets for abuse</h4><p>GPUs and access to the model are both targets. Use container security, network controls and workload isolation.</p>'},
    {label:'Compliance',html:'<h4>Certifications and residency</h4><p>Meeting SOC 2 Type II or HIPAA usually requires compliant providers, and multi-cloud lets you move workloads to ones that are. Data residency rules can be met with clusters in each region.</p>'}]);
});

N.figure('canary',function(){
  N.calc($('#canary-calc'),{
    inputs:[{k:'p',label:'Traffic sent to the new version (%)',min:0,max:100,step:5,value:10}],
    outputs:[{label:'Blue-green GPUs',fn:function(){return 200},sub:'full copy of both'},
             {label:'Canary: new version',fn:function(v){return Math.ceil(v.p)}},
             {label:'Canary: old version',fn:function(v){return 100-Math.ceil(v.p)},sub:'scales down as traffic leaves'}],
    bars:[{label:'Canary total',fn:function(){return 100},max:200,fmt:function(x){return x+' GPUs'}},{label:'Blue-green total',fn:function(){return 200},max:200,kind:'w',fmt:function(x){return x+' GPUs'}}],
    read:function(v){return v.p<=10?['Catch errors early','Only a small share of users are exposed. Monitor, revert on problems, and ramp up in steps. Keep enough new replicas to avoid queueing.']:['Ramping up','As traffic moves, the old version autoscales down, so total GPUs stay near the original. Blue-green would need a full second copy.']}});
});

N.figure('cost',function(){
  N.calc($('#cost-calc'),{
    inputs:[{k:'t',label:'Tokens per day (millions)',min:10,max:5000,step:10,value:500},{k:'a',label:'API price ($ per million tokens)',min:.1,max:10,step:.1,value:1,fmt:function(v){return '$'+fmt.n(v,1)}},
            {k:'g',label:'Dedicated GPUs',min:1,max:32,step:1,value:8},{k:'h',label:'GPU price ($ per hour)',min:1,max:10,step:.5,value:4,fmt:function(v){return '$'+fmt.n(v,1)}}],
    outputs:[{label:'API per month',fn:function(v){return v.t*30*v.a},fmt:function(x){return '$'+fmt.n(x)}},
             {label:'Dedicated per month',fn:function(v){return v.g*v.h*24*30},fmt:function(x){return '$'+fmt.n(x)}},
             {label:'Dedicated vs API',fn:function(v){return v.g*v.h*24*30/(v.t*30*v.a)},fmt:function(x){return fmt.n(x,2)+'x'}}],
    bars:[{label:'API',fn:function(v){return v.t*30*v.a},max:150000,fmt:function(x){return '$'+fmt.n(x/1000)+'K'}},{label:'Dedicated',fn:function(v){return v.g*v.h*24*30},max:150000,kind:'w',fmt:function(x){return '$'+fmt.n(x/1000)+'K'}}],
    read:function(v,o){return o[2]<1?['Dedicated is cheaper on paper','Assuming the GPUs can actually serve this volume at your latency target. Also add engineering time for total cost of ownership.']:['The API is cheaper at this volume','Dedicated cost is fixed, so it only wins when traffic saturates the GPUs. Early on, pay-per-token is usually the better deal.',true]}});
});

N.figure('obs',function(){
  N.tabs($('#obs-tabs'),[
    {label:'Volume and size',html:'<h4>Demand</h4><ul><li>Total volume of requests.</li><li>Input and output sequence lengths.</li></ul>'},
    {label:'Health',html:'<h4>Outcomes</h4><ul><li>Counts of 2XX, 4XX and 5XX responses.</li><li>TTFT, TPS and end-to-end latency at P50, P90 and P99.</li></ul>'},
    {label:'Fleet',html:'<h4>Capacity</h4><ul><li>Replicas serving and starting.</li><li>CPU, host memory, GPU and GPU memory utilization.</li><li>Queue depth for asynchronous traffic.</li></ul>'},
    {label:'Logs',html:'<h4>Why it happened</h4><p>Server logs and audit logs showing changes to the service give the detail needed to fix issues, and everything should feed existing tools.</p>'}]);
});

N.figure('tls',function(){
  N.calc($('#tls-calc'),{
    inputs:[{k:'h',label:'Handshake time (ms)',min:10,max:100,step:5,value:30},{k:'s',label:'P95 latency SLA (ms)',min:100,max:1000,step:50,value:300}],
    outputs:[{label:'Budget spent before inference',fn:function(v){return v.h/v.s},fmt:fmt.pct}],
    bars:[{label:'Handshake',fn:function(v){return v.h/v.s},max:1,kind:'w',fmt:fmt.pct}],
    read:function(v){return v.h/v.s>=.1?['A tenth of the budget is gone','At 30 ms on a 300 ms SLA the handshake costs 10 percent before the model starts. Reuse sessions so later requests skip it.',true]:['Small but real','Reusing sessions removes it entirely for later requests.']}});
});

N.figure('proto',function(){
  N.compare($('#proto-cmp'),{
    metrics:[{label:'Streaming both ways'},{label:'Schema enforcement'},{label:'Parsing overhead',kind:'w'}],
    options:[{label:'HTTP streaming',vals:[.3,.3,.3],text:['output only','loose','light'],h:'HTTP streaming',p:'Enough for streaming text output from language models, but not for continuous input and output.'},
             {label:'WebSockets',vals:[1,.15,.7],text:['yes','none','server parses'],h:'WebSockets',p:'Bi-directional streaming of unstructured real-time data like audio. A server holds a configured number of connections, and new ones wait for a free slot or a new replica.'},
             {label:'gRPC',vals:[1,1,.2],text:['yes','predefined','schema validated'],h:'gRPC',p:'Bi-directional streaming of structured data under a predefined schema, which removes parsing but adds a validation layer that makes it slightly slower than WebSockets.'}]});
});

N.figure('chapter-map',function(){
  N.mindmap($('#map-svg'),[
    ['7.1 Containers',['Layers, pinned versions','Pack light','NIMs as a starting point']],
    ['7.2 Autoscaling',['Traffic and utilization','Concurrency, batching','Cold starts, queue, routing']],
    ['7.3 Multi-cloud',['Capacity, redundancy, latency','Reserved, on-demand, spot','Active-active, residency']],
    ['7.4 Deploy',['Shadow and load tests','Canary over blue-green','Cost, observability']],
    ['7.5 Client',['Reuse sessions','Async for bulk','WebSockets, gRPC']]
  ],'Production');
});
N.figure('recall',function(){
  N.flashcards($('#fcs'),[
    ['What is in an inference container and why pin versions?','CUDA toolkit, Python packages, engine and system packages. Pinning keeps behavior consistent and protects against breaking changes.'],
    ['What are the five traffic autoscaling settings?','Min replicas, max replicas, autoscaling window, scale down delay and concurrency target.'],
    ['Why use both traffic and utilization signals?','Traffic can lead and scale proactively, while utilization lags but captures expensive requests like huge uncached prompts.'],
    ['What are the parts of a cold start?','GPU procurement, image loading, model loading and engine startup, each optimized separately.'],
    ['Router versus load balancer?','A router decides where a request should go, for example cache aware. A load balancer evens out where it could go.'],
    ['When does scale to zero fit?','Development, periodic agents and daily batch jobs, with fast cold starts and robust queueing. Not for latency sensitive apps with light unscheduled traffic.'],
    ['Why keep a pipeline in one cluster?','Cross cluster hops add latency at every step. Five hops that are 40 ms slower is 200 ms.'],
    ['What are the three GPU purchase types?','Reserved for a baseline, on-demand for flexible use and spot for discounted, preemptible peaks.'],
    ['Active-active versus active-passive?','Active-active serves live traffic from several planes. Active-passive keeps a hot standby for cutover.'],
    ['Why canary instead of blue-green at scale?','Blue-green needs a full second copy of the GPUs. A canary shifts traffic gradually and autoscaling shrinks the old version.'],
    ['What do you measure for a TLS handshake?','A few dozen ms, at least 10 percent of a 300 ms budget. Reuse sessions.'],
    ['WebSockets versus gRPC?','WebSockets stream unstructured data with no schema. gRPC streams structured data against a schema, with slightly more overhead.']
  ]);
});
})();
