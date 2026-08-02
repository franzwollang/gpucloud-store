import type { LucideIcon } from 'lucide-react';
import { Brain, Code, Cpu, Database, Microscope, Video } from 'lucide-react';

export type UseCaseId =
  | 'llm-training'
  | 'inference'
  | 'computer-vision'
  | 'data-science'
  | 'research'
  | 'development';

export type UseCaseDefinition = {
  id: UseCaseId;
  nameKey: string;
  nameDefault: string;
  descriptionKey: string;
  descriptionDefault: string;
  exampleKeys: readonly string[];
  exampleDefaults: readonly string[];
  icon: LucideIcon;
};

export type UseCaseTemplateItem = {
  gpuModel: string;
  gpuCount: number;
};

export type UseCaseTemplate = {
  id: string;
  tierKey: string;
  tierDefault: string;
  recommended?: boolean;
  priceTextKey?: string;
  priceDefault?: string;
  bestForKey?: string;
  bestForDefault?: string;
  tradeoffs?: {
    performance: number;
    cost: number;
    simplicity: number;
  };
  items: readonly UseCaseTemplateItem[];
};

export type UseCaseTemplateGroup = {
  whyThisMattersKey: string;
  whyDefault: string;
  keyConsiderationsKeys: readonly string[];
  considerationDefaults: readonly string[];
  templates: readonly UseCaseTemplate[];
};

export const useCases = [
  {
    id: 'llm-training',
    nameKey: 'useCases.items.llmTraining.name',
    nameDefault: 'LLM Training',
    descriptionKey: 'useCases.items.llmTraining.description',
    descriptionDefault: 'Large language model training and fine-tuning.',
    exampleKeys: [
      'useCases.items.llmTraining.examples.0',
      'useCases.items.llmTraining.examples.1',
      'useCases.items.llmTraining.examples.2',
      'useCases.items.llmTraining.examples.3'
    ],
    exampleDefaults: [
      'Frontier / MoE pretraining',
      'Llama & Qwen fine-tuning',
      'Multi-node NVLink clusters',
      'Long-context training'
    ],
    icon: Brain
  },
  {
    id: 'inference',
    nameKey: 'useCases.items.inference.name',
    nameDefault: 'AI Inference',
    descriptionKey: 'useCases.items.inference.description',
    descriptionDefault: 'High-throughput model serving and inference.',
    exampleKeys: [
      'useCases.items.inference.examples.0',
      'useCases.items.inference.examples.1',
      'useCases.items.inference.examples.2',
      'useCases.items.inference.examples.3'
    ],
    exampleDefaults: [
      'Large-context chat APIs',
      'Low-latency endpoints',
      'Batch / offline scoring',
      'High-QPS serving'
    ],
    icon: Cpu
  },
  {
    id: 'computer-vision',
    nameKey: 'useCases.items.computerVision.name',
    nameDefault: 'Computer Vision',
    descriptionKey: 'useCases.items.computerVision.description',
    descriptionDefault: 'Image and video processing workloads.',
    exampleKeys: [
      'useCases.items.computerVision.examples.0',
      'useCases.items.computerVision.examples.1',
      'useCases.items.computerVision.examples.2',
      'useCases.items.computerVision.examples.3'
    ],
    exampleDefaults: [
      'Object detection',
      'Image segmentation',
      'Video analytics',
      'Multimodal vision models'
    ],
    icon: Video
  },
  {
    id: 'data-science',
    nameKey: 'useCases.items.dataScience.name',
    nameDefault: 'Data Science',
    descriptionKey: 'useCases.items.dataScience.description',
    descriptionDefault: 'Large-scale analytics and ETL pipelines.',
    exampleKeys: [
      'useCases.items.dataScience.examples.0',
      'useCases.items.dataScience.examples.1',
      'useCases.items.dataScience.examples.2',
      'useCases.items.dataScience.examples.3'
    ],
    exampleDefaults: [
      'GPU dataframe / SQL',
      'Feature engineering',
      'Large-scale ETL',
      'Embedding pipelines'
    ],
    icon: Database
  },
  {
    id: 'research',
    nameKey: 'useCases.items.research.name',
    nameDefault: 'Research',
    descriptionKey: 'useCases.items.research.description',
    descriptionDefault: 'Experimental and academic workloads.',
    exampleKeys: [
      'useCases.items.research.examples.0',
      'useCases.items.research.examples.1',
      'useCases.items.research.examples.2',
      'useCases.items.research.examples.3'
    ],
    exampleDefaults: [
      'Novel architectures',
      'Ablation studies',
      'Hyperparameter sweeps',
      'Benchmarking new SKUs'
    ],
    icon: Microscope
  },
  {
    id: 'development',
    nameKey: 'useCases.items.development.name',
    nameDefault: 'Development',
    descriptionKey: 'useCases.items.development.description',
    descriptionDefault: 'Prototyping and iteration.',
    exampleKeys: [
      'useCases.items.development.examples.0',
      'useCases.items.development.examples.1',
      'useCases.items.development.examples.2',
      'useCases.items.development.examples.3'
    ],
    exampleDefaults: [
      'Rapid iteration',
      'Eval harnesses',
      'CI / smoke tests',
      'Prototype validation'
    ],
    icon: Code
  }
 ] as const satisfies ReadonlyArray<UseCaseDefinition>;

