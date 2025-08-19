// SharedArrayBuffer（JSとWASM間の共有メモリ）を管理するクラス

export class SharedParameterManager {
  public readonly buffer: SharedArrayBuffer;
  private readonly view: Float32Array;
  private readonly paramMap: Map<string, number> = new Map();

  constructor(parameters: { name: string; defaultValue: number }[]) {
    // 各floatに4バイトのメモリを割り当てる
    this.buffer = new SharedArrayBuffer(parameters.length * 4);
    this.view = new Float32Array(this.buffer);

    parameters.forEach((param, index) => {
      this.view[index] = param.defaultValue;
      this.paramMap.set(param.name, index);
    });
  }

  // メインスレッドから値を変更
  public set(name: string, value: number): void {
    const index = this.paramMap.get(name);
    if (index !== undefined) {
      this.view[index] = value;
    }
  }
}
