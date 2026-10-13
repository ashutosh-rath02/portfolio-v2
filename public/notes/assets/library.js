/*
 * Library data for /notes. One entry per book.
 * To publish a chapter: set status to 'live', add pages, and create
 * public/notes/<slug>/ch<n>/index.html (see docs/notes-design-system.md).
 */
window.NOTES_LIBRARY = [
  {
    slug: 'inference-engineering',
    title: 'Inference Engineering',
    author: 'Philip Kiely',
    publisher: 'Baseten Books',
    year: 2026,
    summary:
      'A practical guide to serving generative AI models in production: choosing models, understanding hardware and software, and applying the techniques that make inference faster, cheaper and more reliable.',
    credit:
      'The text is paraphrased and every figure is redrawn from scratch. Figures marked illustrative use made-up numbers to show a shape, and figures marked synthesis are my own arrangement of the chapter’s points. The ideas belong to the author, so read the book for the full treatment.',
    chapters: [
      { n: 0, title: 'Inference', status: 'soon', topics: [] },
      {
        n: 1,
        title: 'Prerequisites',
        status: 'live',
        pages: '23 to 37',
        topics: [
          'Scale and specialization',
          'About your app',
          'Model selection',
          'Measuring latency and throughput'
        ]
      },
      {
        n: 2,
        title: 'Models',
        status: 'soon',
        topics: [
          'Neural networks',
          'LLM inference mechanics',
          'Image generation inference mechanics',
          'Calculating inference bottlenecks',
          'Optimizing attention'
        ]
      },
      {
        n: 3,
        title: 'Hardware',
        status: 'soon',
        topics: [
          'GPU architecture',
          'GPU architecture generations',
          'Instances',
          'Other datacenter accelerator options',
          'Local inference'
        ]
      },
      {
        n: 4,
        title: 'Software',
        status: 'soon',
        topics: [
          'CUDA',
          'Deep learning frameworks and libraries',
          'Inference engines',
          'NVIDIA Dynamo',
          'Performance benchmarking and load testing'
        ]
      },
      {
        n: 5,
        title: 'Techniques',
        status: 'soon',
        topics: [
          'Quantization',
          'Speculative decoding',
          'Caching',
          'Model parallelism',
          'Disaggregation'
        ]
      },
      {
        n: 6,
        title: 'Modalities',
        status: 'soon',
        topics: [
          'Vision language models',
          'Embedding models',
          'ASR models',
          'TTS models',
          'Image and video generation models'
        ]
      },
      {
        n: 7,
        title: 'Production',
        status: 'soon',
        topics: [
          'Containerization',
          'Autoscaling',
          'Multi-cloud capacity management',
          'Testing and deployment',
          'Client code'
        ]
      }
    ]
  }
];