export const useCaseTemplateGroups = {
  'llm-training': {
    whyThisMattersKey: 'templatesModal.content.llmTraining.why',
    whyDefault: 'LLM training needs high memory bandwidth and fast GPU interconnects. Blackwell and Hopper SXM nodes cut time-to-train on frontier and long-context models.',
    keyConsiderationsKeys: [
      'templatesModal.content.llmTraining.considerations.0',
      'templatesModal.content.llmTraining.considerations.1',
      'templatesModal.content.llmTraining.considerations.2',
      'templatesModal.content.llmTraining.considerations.3'
    ],
    considerationDefaults: ['Model size and context length drive minimum HBM capacity', 'Multi-GPU training needs NVLink / fast fabric', 'Larger batches improve efficiency but raise VRAM demand', 'H200/B200 HBM capacity matters more than raw FLOPs alone'],
    templates: [
      {
        id: 'llm-enterprise',
        tierKey: 'templatesModal.tiers.enterprise',
        tierDefault: 'Enterprise',
        recommended: true,
        priceTextKey: 'templatesModal.prices.llmTraining.enterprise',
        priceDefault: '$55-85/hr',
        bestForKey: 'templatesModal.bestFor.llmTraining.enterprise',
        bestForDefault: 'Frontier / MoE pretraining on Blackwell (70B+ dense, large MoE)',
        tradeoffs: { performance: 96, cost: 92, simplicity: 58 },
        items: [{ gpuModel: 'B200', gpuCount: 8 }]
      },
      {
        id: 'llm-professional',
        tierKey: 'templatesModal.tiers.professional',
        tierDefault: 'Professional',
        priceTextKey: 'templatesModal.prices.llmTraining.professional',
        priceDefault: '$35-55/hr',
        bestForKey: 'templatesModal.bestFor.llmTraining.professional',
        bestForDefault: 'Long-context and large-model training on H200',
        tradeoffs: { performance: 88, cost: 78, simplicity: 68 },
        items: [{ gpuModel: 'H200', gpuCount: 8 }]
      },
      {
        id: 'llm-standard',
        tierKey: 'templatesModal.tiers.standard',
        tierDefault: 'Standard',
        priceTextKey: 'templatesModal.prices.llmTraining.standard',
        priceDefault: '$16-28/hr',
        bestForKey: 'templatesModal.bestFor.llmTraining.standard',
        bestForDefault: 'Fine-tuning and mid-size training on H100 SXM',
        tradeoffs: { performance: 76, cost: 55, simplicity: 78 },
        items: [{ gpuModel: 'H100 SXM', gpuCount: 4 }]
      }
    ]
  },
  inference: {
    whyThisMattersKey: 'templatesModal.content.inference.why',
    whyDefault: 'Inference prioritizes tokens/$ and tail latency. Use high-memory GPUs for long-context serving; Ada L40S for cost-efficient throughput.',
    keyConsiderationsKeys: [
      'templatesModal.content.inference.considerations.0',
      'templatesModal.content.inference.considerations.1',
      'templatesModal.content.inference.considerations.2',
      'templatesModal.content.inference.considerations.3'
    ],
    considerationDefaults: ['Context length and concurrency drive VRAM needs', 'Throughput scales with replica count and batching', 'INT8/FP8/FP16 cut memory and raise tokens/sec', 'L40S remains strong price/performance for mid-size serving'],
    templates: [
      {
        id: 'inference-high-volume',
        tierKey: 'templatesModal.tiers.highVolume',
        tierDefault: 'High-Volume',
        recommended: true,
        priceTextKey: 'templatesModal.prices.inference.highVolume',
        priceDefault: '$18-30/hr',
        bestForKey: 'templatesModal.bestFor.inference.highVolume',
        bestForDefault: 'Large-context / frontier model serving',
        tradeoffs: { performance: 90, cost: 72, simplicity: 70 },
        items: [{ gpuModel: 'H200', gpuCount: 2 }]
      },
      {
        id: 'inference-balanced',
        tierKey: 'templatesModal.tiers.balanced',
        tierDefault: 'Balanced',
        priceTextKey: 'templatesModal.prices.inference.balanced',
        priceDefault: '$6-10/hr',
        bestForKey: 'templatesModal.bestFor.inference.balanced',
        bestForDefault: 'High-QPS APIs and batch inference on L40S',
        tradeoffs: { performance: 76, cost: 48, simplicity: 80 },
        items: [{ gpuModel: 'L40S', gpuCount: 4 }]
      },
      {
        id: 'inference-cost',
        tierKey: 'templatesModal.tiers.costOptimized',
        tierDefault: 'Cost-Optimized',
        priceTextKey: 'templatesModal.prices.inference.costOptimized',
        priceDefault: '$1.5-3/hr',
        bestForKey: 'templatesModal.bestFor.inference.costOptimized',
        bestForDefault: 'Low-traffic endpoints and staging',
        tradeoffs: { performance: 58, cost: 28, simplicity: 88 },
        items: [{ gpuModel: 'L40S', gpuCount: 1 }]
      }
    ]
  },
  'computer-vision': {
    whyThisMattersKey: 'templatesModal.content.computerVision.why',
    whyDefault: 'Vision workloads need balanced compute and memory for high-res images, video, and multimodal models.',
    keyConsiderationsKeys: [
      'templatesModal.content.computerVision.considerations.0',
      'templatesModal.content.computerVision.considerations.1',
      'templatesModal.content.computerVision.considerations.2',
      'templatesModal.content.computerVision.considerations.3'
    ],
    considerationDefaults: ['Resolution and batch size determine VRAM needs', 'Video and multimodal models favor larger Ada GPUs', 'Real-time pipelines need low-latency nodes', 'Training vs inference often want different SKUs'],
    templates: [
      {
        id: 'vision-professional',
        tierKey: 'templatesModal.tiers.professional',
        tierDefault: 'Professional',
        recommended: true,
        priceTextKey: 'templatesModal.prices.computerVision.professional',
        priceDefault: '$6-10/hr',
        bestForKey: 'templatesModal.bestFor.computerVision.professional',
        bestForDefault: 'High-res video, multimodal, and training jobs',
        tradeoffs: { performance: 86, cost: 58, simplicity: 74 },
        items: [{ gpuModel: 'L40S', gpuCount: 4 }]
      },
      {
        id: 'vision-standard',
        tierKey: 'templatesModal.tiers.standard',
        tierDefault: 'Standard',
        priceTextKey: 'templatesModal.prices.computerVision.standard',
        priceDefault: '$3-5/hr',
        bestForKey: 'templatesModal.bestFor.computerVision.standard',
        bestForDefault: 'Detection/segmentation and realtime pipelines',
        tradeoffs: { performance: 74, cost: 42, simplicity: 82 },
        items: [{ gpuModel: 'L40S', gpuCount: 2 }]
      },
      {
        id: 'vision-entry',
        tierKey: 'templatesModal.tiers.entry',
        tierDefault: 'Entry',
        priceTextKey: 'templatesModal.prices.computerVision.entry',
        priceDefault: '$1.5-2.5/hr',
        bestForKey: 'templatesModal.bestFor.computerVision.entry',
        bestForDefault: 'Prototyping and small datasets',
        tradeoffs: { performance: 60, cost: 28, simplicity: 90 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 1 }]
      }
    ]
  },
  'data-science': {
    whyThisMattersKey: 'templatesModal.content.dataScience.why',
    whyDefault: 'GPU dataframes, SQL, and embedding pipelines benefit from large HBM and CUDA/ROCm acceleration.',
    keyConsiderationsKeys: [
      'templatesModal.content.dataScience.considerations.0',
      'templatesModal.content.dataScience.considerations.1',
      'templatesModal.content.dataScience.considerations.2',
      'templatesModal.content.dataScience.considerations.3'
    ],
    considerationDefaults: ['Dataset size determines memory requirements', 'RAPIDS-style stacks want CUDA-capable GPUs', 'Multi-GPU helps with larger-than-memory jobs', 'Storage I/O often bottlenecks before the GPU'],
    templates: [
      {
        id: 'data-intensive',
        tierKey: 'templatesModal.tiers.dataIntensive',
        tierDefault: 'Data-Intensive',
        recommended: true,
        priceTextKey: 'templatesModal.prices.dataScience.dataIntensive',
        priceDefault: '$10-16/hr',
        bestForKey: 'templatesModal.bestFor.dataScience.dataIntensive',
        bestForDefault: 'Very large HBM jobs (100GB+ working sets)',
        tradeoffs: { performance: 86, cost: 68, simplicity: 72 },
        items: [{ gpuModel: 'MI300X', gpuCount: 2 }]
      },
      {
        id: 'data-balanced',
        tierKey: 'templatesModal.tiers.balanced',
        tierDefault: 'Balanced',
        priceTextKey: 'templatesModal.prices.dataScience.balanced',
        priceDefault: '$8-14/hr',
        bestForKey: 'templatesModal.bestFor.dataScience.balanced',
        bestForDefault: 'GPU ETL / analytics on Hopper PCIe',
        tradeoffs: { performance: 74, cost: 48, simplicity: 78 },
        items: [{ gpuModel: 'H100 PCIe', gpuCount: 2 }]
      },
      {
        id: 'data-standard',
        tierKey: 'templatesModal.tiers.standard',
        tierDefault: 'Standard',
        priceTextKey: 'templatesModal.prices.dataScience.standard',
        priceDefault: '$1.5-2.5/hr',
        bestForKey: 'templatesModal.bestFor.dataScience.standard',
        bestForDefault: 'Exploratory analysis and light transforms',
        tradeoffs: { performance: 60, cost: 30, simplicity: 86 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 1 }]
      }
    ]
  },
  research: {
    whyThisMattersKey: 'templatesModal.content.research.why',
    whyDefault: 'Research needs access to current architectures and the flexibility to scale experiments up or down quickly.',
    keyConsiderationsKeys: [
      'templatesModal.content.research.considerations.0',
      'templatesModal.content.research.considerations.1',
      'templatesModal.content.research.considerations.2',
      'templatesModal.content.research.considerations.3'
    ],
    considerationDefaults: ['Newer SKUs unlock longer context and denser MoE runs', 'Scale up or down per experiment to control cost', 'Mixed-precision support matters across toolchains', 'Fast iteration beats max cluster size for most labs'],
    templates: [
      {
        id: 'research-cutting-edge',
        tierKey: 'templatesModal.tiers.cuttingEdge',
        tierDefault: 'Cutting-Edge',
        recommended: true,
        priceTextKey: 'templatesModal.prices.research.cuttingEdge',
        priceDefault: '$18-30/hr',
        bestForKey: 'templatesModal.bestFor.research.cuttingEdge',
        bestForDefault: 'Frontier experiments needing H200 memory',
        tradeoffs: { performance: 94, cost: 82, simplicity: 62 },
        items: [{ gpuModel: 'H200', gpuCount: 2 }]
      },
      {
        id: 'research-professional',
        tierKey: 'templatesModal.tiers.professional',
        tierDefault: 'Professional',
        priceTextKey: 'templatesModal.prices.research.professional',
        priceDefault: '$8-14/hr',
        bestForKey: 'templatesModal.bestFor.research.professional',
        bestForDefault: 'Lab workloads on H100 SXM',
        tradeoffs: { performance: 82, cost: 60, simplicity: 72 },
        items: [{ gpuModel: 'H100 SXM', gpuCount: 2 }]
      },
      {
        id: 'research-academic',
        tierKey: 'templatesModal.tiers.academic',
        tierDefault: 'Academic',
        priceTextKey: 'templatesModal.prices.research.academic',
        priceDefault: '$1.5-2.5/hr',
        bestForKey: 'templatesModal.bestFor.research.academic',
        bestForDefault: 'Single-GPU academic and teaching work',
        tradeoffs: { performance: 62, cost: 28, simplicity: 86 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 1 }]
      }
    ]
  },
  development: {
    whyThisMattersKey: 'templatesModal.content.development.why',
    whyDefault: 'Dev environments need responsive GPUs for iteration while keeping always-on cost under control.',
    keyConsiderationsKeys: [
      'templatesModal.content.development.considerations.0',
      'templatesModal.content.development.considerations.1',
      'templatesModal.content.development.considerations.2',
      'templatesModal.content.development.considerations.3'
    ],
    considerationDefaults: ['Quick iteration cycles need snappy single nodes', 'Most dev work does not need multi-GPU', 'Always-on instances amplify hourly cost', 'Mirror production SKUs at smaller scale when possible'],
    templates: [
      {
        id: 'dev-team',
        tierKey: 'templatesModal.tiers.team',
        tierDefault: 'Team',
        recommended: true,
        priceTextKey: 'templatesModal.prices.development.team',
        priceDefault: '$3-6/hr',
        bestForKey: 'templatesModal.bestFor.development.team',
        bestForDefault: 'Shared team environments on L40S',
        tradeoffs: { performance: 78, cost: 50, simplicity: 84 },
        items: [{ gpuModel: 'L40S', gpuCount: 2 }]
      },
      {
        id: 'dev-standard',
        tierKey: 'templatesModal.tiers.standard',
        tierDefault: 'Standard',
        priceTextKey: 'templatesModal.prices.development.standard',
        priceDefault: '$1.5-2.5/hr',
        bestForKey: 'templatesModal.bestFor.development.standard',
        bestForDefault: 'Single-user dev and eval harnesses',
        tradeoffs: { performance: 64, cost: 32, simplicity: 90 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 1 }]
      },
      {
        id: 'dev-starter',
        tierKey: 'templatesModal.tiers.starter',
        tierDefault: 'Starter',
        priceTextKey: 'templatesModal.prices.development.starter',
        priceDefault: '$1-1.5/hr',
        bestForKey: 'templatesModal.bestFor.development.starter',
        bestForDefault: 'Lightweight smoke tests and prototypes',
        tradeoffs: { performance: 50, cost: 20, simplicity: 94 },
        items: [{ gpuModel: 'A10', gpuCount: 1 }]
      }
    ]
  }
} as const satisfies Record<UseCaseId, UseCaseTemplateGroup>;
