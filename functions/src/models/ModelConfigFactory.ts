import { Models } from '../../../models.json';
import { ModelConfig } from './ModelConfig';

/**
 * Get the model config for the given model
 */
export class ModelConfigFactory {
  /**
   * Returns a model config for the given model
   * @param {string} modelKey model type name
   * @return {ModelConfig} ModelConfig
   */
  static getModelConfig(modelKey: string): ModelConfig {
    for (const model of Models) {
      if (model.key === modelKey) return new ModelConfig(model);
    }
    throw new Error('Model not found');
  }
}
