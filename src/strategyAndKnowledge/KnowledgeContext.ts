export interface KnowledgeContext<T extends KnowledgeContext<T>> {
  relevantKnowledgeIds: string[]; // Empty array means no relevant knowledge chosen yet
}
