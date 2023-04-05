import { TransformerFactory } from './TransformerFactory';
import {
  DefaultPropsTransformer,
  OutputFileUploadTransformer,
  Transformer,
} from './Transformers';

/**
 * Model properties
 */
export type ModelProps = Record<string, any>;

/**
 * Model config json
 */
type ModelConfigJson = {
  id: string;
  key: string;
  name: string;
  defaults: ModelProps;
  output: string;
  ext: string;
  inputTransformers: Array<string>;
  outputTransformers: Array<string>;
};

/**
 * Base class for model configs
 */
export class ModelConfig {
  public id: string;
  public key: string;
  public name: string;
  public defaults: ModelProps;
  public output: string;
  public ext: string;
  public inputTransformers: Transformer[];
  public outputTransformers: Transformer[];

  /**
   * Create a model config
   * @param {ModelConfigJson} config Model config json
   */
  constructor(config: ModelConfigJson) {
    this.id = config.id;
    this.key = config.key;
    this.name = config.name;
    this.defaults = config.defaults;
    this.output = config.output;
    this.ext = config.ext;

    this.inputTransformers = [
      new DefaultPropsTransformer(this),
      ...config.inputTransformers.map((t) => {
        return TransformerFactory.getTransformer(this, t);
      }),
    ];
    this.outputTransformers = [
      new OutputFileUploadTransformer(this),
      ...config.outputTransformers.map((t) => {
        return TransformerFactory.getTransformer(this, t);
      }),
    ];
  }

  /**
   * Apply the transformers to the props
   * @param {ModelProps} props Input props
   * @param {Transformer[]} transformers Transformers to apply
   * @return {ModelProps} Transformed props
   */
  private async transform(
    props: ModelProps,
    transformers: Transformer[],
  ): Promise<ModelProps> {
    for (const transformer of transformers) {
      props = await transformer.transform(props);
    }
    return props;
  }

  /**
   * Apply the input transformers to the props
   * @param {ModelProps} input Input props
   * @return {ModelProps} Transformed props
   */
  public async transformInput(input: ModelProps): Promise<ModelProps> {
    return this.transform(input, this.inputTransformers);
  }

  /**
   * Apply the output transformers to the props
   * @param {ModelProps} output Output props
   * @return {ModelProps} Transformed props
   */
  public async transformOutput(output: ModelProps): Promise<ModelProps> {
    return this.transform(output, this.outputTransformers);
  }
}
