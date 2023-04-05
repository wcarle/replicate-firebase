import { ModelConfig } from './ModelConfig';
import transformers, { Transformer } from './Transformers';

/**
 * Get the transformer for the given transformer type
 */
export class TransformerFactory {
  /**
   * Get a transformer instance
   * @param {ModelConfig} config Model config from json
   * @param {string} transformerType Transformer type name
   * @return {Transformer} Transformer instance
   */
  public static getTransformer(
    config: ModelConfig,
    transformerType: string,
  ): Transformer {
    for (const TransformerType of transformers) {
      if (TransformerType.name === transformerType)
        return new TransformerType(config);
    }
    return new Transformer(config);
  }
}
