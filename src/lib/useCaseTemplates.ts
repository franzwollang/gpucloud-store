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
  descriptionKey: string;
  exampleKeys: readonly string[];
  icon: LucideIcon;
};

export type UseCaseTemplateItem = {
  gpuModel: string;
  gpuCount: number;
};

export type UseCaseTemplate = {
  id: string;
  tierKey: string;
  recommended?: boolean;
  priceTextKey?: string;
  bestForKey?: string;
  tradeoffs?: {
    performance: number;
    cost: number;
    simplicity: number;
  };
  items: readonly UseCaseTemplateItem[];
};

export type UseCaseTemplateGroup = {
  whyThisMattersKey: string;
  keyConsiderationsKeys: readonly string[];
  templates: readonly UseCaseTemplate[];
};

export const useCases = [
  {
    id: 'llm-training',
    nameKey: 'useCases.items.llmTraining.name',
    descriptionKey: 'useCases.items.llmTraining.description',
    exampleKeys: [
      'useCases.items.llmTraining.examples.0',
      'useCases.items.llmTraining.examples.1',
      'useCases.items.llmTraining.examples.2',
      'useCases.items.llmTraining.examples.3'
    ],
    icon: Brain
  },
  {
    id: 'inference',
    nameKey: 'useCases.items.inference.name',
    descriptionKey: 'useCases.items.inference.description',
    exampleKeys: [
      'useCases.items.inference.examples.0',
      'useCases.items.inference.examples.1',
      'useCases.items.inference.examples.2',
      'useCases.items.inference.examples.3'
    ],
    icon: Cpu
  },
  {
    id: 'computer-vision',
    nameKey: 'useCases.items.computerVision.name',
    descriptionKey: 'useCases.items.computerVision.description',
    exampleKeys: [
      'useCases.items.computerVision.examples.0',
      'useCases.items.computerVision.examples.1',
      'useCases.items.computerVision.examples.2',
      'useCases.items.computerVision.examples.3'
    ],
    icon: Video
  },
  {
    id: 'data-science',
    nameKey: 'useCases.items.dataScience.name',
    descriptionKey: 'useCases.items.dataScience.description',
    exampleKeys: [
      'useCases.items.dataScience.examples.0',
      'useCases.items.dataScience.examples.1',
      'useCases.items.dataScience.examples.2',
      'useCases.items.dataScience.examples.3'
    ],
    icon: Database
  },
  {
    id: 'research',
    nameKey: 'useCases.items.research.name',
    descriptionKey: 'useCases.items.research.description',
    exampleKeys: [
      'useCases.items.research.examples.0',
      'useCases.items.research.examples.1',
      'useCases.items.research.examples.2',
      'useCases.items.research.examples.3'
    ],
    icon: Microscope
  },
  {
    id: 'development',
    nameKey: 'useCases.items.development.name',
    descriptionKey: 'useCases.items.development.description',
    exampleKeys: [
      'useCases.items.development.examples.0',
      'useCases.items.development.examples.1',
      'useCases.items.development.examples.2',
      'useCases.items.development.examples.3'
    ],
    icon: Code
  }
 ] as const satisfies ReadonlyArray<UseCaseDefinition>;

