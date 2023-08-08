export interface StrategyContext<T extends StrategyContext<T>> {
  strategyId: string; // Empty string means no strategy chosen yet
}
