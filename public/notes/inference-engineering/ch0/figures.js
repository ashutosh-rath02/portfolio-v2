(function(){
var N=window.Notes,$=N.$,$$=N.$$;

N.figure('life',function(){
  N.flow($('#life'),{cols:4,rowH:90,nodeH:60,particles:true,read:'#life-read',start:'inf',
    nodes:[
      {id:'data',t:'Data',s:'raw material',c:0,r:0,info:'Training data is gathered, cleaned and shaped. Everything the model will ever know comes from here.'},
      {id:'train',t:'Training',s:'learn weights',c:1,r:0,info:'Training adjusts billions of weights until the model predicts well. It happens once per version and is not the subject of this book.'},
      {id:'inf',t:'Inference',s:'serve the model',c:2,r:0,kind:'acc',info:'Inference runs the finished weights on new inputs, again and again, for real users. It is continuous, latency sensitive and paid for on every request.'},
      {id:'users',t:'Users',s:'real traffic',c:3,r:0,info:'Users experience the product through inference. Speed, cost and reliability here are what they actually notice.'}],
    edges:[{a:'data',b:'train'},{a:'train',b:'inf',kind:'a'},{a:'inf',b:'users',kind:'a'}]});
});

N.figure('kinds',function(){
  N.compare($('#kinds-cmp'),{
    metrics:[{label:'Model size'},{label:'Hardware cost',kind:'w'},{label:'Tuning headroom'}],
    options:[
      {label:'Classic ML',vals:[.06,.08,.1],text:['small','low','narrow'],h:'Classic ML inference',p:'Small models such as gradient boosted trees run on CPUs. A container and a load balancer are usually enough, and there is little to gain from deeper work.'},
      {label:'Generative AI',vals:[.95,.9,.95],text:['huge','high','wide'],h:'Generative inference',p:'Large models need GPUs and many requests share them. Careful batching, caching, quantization and scheduling change cost and latency by large factors.'}]});
});

N.figure('layers',function(){
  N.flow($('#layers'),{cols:1,rowH:84,nodeH:60,read:'#layers-read',start:'run',
    nodes:[
      {id:'tool',t:'Tooling',s:'developer experience',c:0,r:0,w:420,info:'Tooling sits between a black box API and raw compute. It lets engineers deploy, observe and iterate without rebuilding the stack each time.'},
      {id:'infra',t:'Infrastructure',s:'scale, reliability, reach',c:0,r:1,w:420,info:'Infrastructure turns one working replica into a fleet. Autoscaling, capacity across regions and clouds, and reliability live here.'},
      {id:'run',t:'Runtime',s:'one model on one GPU instance',c:0,r:2,w:420,kind:'acc',info:'Runtime is a single model on a single GPU backed instance. CUDA, PyTorch, engines such as vLLM, SGLang and TensorRT-LLM, and kernels such as FlashAttention live here, along with batching, caching, quantization, speculation, parallelism and disaggregation.'}],
    edges:[{a:'run',b:'infra',kind:'a'},{a:'infra',b:'tool'}]});
});

N.figure('grow',function(){
  var f=N.flow($('#grow'),{cols:4,rowH:90,nodeH:60,read:'#grow-read',start:'auto',play:['auto','regions','silos','pool'],playBtn:'#grow-play',
    nodes:[
      {id:'auto',t:'Autoscaling',s:'first',c:0,r:0,info:'Start by adding and removing replicas as traffic moves. This covers most teams for a long time.'},
      {id:'regions',t:'Multi-region',s:'a few hundred GPUs',c:1,r:0,info:'Past a few hundred GPUs one data center rarely has enough capacity, so you buy from several regions and clouds.'},
      {id:'silos',t:'Silos',s:'pools per cloud',c:2,r:0,kind:'warn',info:'Capacity bought separately becomes separate pools. Some sit idle while others overflow, which wastes money.'},
      {id:'pool',t:'Global pool',s:'one unified view',c:3,r:0,kind:'acc',info:'A global pool routes each request to the best capacity anywhere. It also improves reliability and puts the model near users.'}],
    edges:[{a:'auto',b:'regions'},{a:'regions',b:'silos',kind:'w'},{a:'silos',b:'pool',kind:'a'}]});
});

N.figure('book',function(){
  var rows=[
    ['Ch 1 Prerequisites',1,'Decide what fast means for your product: latency, throughput, quality.'],
    ['Ch 2 Models',2,'How LLMs and image models actually compute, and where the bottlenecks are.'],
    ['Ch 3 Hardware',3,'GPU architecture, generations, instances and other accelerators.'],
    ['Ch 4 Software',4,'CUDA, frameworks, inference engines, Dynamo and benchmarking.'],
    ['Ch 5 Techniques',5,'Quantization, speculation, caching, parallelism, disaggregation.'],
    ['Ch 6 Modalities',6,'Vision, embeddings, speech and image or video generation.'],
    ['Ch 7 Production',7,'Containers, autoscaling, multi-cloud, deployment and client code.']];
  N.barchart($('#book-bars'),{read:'#book-read',max:7,rows:rows.map(function(r){return{label:r[0],value:r[1],text:'',info:r[2],kind:r[1]>=5?'w':''}})});
  var h=$('#book-read');$('h4',h).textContent='Reading order';$('p',h).textContent='The chapters climb from fundamentals toward production. Hover a row for the job of each chapter.';
});

N.figure('chapter-map',function(){
  N.mindmap($('#map-svg'),[
    ['Phase',['Training learns weights','Inference serves them to users']],
    ['Kinds',['Classic ML: CPUs, simple','Generative: GPUs, big headroom']],
    ['Runtime',['One model, one GPU instance','Engines, kernels, techniques']],
    ['Infrastructure',['Autoscaling, then multi-region','Global pool, reliability']],
    ['Tooling',['Developer experience','Between black box and raw compute']]
  ],'Inference');
});

N.figure('recall',function(){
  N.flashcards($('#fcs'),[
    ['What is the difference between training and inference?','Training learns the weights once. Inference runs the finished model on new inputs for real users, continuously.'],
    ['Why is generative inference harder than classic ML inference?','The models are large, need GPUs, and each request does a lot of work, so tuning changes cost and latency by large factors.'],
    ['Name the three layers of an inference system.','Runtime, infrastructure and tooling.'],
    ['What lives in the runtime layer?','A single model on a single GPU instance: CUDA, PyTorch, engines, kernels and techniques like batching, caching, quantization, speculation, parallelism and disaggregation.'],
    ['In what order does infrastructure work usually arrive?','Autoscaling first, then capacity across regions and clouds past a few hundred GPUs, then a global pool replacing silos.'],
    ['What is the job of tooling?','Developer experience between a black box API and raw compute.']
  ]);
});
})();
