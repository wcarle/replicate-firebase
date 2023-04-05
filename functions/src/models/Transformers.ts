import axios from 'axios';
import { admin } from '../firebaseAdmin';

import { ModelConfig, ModelProps } from './ModelConfig';

import * as config from '../../../firebase-config.json';

/**
 * Base class for transformers
 */
export class Transformer {
  protected config: ModelConfig;

  /**
   * Create transformer
   * @param {ModelConfig} config Model config
   */
  constructor(config: ModelConfig) {
    this.config = config;
  }
  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    return props;
  }
}

/**
 * DefaultPropsTransformer
 */
export class DefaultPropsTransformer extends Transformer {
  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    return {
      ...this.config.defaults,
      ...props,
    };
  }
}

/**
 * Base class for model configs
 */
export class SingleOutputTransfomer extends Transformer {
  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    return {
      ...props,
      output: Array.isArray(props.output) ? props.output : [props.output],
    };
  }
}

/**
 * AnimationPromptsTransformer
 */
export class AnimationPromptsTransformer extends Transformer {
  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    if (props.prompt) {
      props.animation_prompts = props.prompt;
    }
    return props;
  }
}
/**
 * NumFramesTransformer
 */
export class NumFramesTransformer extends Transformer {
  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    if (props.fps && props.duration) {
      const fps = props.fps as number;
      const duration = props.duration as number;
      props.num_frames = fps * duration;
    }
    return props;
  }
}

/**
 * MaxFramesTransformer
 */
export class MaxFramesTransformer extends Transformer {
  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    if (props.fps && props.duration) {
      const fps = props.fps as number;
      const duration = props.duration as number;
      props.max_frames = fps * duration;
    }
    return props;
  }
}

/**
 * MultiPromptTransformer
 */
export class MultiPromptTransformer extends Transformer {
  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    let prompt = props.prompt as string;
    const splitPrompts = prompt.split('|');
    let numPrompts = splitPrompts.length;
    if (numPrompts === 1) {
      prompt = `${prompt} | ${prompt}`;
      numPrompts++;
    }
    props.prompts = prompt;
    if (props.fps && props.duration) {
      const fps = props.fps as number;
      const duration = props.duration as number;
      props.num_steps = Math.ceil((fps * duration) / (numPrompts - 1));
    }
    return props;
  }
}

/**
 * OutputFileUploadTransformer
 */
export class OutputFileUploadTransformer extends SingleOutputTransfomer {
  protected storage: admin.storage.Storage;
  /**
   * Create transformer
   * @param {ModelConfig} config Model config
   */
  constructor(config: ModelConfig) {
    super(config);
    this.storage = admin.storage();
  }
  /**
   * Get Filename for upload
   * @param {string} path File path
   * @return {string} Full url
   */
  private getFilename(path: string): string {
    return `https://firebasestorage.googleapis.com/v0/b/${
      config.projectId
    }.appspot.com/o/${encodeURIComponent(path)}?alt=media`;
  }

  /**
   * Apply the transformer to the input props
   * @param {ModelProps} props Input props
   * @return {Promise<ModelProps>} Transformed props
   */
  public async transform(props: ModelProps): Promise<ModelProps> {
    const bucket = this.storage.bucket();
    const outputUris = (await super.transform(props)).output as string[];
    const outputFiles: string[] = [];
    const uploadTasks: Promise<void>[] = [];
    let i = 1;
    for (const outputUri of outputUris) {
      const fileRes = await axios.get(outputUri, {
        responseType: 'arraybuffer',
      });
      const filePath = `output/${
        props.id ?? new Date().getTime().toString()
      }_${i++}.${this.config.ext}`;
      // TODO handle other mime types
      const file = bucket.file(filePath);
      uploadTasks.push(
        file.save(fileRes.data, {
          metadata: {
            contentType: this.config.output,
          },
        }),
      );
      outputFiles.push(this.getFilename(filePath));
    }
    console.log(outputFiles);
    await Promise.all(uploadTasks);
    return outputFiles;
  }
}

const transformers = [
  OutputFileUploadTransformer,
  NumFramesTransformer,
  MaxFramesTransformer,
  MultiPromptTransformer,
  AnimationPromptsTransformer,
  Transformer,
];

export default transformers;
