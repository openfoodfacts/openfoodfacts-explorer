export type {
  KnowledgePanel,
  KnowledgePanels,
  KnowledgePanelTitle,
  KnowledgePanelSize,
  KnowledgeElement,
  KnowledgeElementBase,
  KnowledgeTextElement,
  KnowledgeImageElement,
  KnowledgePanelGroupElement,
  KnowledgePanelImage,
  KnowledgePanelImageSize,
  KnowledgePanelElement,
  KnowledgeTableElement,
  KnowledgePanelTableRow,
  KnowledgeTableColumn,
  KnowledgeActionElement,
  KnowledgeMapElement,
  KnowledgeMapElementPointer,
} from '@openfoodfacts/openfoodfacts-nodejs';

export const KNOWLEDGE_PANEL_TOPICS = ['health', 'environment', 'problem'] as const;
export type KnowledgePanelTopic = (typeof KNOWLEDGE_PANEL_TOPICS)[number];

export const KNOWLEDGE_PANEL_EVALUATIONS = ['good', 'average', 'neutral', 'bad', 'unknown'] as const;
export type KnowledgePanelEvaluation = (typeof KNOWLEDGE_PANEL_EVALUATIONS)[number];