export const useCaseTemplateGroups = {
  'llm-training': {
    whyThisMattersKey: 'templatesModal.content.llmTraining.why',
    keyConsiderationsKeys: [
      'templatesModal.content.llmTraining.considerations.0',
      'templatesModal.content.llmTraining.considerations.1',
      'templatesModal.content.llmTraining.considerations.2',
      'templatesModal.content.llmTraining.considerations.3'
    ],
    templates: [
      {
        id: 'llm-enterprise',
        tierKey: 'templatesModal.tiers.enterprise',
        recommended: true,
        priceTextKey: 'templatesModal.prices.llmTraining.enterprise',
        bestForKey: 'templatesModal.bestFor.llmTraining.enterprise',
        tradeoffs: { performance: 92, cost: 88, simplicity: 62 },
        items: [
          { gpuModel: 'H100 SXM', gpuCount: 8 },
          { gpuModel: 'A100 SXM', gpuCount: 4 }
        ]
      },
      {
        id: 'llm-professional',
        tierKey: 'templatesModal.tiers.professional',
        priceTextKey: 'templatesModal.prices.llmTraining.professional',
        bestForKey: 'templatesModal.bestFor.llmTraining.professional',
        tradeoffs: { performance: 82, cost: 68, simplicity: 72 },
        items: [{ gpuModel: 'A100 SXM', gpuCount: 8 }]
      },
      {
        id: 'llm-standard',
        tierKey: 'templatesModal.tiers.standard',
        priceTextKey: 'templatesModal.prices.llmTraining.standard',
        bestForKey: 'templatesModal.bestFor.llmTraining.standard',
        tradeoffs: { performance: 68, cost: 45, simplicity: 80 },
        items: [{ gpuModel: 'A100 SXM', gpuCount: 4 }]
      }
    ]
  },
  inference: {
    whyThisMattersKey: 'templatesModal.content.inference.why',
    keyConsiderationsKeys: [
      'templatesModal.content.inference.considerations.0',
      'templatesModal.content.inference.considerations.1',
      'templatesModal.content.inference.considerations.2',
      'templatesModal.content.inference.considerations.3'
    ],
    templates: [
      {
        id: 'inference-high-volume',
        tierKey: 'templatesModal.tiers.highVolume',
        recommended: true,
        priceTextKey: 'templatesModal.prices.inference.highVolume',
        bestForKey: 'templatesModal.bestFor.inference.highVolume',
        tradeoffs: { performance: 84, cost: 58, simplicity: 74 },
        items: [{ gpuModel: 'L40S', gpuCount: 4 }]
      },
      {
        id: 'inference-balanced',
        tierKey: 'templatesModal.tiers.balanced',
        priceTextKey: 'templatesModal.prices.inference.balanced',
        bestForKey: 'templatesModal.bestFor.inference.balanced',
        tradeoffs: { performance: 70, cost: 40, simplicity: 82 },
        items: [{ gpuModel: 'L40S', gpuCount: 2 }]
      },
      {
        id: 'inference-cost',
        tierKey: 'templatesModal.tiers.costOptimized',
        priceTextKey: 'templatesModal.prices.inference.costOptimized',
        bestForKey: 'templatesModal.bestFor.inference.costOptimized',
        tradeoffs: { performance: 55, cost: 25, simplicity: 88 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 1 }]
      }
    ]
  },
  'computer-vision': {
    whyThisMattersKey: 'templatesModal.content.computerVision.why',
    keyConsiderationsKeys: [
      'templatesModal.content.computerVision.considerations.0',
      'templatesModal.content.computerVision.considerations.1',
      'templatesModal.content.computerVision.considerations.2',
      'templatesModal.content.computerVision.considerations.3'
    ],
    templates: [
      {
        id: 'vision-professional',
        tierKey: 'templatesModal.tiers.professional',
        recommended: true,
        priceTextKey: 'templatesModal.prices.computerVision.professional',
        bestForKey: 'templatesModal.bestFor.computerVision.professional',
        tradeoffs: { performance: 88, cost: 72, simplicity: 70 },
        items: [{ gpuModel: 'A100 SXM', gpuCount: 4 }]
      },
      {
        id: 'vision-standard',
        tierKey: 'templatesModal.tiers.standard',
        priceTextKey: 'templatesModal.prices.computerVision.standard',
        bestForKey: 'templatesModal.bestFor.computerVision.standard',
        tradeoffs: { performance: 72, cost: 46, simplicity: 80 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 2 }]
      },
      {
        id: 'vision-entry',
        tierKey: 'templatesModal.tiers.entry',
        priceTextKey: 'templatesModal.prices.computerVision.entry',
        bestForKey: 'templatesModal.bestFor.computerVision.entry',
        tradeoffs: { performance: 60, cost: 35, simplicity: 86 },
        items: [{ gpuModel: 'L40S', gpuCount: 1 }]
      }
    ]
  },
  'data-science': {
    whyThisMattersKey: 'templatesModal.content.dataScience.why',
    keyConsiderationsKeys: [
      'templatesModal.content.dataScience.considerations.0',
      'templatesModal.content.dataScience.considerations.1',
      'templatesModal.content.dataScience.considerations.2',
      'templatesModal.content.dataScience.considerations.3'
    ],
    templates: [
      {
        id: 'data-intensive',
        tierKey: 'templatesModal.tiers.dataIntensive',
        recommended: true,
        priceTextKey: 'templatesModal.prices.dataScience.dataIntensive',
        bestForKey: 'templatesModal.bestFor.dataScience.dataIntensive',
        tradeoffs: { performance: 82, cost: 62, simplicity: 74 },
        items: [{ gpuModel: 'MI300X', gpuCount: 2 }]
      },
      {
        id: 'data-balanced',
        tierKey: 'templatesModal.tiers.balanced',
        priceTextKey: 'templatesModal.prices.dataScience.balanced',
        bestForKey: 'templatesModal.bestFor.dataScience.balanced',
        tradeoffs: { performance: 70, cost: 42, simplicity: 80 },
        items: [{ gpuModel: 'A100 SXM', gpuCount: 2 }]
      },
      {
        id: 'data-standard',
        tierKey: 'templatesModal.tiers.standard',
        priceTextKey: 'templatesModal.prices.dataScience.standard',
        bestForKey: 'templatesModal.bestFor.dataScience.standard',
        tradeoffs: { performance: 60, cost: 30, simplicity: 86 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 1 }]
      }
    ]
  },
  research: {
    whyThisMattersKey: 'templatesModal.content.research.why',
    keyConsiderationsKeys: [
      'templatesModal.content.research.considerations.0',
      'templatesModal.content.research.considerations.1',
      'templatesModal.content.research.considerations.2',
      'templatesModal.content.research.considerations.3'
    ],
    templates: [
      {
        id: 'research-cutting-edge',
        tierKey: 'templatesModal.tiers.cuttingEdge',
        recommended: true,
        priceTextKey: 'templatesModal.prices.research.cuttingEdge',
        bestForKey: 'templatesModal.bestFor.research.cuttingEdge',
        tradeoffs: { performance: 90, cost: 78, simplicity: 64 },
        items: [{ gpuModel: 'H100 SXM', gpuCount: 2 }]
      },
      {
        id: 'research-professional',
        tierKey: 'templatesModal.tiers.professional',
        priceTextKey: 'templatesModal.prices.research.professional',
        bestForKey: 'templatesModal.bestFor.research.professional',
        tradeoffs: { performance: 78, cost: 54, simplicity: 72 },
        items: [{ gpuModel: 'A100 SXM', gpuCount: 2 }]
      },
      {
        id: 'research-academic',
        tierKey: 'templatesModal.tiers.academic',
        priceTextKey: 'templatesModal.prices.research.academic',
        bestForKey: 'templatesModal.bestFor.research.academic',
        tradeoffs: { performance: 62, cost: 28, simplicity: 86 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 1 }]
      }
    ]
  },
  development: {
    whyThisMattersKey: 'templatesModal.content.development.why',
    keyConsiderationsKeys: [
      'templatesModal.content.development.considerations.0',
      'templatesModal.content.development.considerations.1',
      'templatesModal.content.development.considerations.2',
      'templatesModal.content.development.considerations.3'
    ],
    templates: [
      {
        id: 'dev-team',
        tierKey: 'templatesModal.tiers.team',
        recommended: true,
        priceTextKey: 'templatesModal.prices.development.team',
        bestForKey: 'templatesModal.bestFor.development.team',
        tradeoffs: { performance: 76, cost: 48, simplicity: 86 },
        items: [{ gpuModel: 'RTX 4090', gpuCount: 2 }]
      },
      {
        id: 'dev-standard',
        tierKey: 'templatesModal.tiers.standard',
        priceTextKey: 'templatesModal.prices.development.standard',
        bestForKey: 'templatesModal.bestFor.development.standard',
        tradeoffs: { performance: 64, cost: 34, simplicity: 90 },
        items: [{ gpuModel: 'L40S', gpuCount: 1 }]
      },
      {
        id: 'dev-starter',
        tierKey: 'templatesModal.tiers.starter',
        priceTextKey: 'templatesModal.prices.development.starter',
        bestForKey: 'templatesModal.bestFor.development.starter',
        tradeoffs: { performance: 50, cost: 20, simplicity: 94 },
        items: [{ gpuModel: 'A10', gpuCount: 1 }]
      }
    ]
  }
} as const satisfies Record<UseCaseId, UseCaseTemplateGroup>;
