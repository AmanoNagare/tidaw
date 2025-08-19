/// <reference types="audioworklet" />
import init, { WasmSineProcessor } from "../../../pkg/tidaw_wasm";

class SineProcessor extends AudioWorkletProcessor {
  private wasmProcessor: WasmSineProcessor | null = null;

  constructor(options: AudioWorkletNodeOptions) {
    super();
    const { wasmUrl, parameterBuffer } = options.processorOptions;
    this.initWasm(wasmUrl, parameterBuffer, sampleRate);
  }

  async initWasm(
    wasmUrl: string,
    parameterBuffer: SharedArrayBuffer,
    sampleRate: number
  ) {
    await init();
    this.wasmProcessor = new WasmSineProcessor(parameterBuffer, sampleRate);
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ) {
    if (!this.wasmProcessor) return true;
    // 音だけ出力するのでinputsは使わない
    const outputLeft = outputs[0][0];
    const outputRight = outputs[0][1];

    this.wasmProcessor.process(outputLeft, outputRight);

    return true;
  }
}

registerProcessor("sine-processor", SineProcessor);
