import { SharedParameterManager } from "./SharedParameterManager";

// オーディオプラグイン（楽器またはエフェクト）の1つのインスタンスを表すクラス
export class AudioPlugin {
  public readonly node: AudioWorkletNode;
  private readonly paramManager: SharedParameterManager;

  private constructor(
    node: AudioWorkletNode,
    paramManager: SharedParameterManager
  ) {
    this.node = node;
    this.paramManager = paramManager;
  }

  static async create(
    context: AudioContext,
    processorName: string,
    parameters: { name: string; defaultValue: number }[],
    wasmURL: string
  ): Promise<AudioPlugin> {
    const paramManager = new SharedParameterManager(parameters);

    const node = new AudioWorkletNode(context, processorName, {
      // 一つのステレオ出力
      outputChannelCount: [2],
      processorOptions: {
        wasmUrl: wasmURL,
        parameterBuffer: paramManager.buffer,
      },
    });

    return new AudioPlugin(node, paramManager);
  }

  // 共有メモリにあるパラメーターをリアルタイムに変更
  public setParameter(name: string, value: number): void {
    this.paramManager.set(name, value);
  }

  public connect(destination: AudioNode): AudioNode {
    return this.node.connect(destination);
  }

  public disconnect(): void {
    this.node.disconnect();
  }
}
