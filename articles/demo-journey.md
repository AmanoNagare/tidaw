ブラウザ上で動く DAW（Digital Audio Workstation）プロジェクトを作ろうとしています。

フロントエンドは React と Typescript を使い、オーディオ処理は Rust WASM で行います。

> WebAssembly（WASM）は、C や Rust などの言語で書かれたコードをブラウザで実行できるようにする技術です。

なぜかというと、ブラウザの JavaScript はシングルスレッド言語であり、一度に一つのことしか処理できないからです。オーディオ処理は重い計算タスクなので、オーディオ処理を実行する別のスレッドを作成する予定です。また、高速で知られる Rust 言語を使う予定です。

しかし、音を出す前に、まずプロジェクト全体の構造を考える必要があります。

フロントエンドがオーディオ処理をどのように管理し、対話するのか。ユーザーのインタラクションとデータがどのように表現され、処理されるのか。それらがスレッド間でどのように受け渡されるのか、などです。

最初は、フロントエンドをユーザーインターフェースと「バックエンド」への命令のみに専念させるようなことを考えました。ここでのバックエンドとは、オーディオ処理とユーザーデータ管理の両方を担当する Rust WASM のことです。

しかし、WASM プロセスを常駐するのはあんまり良くないことがわかりました。また、データ/ステート（状態）管理は UI と深く統合されており、直接変更できるため、フロントエンドで行う方が簡単です。UI のステート管理をバックエンドで行うのは意味がありません。

そこで、このアプローチを採用することにしました。アプリのステート管理のようなもののほとんどは、ステート管理ライブラリなどを使用してフロントエンドで処理されます。Rust WASM の役割は、純粋にオーディオ処理のためだけになりました。

アプリの構造の全体像が決まった後、今度はスピーカーにオーディオを出力するという、一見単純なプロセスでつまずきました。

最初は、オーディオがどのように処理されるのか見当もつきませんでした。DAW ソフトウェアの経験も十分にありませんでした。

AudioWorklet は、最小限のレイテンシーでスピーカーにオーディオデータを出力する方法（または唯一の方法）です。この種のアプリはリアルタイムでオーディオを処理するため、これを使用する必要があります。しかし、もちろん、それには独自の課題が伴います。たとえば、別のスレッド上にあるため、オーディオデータを効率的に渡す方法が必要です。

単純なスレッド間メッセージオブジェクトはここでは使えません。なぜなら、毎回処理が必要なので遅すぎるからです。そこで登場するのが SharedArrayBuffer です。その仕組みは共有のホワイトボードのようなものです。すべてのスレッドがそれに書き込んだり、読み取ったりできます。オーディオデータをそれに書き込み、AudioWorklet スレッドが常にその値の変更を監視するようにすることで、リアルタイムのオーディオ出力を実現する予定です。

最後の障害は、Rust WASM の扱いです。私たちはそれについての経験がありません。まあ、少なくともその仕事は単純です。コマンドを受け取り、**オーディオを生成**し、それを共有メモリに書き込む。少なくともそれが計画です。オーディオの生成については、そんなに単純ではないかもしれないと気づいています。しかし、少なくとも、オーディオ生成部分はアプリの他の隔離された部分として活用できるので、後で考えることもできます。

AudioWorklet、SharedArrayBuffer、そして Rust WASM の 3 つは、JavaScript のメインスレッドの他に、中心となるコンポーネントです。

ここから、アプリの簡単なデモの作成を始めたいと思います。フロントエンドには再生/一時停止ボタンと、オーディオ出力の周波数を制御するシンプルなスライダーがあります。これで基本的な正弦波を出力します。

主なコンポーネントは 4 つあります。

- React フロントエンド（Typescript）：UI の描画、現在の周波数値のステートの管理、他のコンポーネントの制御。
- SharedArrayBuffer：すべてのコンポーネント間の共有メモリ。
- Rust WASM：オーディオを生成し、共有メモリに書き込む。
- AudioWorklet：共有メモリからスピーカーへリアルタイムでオーディオデータを出力する。

計画は次のとおりです。

1.  UI に基本的な再生/一時停止ボタンと周波数コントローラースライダーを作成する。
2.  各コンポーネントを一つずつ初期化する：AudioWorklet、SharedArrayBuffer、Rust WASM。
3.  すべてのコンポーネントを連携して動作させる：
    - フロントエンドが SharedArrayBuffer 共有メモリを初期化する。
    - フロントエンドが AudioWorklet スレッドを作成し、AudioWorklet スレッドに共有メモリの場所を伝え、そこからデータを読み取ってスピーカーにオーディオを出力できるように準備させる。
    - フロントエンドが Rust WASM スレッドを作成し、Rust WASM スレッドに共有メモリの場所を伝え、そこにオーディオデータを書き込めるように準備させる。
    - フロントエンドが UI 要素を接続して各コンポーネントを制御する。

しかし、待ってください。Rust WASM のセットアップは少し複雑であることに気づきました。ここで書くと、長くなってしまうかもしれません。そこで、スピーカーにオーディオを正常に出力できるようになるまで、オーディオデータの生成には単純な Typescript 関数を使用することにしました。後で Rust WASM モジュールを簡単にロードできます。

#### 1. UI の構築

まず UI の構築から始めます。出発点として Vite を使用します。

`npm create vite@latest`

（このガイドに従います：https://vite.dev/guide/#scaffolding-your-first-vite-project）

> Vite は、React などモダンなフロントエンド開発のためのビルドツールです。高速なホットモジュールリプレースメント（HMR）や最適化されたビルドプロセスなど、便利な機能がたくさんあります。

次に、従来の CSS の代わりに Tailwind を使用します。なぜかというと、従来の CSS はファイルが散らかって見づらくなるので、コンポーネント内に直接スタイリングを記述できる Tailwind を使用します。

`npm install tailwindcss @tailwindcss/vite`

（このガイドに従います：https://tailwindcss.com/docs/installation/using-vite）

次に、Tailwind と SharedArrayBuffer が機能するように`vite.config.ts`ファイルを変更する必要があります。

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // <---

export default defineConfig({
  plugins: [react(), tailwindcss()], // <---

  // これも
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
```

> 実際には、これはデモンストレーション用なので、実際の実装と区別するために、デフォルトの`App.tsx`の代わりに`Demo.tsx`を使用します。私は実際に、`npm run dev:demo`という特別なコマンドで実行されたときに`App.tsx`の代わりに`Demo.tsx`をロードするように、`main.tsx`と`package.json`を変更してプロジェクトをセットアップしました。しかし、本質的に`Demo.tsx`は`App.tsx`と同じです。

基本的な UI の構築を始めましょう。

```tsx
// Demo.tsx
export default function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [frequency, setFrequency] = React.useState(50);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <input
        type="range"
        min="0"
        max="20000"
        className="w-40 accent-blue-600"
        value={frequency}
        onChange={(e) => setFrequency(Number(e.target.value))}
      />
      <span className="text-white">{frequency}</span>
    </div>
  );
}
```

これは、オーディオ出力の周波数を制御するための単純な再生/一時停止ボタンとスライダーコンポーネントです。これらを AudioWorklet、SharedArrayBuffer、および Rust WASM を使用したオーディオ処理ロジックの実際の実装に接続します。

#### 2. 各コンポーネントの初期化

次に、同じ `Demo.tsx` ファイル内に `setupAudio()`関数を作成し、AudioWorklet と WASM スレッドを作成し、SharedArrayBuffer 共有メモリを初期化します。

AudioWorklet を初期化するには、`AudioContext` が必要です。これは、Web でオーディオを管理および再生するための本質的なメインオブジェクトおよびインターフェースです。アプリのメインスレッド全体で使用されると思うので、一度作成して再利用するのが良いでしょう。安定した場所に配置します。

また、WASM スレッドを保持するための `Worker` インスタンスも必要になります。

これらを `App` コンポーネント内で `useRef()`を使用して記述しましょう。

```tsx
// Demo.tsx
export default function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [frequency, setFrequency] = React.useState(50);

  // ここ
  const audioStuff = React.useRef({
    audioContext: null as AudioContext | null,
    worker: null as Worker | null
  });

  return (
    // ...
  );
}
```

なぜ `useRef()`かというと、React はコンポーネントをレンダリングするためにコンポーネントの関数(`App`)を呼び出すので、UI コンポーネントの再レンダリングをまたいで永続化され、同じオブジェクトの複数回の初期化を防ぐためです。そのプロパティには`audioStuff.current`を使用してアクセスできます。

次に、`audioStuff`のすぐ下に、App コンポーネント内で他のコンポーネントを初期化するための `setupAudio()`関数を作成しましょう。

```ts
// Demo.tsx
export default function App() {
  // ...

  const audioStuff = React.useRef({
    audioContext: null as AudioContext | null
  });

  // ここ
  async function setupAudio() {
    audioStuff.current.audioContext = new window.AudioContext(); // 1

    // 2
    const sampleRate = audioStuff.current.audioContext.sampleRate;
    const bufferSize = sampleRate * 1 * 2; // 1秒のバッファ、2チャンネル
    const sab = new SharedArrayBuffer(
      bufferSize * Float32Array.BYTES_PER_ELEMENT
    );

    // 3
    await audioStuff.current.audioContext.audioWorklet.addModule(
      new URL("./Demo.workletmodule.ts", import.meta.url)
    );

    // 4
    const workletNode = new AudioWorkletNode(audioStuff.current.audioContext, "demo-processor", {
      processorOptions: { sab },
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });

    workletNode.connect(audioStuff.current.audioContext.destination); // 5

    audioStuff.current.worker = new Worker(new URL("./Demo.worker.ts", import.meta.url), {
      type: "module"
    });  // 6

    audioStuff.current.worker.postMessage({
      sab,
      sampleRate
    }); // 7
  }

  return (
    // ...
  );
}
```

1.  `AudioContext` インスタンスを作成します。
2.  `SharedArrayBuffer` インスタンスを作成します。これはすべてのスレッド間の共有メモリになります。ステレオオーディオデータを 1 秒間保持するようにしましょう。
3.  `AudioWorkletNode` インスタンスをロードします（後で作成する `Demo.workletmodule.ts` です）。これがオーディオデータをスピーカーで出力するスレッドになります。
4.  "demo-processor"という名前の `AudioWorklet` スレッドを作成し、`SharedArrayBuffer` をその `processorOptions` に渡します。
5.  `AudioWorkletNode` を `AudioContext` の宛先（スピーカー）に接続します。
6.  `Worker` スレッドを作成します。このスレッドはオーディオデータを生成する `Demo.worker.ts` ファイルを実行します。後で作成します。
7.  `SharedArrayBuffer` と `sampleRate` を `Worker` スレッドに渡します。

オーディオを処理し出力できる実際の `AudioWorklet` インスタンスを作成する必要があります。新しい`Demo.workletmodule.ts`ファイルを作成しましょう。上記の 3 番で既にロードされています。

```ts
// Demo.workletmodule.ts
class SabPlayerProcessor extends AudioWorkletProcessor {
  sab: SharedArrayBuffer;
  audioData: Float32Array;
  readIndex: number;

  constructor(options: {
    processorOptions: {
      sab: SharedArrayBuffer;
    };
  }) {
    super();
    this.sab = options.processorOptions.sab;
    this.audioData = new Float32Array(this.sab);
    this.readIndex = 0;
  }

  process(_: Float32Array[][], outputs: Float32Array[][]) {
    const output = outputs[0];
    const leftChannel = output[0];
    const rightChannel = output[1];

    for (let i = 0; i < leftChannel.length; i++) {
      leftChannel[i] = this.audioData[this.readIndex];
      rightChannel[i] = this.audioData[this.readIndex + 1];

      this.readIndex = (this.readIndex + 2) % this.audioData.length;
    }

    return true;
  }
}

registerProcessor("demo-processor", SabPlayerProcessor);
```

`options.processorOptions`には、初期化中にメインスレッドから渡されたオブジェクトが含まれています。この場合、`sab`（SharedArrayBuffer）共有メモリを受け入れます。

`process()`関数は 2 つの配列、`inputs`と`outputs`を受け入れます。これはサンプルごと（約 2 ミリ秒）に実行され、音を出力するために`outputs`配列に書き込みます。今回は、共有メモリ`this.audioData`を読み取り、その内容を直接`outputs`に書き込むだけです。

次に、オーディオを生成するための（そして後で WASM モジュールをホストするための）`Demo.worker.ts`ファイルも作成する必要があります。作成しましょう。上記の 6 番で既にロードされています。

```ts
// Demo.worker.ts
self.onmessage = (event) => {
  const { sab, sampleRate } = event.data;

  const audioData = new Float32Array(sab);

  startWritingData(audioData, sampleRate);
};
```

これはメインスレッドから渡された`sab`と`sampleRate`を受け取り、それを使って `startWritingData()`関数を実行します。

同じファイルに、`audioData` SharedArrayBuffer にオーディオデータを書き込むための `startWritingData()`関数を作成しましょう。これには単純な正弦波ジェネレーターを使用します。

> 後の実装では、これを実際の Rust WASM モジュールへの呼び出しに置き換えます。

```ts
// Demo.worker.ts
function startWritingData(audioData: Float32Array, sampleRate: number) {
  let writeIndex = 0;
  let phase = 0;
  const frameCount = 1024;

  setInterval(() => {
    const frequency = "???"; // <---

    for (let i = 0; i < frameCount; i++) {
      const sample = Math.sin((2 * Math.PI * frequency * phase) / sampleRate);
      const pos = (writeIndex + i * 2) % audioData.length;
      audioData[pos] = sample * 0.5; // left
      audioData[(pos + 1) % audioData.length] = sample * 0.5; // right

      phase++;
      if (phase >= sampleRate) phase -= sampleRate;
    }

    writeIndex = (writeIndex + frameCount * 2) % audioData.length;
  }, 20);
}
```

これは基本的に、ステレオの正弦波を生成し、20 ミリ秒ごとに`audioData` SharedArrayBuffer に書き込むものです。

> 「???」に気づきましたか？すぐに説明します。

#### 3. すべてを連携する

この時点で、初期化セットアップ中に各コンポーネントがすでに連携しています。

- 「フロントエンドが SharedArrayBuffer 共有メモリを初期化する。」
  - `new SharedArrayBuffer()`を使用して作成しました。
- 「フロントエンドが AudioWorklet スレッドを作成し、AudioWorklet スレッドに共有メモリの場所を伝え、そこからデータを読み取ってスピーカーにオーディオを出力できるように準備させる。」
  - `Demo.workletmodule.ts`で動作する AudioWorklet を作成し、`audioWorklet.addModule()`を使用してロードし、`processorOptions`オプションで共有メモリの場所を渡しました。
- 「フロントエンドが Rust WASM スレッドを作成し、Rust WASM スレッドに共有メモリの場所を伝え、そこにオーディオデータを書き込めるように準備させる。」
  - 現在の実装では Rust の代わりに Typescript 関数を使用していますが、Worker スレッドも作成しました。`new Worker()`を使用してロードし、`worker.postMessage()`を使用して共有メモリの場所を渡しました。
- 「フロントエンドが UI 要素を接続して各コンポーネントを制御する。」
  - まだです。

次に、`setupAudio()`関数の呼び出しから始めます。すべてを開始するには、実際にそれを呼び出す必要があるでしょう。

ブラウザのポリシーにより、オーディオ再生を開始するにはユーザーのジェスチャーが必要なため、直接呼び出すことはできないことがわかりました。そのため、オーディオをセットアップするための新しいボタンを作成する必要があります。ユーザーがクリックしてオーディオが正常にセットアップされると、このボタンは消えます。

このボタンをコンポーネントに追加しましょう。ユーザーがこのボタンをクリックしたときに`setupAudio()`関数を呼び出します。

```tsx
export default function App () {
  // ...
  const [isSetup, setIsSetup] = useState(false); // <---

  // ...

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      { // ここ ↓
        !isSetup && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={async () => {
              await setupAudio(); // <---
              setIsSetup(true);
            }}
          >
            Setup Audio
          </button>
        )
      }
    // ...
  );
}
```

先ほどの`frequency`変数の「???」に気づきましたか？ステートから実際の周波数値が必要で、それを動的にしたいです。作成したばかりのスライダーに接続しようと思います。

しかし、待ってください。実際の実装では、オーディオ生成関数は別のスレッドにあるため、単純に React のステートやグローバル変数を使用することはできません。また、スレッド間メッセージオブジェクトも使用できません。なぜなら、高速な更新には遅すぎるからです。周波数値をスレッドと共有する方法を見つける必要があります。まあ、この目的のためには再び共有メモリを使用する必要があると思います。

とはいえ、別の共有メモリを導入するということは、複数の共有メモリを管理する必要があるということです。それはすでに複雑に聞こえます。実際の実装では、周波数だけでなく沢山のパラメータを管理する必要があります。しかし、今のところはデモンストレーション用なので、とにかくやってみましょう。

JavaScript にはすでに何百万ものライブラリがあるので、それを簡素化するライブラリがあるのではないか

...

そして、これを見つけました：https://github.com/pverscha/SharedCore

見てください！

```ts
// main thread
const sharedMap = new ShareableMap<string, number>();

sharedMap.set("x", 45);

const worker = new Worker();

worker.postMessage({ myMapState: sharedMap.toTransferableState() });
```

```ts
// worker thread
self.onmessage = async (event) => {
  const sharedMap = ShareableMap.fromTransferableState<string, number>(
    event.data.myMapState
  );

  console.log(`Value for key "x" is: ${sharedMap.get("x")}`); // 45
};
```

これにより、スレッド間の共有メモリの作成と管理、特に複数の値の場合に大幅に簡素化されます。

オーディオデータの共有メモリの実装も簡素化できるのかな

...

うーん、実際には、それは良くないです。AudioWorklet で使用される共有メモリは、その値が非常に頻繁に変化するため、慎重に管理する必要があります。別の抽象化レイヤーを導入すると、事態がさらに複雑になる可能性があります。

他の共有ステートの管理にはこのライブラリを使用し、オーディオ関連の共有メモリ管理はそのままにしておきましょう。

インストール
`npm install shared-memory-datastructures`
そしてインポートします
`import { ShareableMap } from "shared-memory-datastructures";`

次に、スライダーを、ワーカーという遠い国のスレッドに定住する `startWritingData()`関数の`frequency`変数に接続しましょう。

まず、すべてのオーディオ関連パラメータを保持する`sharedState` ShareableMap を作成することから始めます。これを先ほどの`worker`と`audioContext`と同じ場所に配置します。

```ts
// Demo.tsx
export default function App() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  // ...

  const audioStuff = React.useRef({
    worker: null as Worker | null,
    audioContext: null as AudioContext | null,
    sharedState: new ShareableMap<string, number>(), // <---
  });

  async function setupAudio() {
  // ...
```

次に、スライダー要素を変更して、`sharedState`マップの`frequency`フィールドを更新するようにします。

```tsx
// Demo.tsx
<input
  type="range"
  min="0"
  max="20000"
  className="w-40 accent-blue-600"
  value={frequency}
  onChange={(e) => {
    const v = Number(e.target.value);
    setFrequency(v);
    audioStuff.current.sharedState.set("frequency", v); // <---
  }}
/>
```

`frequency`パラメータは、`sharedState.get("frequency")`で使用できるようになりました。

次に、`startWritingData()`が`sharedState`をパラメータとして受け入れるようにします。渡す前に、`sharedState`を転送可能な形式に変換し、それを再び使用可能な形式に変換してから、`frequency`変数に代入する必要があります。

```ts
// Demo.worker.ts
import { ShareableMap, type TransferableState } from "shared-memory-datastructures"; // <---

function startWritingData(
    audioData: Float32Array,
    sampleRate: number,
    sharedMemory: TransferableState // <---
) {
  let writeIndex = 0;
  // ...

  const sharedState = ShareableMap.fromTransferableState<string, number>(sharedMemory); // <---

  setInterval(() => {
    const frequency = sharedState.get("frequency") ?? 440; // <---

    for (let i = 0; i < frameCount; i++) {
      // ...
```

`setupAudio()`関数のワーカーセットアップを更新して、新しいパラメータを含めることを忘れずに。

```ts
// Demo.tsx
audioStuff.current.worker.postMessage({
  sab,
  sampleRate,
  sharedMemory: audioStuff.current.sharedState.toTransferableState(), // <---
}); // 7
```

これで、再生/一時停止ボタンと周波数スライダーを備えた単純なオーディオ出力アプリの動作するデモができたはずです。

...

うーん、実際には再生/一時停止ボタンの実装を忘れていました。

しかし、心配しないでください。現在の再生/一時停止状態を示す`isPlaying`ステートはすでにあります。また、`sharedState`共有メモリをワーカーに渡しました。`frequency`パラメータで行ったように、ステートをワーカーに渡して現在の再生/一時停止状態を通知するだけで、メインスレッドから制御できます。

再生/一時停止ボタンが実際に`sharedState`マップの`isPlaying`フィールド値を変更するようにしましょう。

```tsx
<button
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  onClick={() => {
    audioStuff.current.sharedState.set("isPlaying", isPlaying ? 0 : 1); // <---
    setIsPlaying(!isPlaying);
  }}
>
  {isPlaying ? "Pause" : "Play"}
</button>
```

ボタンが実際に`sharedState`マップの`isPlaying`フィールドの値を変更するようになったので、ワーカースレッドは即座に変更に反応できます！

次に、`startWritingData()`オーディオジェネレーター関数が`isPlaying`の値の変更に反応できるようにしましょう。`isPlaying`の値が 0 の場合、無音を出力するようにします。

```ts
// Demo.worker.ts
function startWritingData(audioData: Float32Array, sampleRate: number, sharedMemory: TransferableState) {
  // ...

  setInterval(() => {
    const frequency = sharedState.get("frequency") ?? 440;
    const isPlaying = sharedState.get("isPlaying") === 1; // <---

    // `isPlaying`が0の場合、無音を出力する
    if (!isPlaying) {
      for (let i = 0; i < frameCount; i++) {
        const pos = (writeIndex + i * 2) % audioData.length;
        audioData[pos] = 0; // left
        audioData[pos + 1] = 0; // right
      }
      writeIndex = (writeIndex + frameCount * 2) % audioData.length;
      return;
    }

    for (let i = 0; i < frameCount; i++) {
      // ...
    }

    // ...
  }, 20);
}

self.onmessage = (event) => {
// ...
```

> もちろん、再生/一時停止機能を実装する別の方法もあります。その 1 つは、`audioContext.suspend()`と`audioContext.resume()`を使用して audioContext を直接一時停止することです。これは単純に見えますが、実際には audioContext 全体を一時停止していることになり、スピーカーを完全にミュートします。最終的にはそれを使用したいかもしれませんが、今のところは現在の実装に固執しましょう。

これで、アプリの動作するデモができたはずです。`npm run dev`コマンドでアプリを実行できます。

...

アプリをテストしたところ、うまく動作しているようです。オーディオ出力は正しく生成され、再生/一時停止ボタンは機能しています...

ただ、再生/一時停止ボタンが遅延しているようです。

私たちの実装では大きなオーディオバッファがあるため、これはある程度予想されることでした。再生/一時停止ボタンがクリックされると、AudioWorklet は、新しく追加された無音に到達する前に、バッファにすでに待機している小さなオーディオブロックをすべて再生する必要があります。

これは、オーディオジェネレーターが一方の端で水タンク（バッファ）に大量の水（オーディオデータ）を投入し、AudioWorklet がもう一方の端からそれを飲んでいるようなものです。オーディオジェネレーターが水の投入（データの生成）を止めた後も、AudioWorklet はタンクに残っている水（バッファ内のデータ）をすべて飲み干すまで再生が続きます。

また、プレーヤーを開始するときに迷惑なクリック/ポップ音があることに気づくかもしれません。これは、オーディオデータ共有の実装に問題があることを意味します。

いくつかの調査の結果、私たちのアプリはプロデューサー・コンシューマーと呼ばれるパターンを使用していることがわかりました。このパターンでは、2 つのスレッドがあり、そのうちの 1 つがデータプロデューサー、もう 1 つがデータコンシューマーです。このパターンでは、共有メモリの問題を解決するための最も一般的なアプローチは、**リングバッファ**を実装することです。

リングバッファは、プロデューサーがデータを投入し、コンシューマーが同期的にデータを取得する円形のコンベヤーベルトのようなものです。リングバッファのサイズは固定で、いっぱいになると、プロデューサーはデータを更に追加するには、コンシューマーがデータを消費するまで待つ必要があります。バッファの終わりに達すると、最初に戻るため、リングバッファと呼ばれ、バッファサイズは固定されたままです。

これを実装するには、書き込みポインターと読み取りポインターという 2 つの共有ポインターが必要です。プロデューサーは書き込みポインターの位置でバッファにデータを書き込み、書き込みポインターを進めます。コンシューマーは読み取りポインターの位置でバッファからデータを読み取り、読み取りポインターを進めます。

書き込みポインターが読み取りポインターに追いつくと、バッファがいっぱいであることを意味し、プロデューサーは待機する必要があります。読み取りポインターが書き込みポインターに追いつくと、バッファが空であることを意味し、コンシューマーは待機する必要があります。

このようにして、両方のスレッドが同期されます。

実装しましょう。まず、ポインターを保持するための新しい SharedArrayBuffer が必要です。次に、それを両方のスレッドに渡します。

```ts
// Demo.tsx
async function setupAudio() {
  // ...

  // ここ ↓
  const pointersSAB = new SharedArrayBuffer(
    Int32Array.BYTES_PER_ELEMENT * 2 // 2つのint値を格納
  );

  // ...

  const workletNode = new AudioWorkletNode(
    audioStuff.current.audioContext,
    "demo-processor",
    {
      processorOptions: {
        sab,
        pointersSAB, // <---
      },
      numberOfOutputs: 1,
      outputChannelCount: [2],
    }
  );

  // ...

  audioStuff.current.worker.postMessage({
    sab,
    sampleRate,
    sharedMemory: audioStuff.current.sharedState.toTransferableState(),
    pointersSAB, // <---
  });
}
```

次に、リングバッファを使用するようにオーディオジェネレーターを完全に書き直す必要があります。共有バッファにオーディオデータを書き込む方法と、読み取りおよび書き込みポインターを管理する方法を変更します。

```ts
// Demo.worker.ts
function startWritingData(
  audioData: Float32Array,
  sampleRate: number,
  sharedMemory: TransferableState,
  pointers: Int32Array // <---
) {
  const sharedState = ShareableMap.fromTransferableState<string, number>(
    sharedMemory
  );

  let phase = 0;

  function process() {
    // 1
    const readPointer = Atomics.load(pointers, 0);
    const writePointer = Atomics.load(pointers, 1);

    // 2
    const availableWrite =
      (readPointer - writePointer - 1 + audioData.length) % audioData.length;

    // 3
    if (sharedState.get("isPlaying") !== 1) {
      setTimeout(process, 10);
      return;
    }

    // 4
    const bytesToWrite = Math.min(availableWrite, 2048);
    if (bytesToWrite > 0) {
      const frequency = sharedState.get("frequency") || 440;
      const buffer = new Float32Array(bytesToWrite);

      // 5
      for (let i = 0; i < bytesToWrite; i += 2) {
        const sample =
          Math.sin((2 * Math.PI * frequency * phase) / sampleRate) * 0.5;
        buffer[i] = sample; // left
        buffer[i + 1] = sample; // right
        phase = (phase + 1) % sampleRate;
      }

      // 6
      let currentWritePointer = writePointer;
      for (let i = 0; i < bytesToWrite; i++) {
        audioData[currentWritePointer] = buffer[i];
        currentWritePointer = (currentWritePointer + 1) % audioData.length;
      }

      // 7
      Atomics.store(pointers, 1, currentWritePointer);
    }

    // 8
    setTimeout(process, 0);
  }

  process();
}

self.onmessage = (event) => {
  const { sab, sharedMemory, sampleRate, pointersSAB } = event.data;

  const audioData = new Float32Array(sab);
  const pointers = new Int32Array(pointersSAB); // <---

  startWritingData(audioData, sampleRate, sharedMemory, pointers);
};
```

`setInterval()`の代わりに、`setTimeout()`を使用して自身を呼び出す関数を使用します。これは再帰的ですが、`setTimeout()`で呼び出された関数は異なるコンテキストで実行されるため、コールスタックを消費しません。これにより、ループが作成されます。`setInterval()`は、ブラウザによって遅延される可能性があるため、このユースケースでは信頼性が低くなります。

また、`Atomics`を使用していることにも気づくかもしれません。なぜなら、読み取り/書き込み操作をスレッド間で一度に 1 つずつ実行したいからです。他のスレッドが干渉して、競合状態と呼ばれる状態を引き起こすことを防ぎます。

1.  `Atomics`を使用して共有メモリ内のポインターデータをロードします。書き込みポインターはインデックス`0`に、読み取りポインターはインデックス`1`に格納されます。
2.  書き込み可能な利用可能なスペースを計算します。これは、読み取りポインターがまだ到達していないスペースです。読み取りポインターを追い越さないようにしたいです。
3.  一時停止状態の場合は、何もしないで 10 ミリ秒待ってから関数を再実行します。
4.  書き込み可能な利用可能なスペースがあるかどうかを確認します。応答性を保つために、妥当な制限内に保ちたいです。
5.  オーディオサンプルを生成し、バッファに書き込みます。
6.  バッファの内容を出力（`audioData`）に書き込みながら、反復ごとに書き込みポインターを 1 つ進めます。
7.  更新された書き込みポインターを`Atomics`を使用して共有メモリに保存します。
8.  関数をすぐに再実行します。

次に、AudioWorklet スレッドも完全に書き直す必要があります。以前と似ていますが、この場合は読み取りポインターを進めて共有メモリに保存し直すだけで、書き込みポインターを追い越さないようにする必要があります。

```ts
// Demo.workletmodule.ts
class SabPlayerProcessor extends AudioWorkletProcessor {
  sab: SharedArrayBuffer;
  audioData: Float32Array;
  pointersSAB: SharedArrayBuffer;
  pointersData: Int32Array;

  constructor(options: {
    processorOptions: {
      sab: SharedArrayBuffer;
      pointersSAB: SharedArrayBuffer;
    };
  }) {
    super();
    this.sab = options.processorOptions.sab;
    this.audioData = new Float32Array(this.sab);
    this.pointersSAB = options.processorOptions.pointersSAB;
    this.pointersData = new Int32Array(this.pointersSAB);
  }

  process(_: Float32Array[][], outputs: Float32Array[][]) {
    const output = outputs[0];
    const leftChannel = output[0];
    const rightChannel = output[1];

    let readPointer = Atomics.load(this.pointersData, 0);
    const writePointer = Atomics.load(this.pointersData, 1);

    const availableRead =
      (writePointer - readPointer + this.audioData.length) %
      this.audioData.length;

    if (availableRead < leftChannel.length * 2) {
      return true;
    }

    for (let i = 0; i < leftChannel.length; i++) {
      leftChannel[i] = this.audioData[readPointer];
      rightChannel[i] =
        this.audioData[(readPointer + 1) % this.audioData.length];
      readPointer = (readPointer + 2) % this.audioData.length;
    }

    Atomics.store(this.pointersData, 0, readPointer);

    return true;
  }
}

registerProcessor("demo-processor", SabPlayerProcessor);
```

次に、アプリを実行してみます。これでうまくいくはずです。

...

オーディオの再生（プレイ）は即座に機能します。遅延はまったくありません。しかし、一時停止については、常に約 1 秒の遅延があります。

オーディオの即時再生は、リングバッファの実装が機能していることを示しています。バッファにオーディオデータがない場合、コンシューマー（AudioWorklet）スレッドはデータが書き込まれるまで待っています。メモリにデータが書き込まれるとすぐに、それを読み取り始めます。

しかし、一時停止の場合、遅延はプロデューサー（ワーカースレッド）がバッファ全体を瞬時に埋めることによって引き起こされます。この記事の最初の方で、共有メモリバッファのサイズを「1 秒分のオーディオデータ」に設定していました。

```ts
// Demo.tsx
const sampleRate = ....audioContext.sampleRate;
const bufferSize = sampleRate * 1 * 2; // <--- 1秒 * 2チャンネル
const sab = new SharedArrayBuffer( ... );
```

次に、ワーカースレッドは、利用可能なスペースがあるとすぐにバッファ全体を埋めています。

```ts
// Demo.worker.ts
if (bytesToWrite > 0) {
  for (let i = 0; i < bytesToWrite; i += 2) {
    const sample = Math.sin( ... ) * 0.5;
    buffer[i] = sample; // left
    buffer[i + 1] = sample; // right
    phase = ...
  }
```

`isPlaying`の値が`0`になると、プロデューサーはオーディオデータの生成を停止します。しかし、バッファにはすでに 1 秒分のオーディオデータが書き込まれているため、コンシューマーが読み取るためのオーディオデータがまだ残っています。これにより、一時停止ボタンをクリックした後もオーディオが再生され続けます。

この実装では、遅延を導入せずに再生をすぐに停止する方法はありません。遅延を減らす唯一の方法は、バッファサイズを小さくすることです。

共有メモリサイズを 0.1 秒に減らすことで、残ったオーディオの長さを 0.1 秒に短縮できます。

```ts
const bufferSize = sampleRate * 0.1 * 2;
```

> `audioContext.suspend()`メソッドを使用してオーディオ出力をグローバルにすぐにミュートしても、もちろん遅延は発生しません。しかし、その方法に固執していたら、ここまで（バッファリングなどについて）学ぶことはなかったでしょう　:)

これでうまくいくはずです。

しかし、再生を開始したり停止したりすると、まだポップ音が発生していますね。これは、オーディオデータの急激な変化が原因です。0（無音）からある値に瞬時に移行するため、スピーカーからはクリック音として出力されます。これを解決するには、ある種のトランジション効果が必要になりますが、これはより高度なオーディオ生成のトピックです。

この時点で、デモアプリはうまく動作しています。オーディオを（ほぼ）瞬時に再生/一時停止し、周波数をリアルタイムで変更できます。

最後の部分、実際の Rust WASM の実装に移ります。

#### Rust WASM の実装

これまでに、オーディオデータを生成して共有メモリに書き込むワーカースレッド（TypeScript 版）を作成してきました。ここからは、それを実際の Rust 関数に置き換えていきます。

> ちなみに、私は Rust や WASM の経験がありません。

まず、Rust WASM プロジェクトのセットアップから始めます。これは意外と簡単です。

Rust 開発ツールが準備できていると仮定して、まず現在のプロジェクトディレクトリに Rust プロジェクトを初期化します。

`cargo new wasm-lib --lib`

これにより、Rust プロジェクトファイルを含む新しいフォルダ`wasm-lib`が作成されます。

次に、`Cargo.toml`ファイルを編集して、必要な依存関係を含めます（これは`package.json`ファイルのようなものです！）。

```toml
[package]
name = "wasm-lib"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

次に、`src/lib.rs`ファイルでコーディングを開始できます。単純な`greet()`関数から始めましょう。

```rust
// wasm-lib/src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello from Rust, {}!", name)
}
```

次に、Rust プロジェクトを WASM バイナリを含む npm パッケージにビルドします。

`cd wasm-lib`
`wasm-pack build --target web`

これにより、WASM バイナリを含む`pkg`ディレクトリが作成され、`package.json`とともに npm パッケージとしてきれいにパッケージ化されます。

次に、パッケージを Vite プロジェクトにリンク（インストール）します。

`cd ..`
`npm install ./wasm-lib/pkg`

これで、Rust WASM パッケージがインストールされ、`package.json`ファイルにリストされました。やった！

しかし、パッケージを使用する前に、まず Vite プロジェクトを設定する必要があります。

まず、必要なプラグインをインストールします。

`npm install vite-plugin-wasm vite-plugin-top-level-await --save-dev`

次に、`vite.config.js`を編集して、新しくインストールしたプラグインを追加します。

```ts
// vite.config.ts
// ...
import wasm from "vite-plugin-wasm"; // <---
import topLevelAwait from "vite-plugin-top-level-await"; // <---

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    wasm(), // <---
    topLevelAwait() // <---
  ],

  server: {
  // ...
```

これで、WASM モジュールを使用する準備ができました！

まず、インポートします。

```ts
// Demo.tsx
import init, { greet } from "wasm-lib";
```

次に、`greet()`関数を直接呼び出すことができます。この`useEffect`を`App`コンポーネント内に追加します。

```ts
// Demo.tsx
useEffect(() => {
  init().then(() => {
    const result = greet("Vite & React");
    console.log(result);
  });
}, []);
```

アプリを実行すると、コンソールに`Hello from Rust, Vite & React!`と出力されます。

さて、本題に戻りましょう。WASM 関数でオーディオデータを生成することです。

上記の`greet()`関数では、WASM コードはメインスレッドで実行されますが、これは私たちが望んでいたものではありません。`Demo.tsx` への上記編集は削除できます。

`Demo.worker.ts` ファイルをもう一度見てみましょう。オーディオ生成関数を Rust WASM 関数への呼び出しに置き換えたいです。

その前に、オーディオ生成ロジックを再利用可能な独自の関数に分離しましょう。こうすることで、どの部分が WASM 関数になるべきかが見やすくなります。

...

オーディオ生成ロジックを再利用可能な形式に抽出する最良の方法を調べた結果、オシレーターという概念を見つけました。

> オシレーター（英: oscillator）は、周期的な電子信号を生成する装置または回路である。デジタルオーディオの分野においては、波形と呼ばれる周期的な数値パターンを生成するアルゴリズムを指す。生成された波形がスピーカーに送信されると、スピーカーコーンがそのパターンに従って前後に動き、空気中に振動が生じる。この振動は人間の耳によって連続的な音や特定のピッチとして知覚される。

実は、ここまで作ってきたものはまさにこのオシレーターそのものです。

このようにして、オーディオ生成ロジックを抽出することで、実質的にオシレーターを作ることになります。オシレーターは、その位相（`phase`）、周波数（`frequency`）、振幅（`amplitude`）を管理する必要があり、動作するサンプルレート（`sampleRate`）を知る必要があります。

それを行う最良の方法は、クラスを作成することです。私たちのオシレータークラスは、内部変数として`phase`を持ち、初期化中に`sampleRate`を受け入れ、オーディオデータを生成するために`frequency`、`amplitude`、`bytesToWrite`を受け入れる`process()`メソッドを持ちます。

オシレーターを実行するには、WASM モジュールを初期化し、その`new`メソッドを呼び出して`sampleRate`を提供してオシレーターインスタンスを作成し、`process()`メソッドを呼び出してオーディオデータを生成します。

これを Rust で直接実装しましょう。同じ正弦波ジェネレーターを実装しますが、再利用可能な Rust 構造体（JavaScript のクラスと考えてください）でラップします。

> Rust の`struct`が JavaScript の`class`と互換性があって本当にありがたい！

lib.rs ファイルの内容を更新します。

```rust
// wasm-lib/src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SineOscillator {
    phase: f32,
    sample_rate: f32,
}

#[wasm_bindgen]
impl SineOscillator {
    /// コンストラクタ関数です
    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32) -> SineOscillator {
        SineOscillator {
            phase: 0.0,
            sample_rate,
        }
    }

    pub fn process(&mut self, length: usize, frequency: f32, amplitude: f32) -> Vec<f32> {
        let mut buffer = vec![0.0; length];

        let phase_increment = frequency / self.sample_rate;

        for i in 0..length {
            let sample = (self.phase * 2.0 * std::f32::consts::PI).sin();

            buffer[i] = sample * amplitude;

            self.phase += phase_increment;

            if self.phase >= 1.0 {
                self.phase -= 1.0;
            }
        }

        buffer
    }
}
```

次に、それを `Demo.worker.ts` で使用しましょう。

`Demo.worker.ts` ファイルを変更します。

```ts
// Demo.worker.ts
// ...
import init, { SineOscillator } from "wasm-lib"; // <---

function startWritingData(
  audioData: Float32Array,
  // sampleRateを削除
  sharedMemory: TransferableState,
  pointers: Int32Array,
  sineOscillator: SineOscillator // <---
) {
  // ...
  // phaseを削除 -- WASM内で処理されるようになりました

  function process() {
    // ...

    if (bytesToWrite > 0) {
      const frequency = sharedState.get("frequency") || 440;
      const buffer = new Float32Array(bytesToWrite);

      buffer.set(sineOscillator.process(bytesToWrite, frequency, 1)); // <---

      let currentWritePointer = writePointer;
      for (let i = 0; i < bytesToWrite; i++) {
        // ...
      }

      // ...
    }

    setTimeout(process, 0);
  }

  process();
}

self.onmessage = async (event) => {
  // <--- asyncにする
  const { sab, sharedMemory, sampleRate, pointersSAB } = event.data; // <--- sampleRateを削除

  const audioData = new Float32Array(sab);
  const pointers = new Int32Array(pointersSAB);

  await init(); // <--- WASMモジュールを初期化
  const sineOscillator = new SineOscillator(sampleRate); // <---

  startWritingData(audioData, sharedMemory, pointers, sineOscillator); // <--- sampleRateを削除 -- 2番目のパラメータ
};
```

WASM モジュールから`SineOscillator`のみをインポートし、それを初期化します。次に、正弦波を生成してバッファに書き込むコードを、`SineOscillator`インスタンスの新しい`process`メソッドに置き換えます。残りはリファクタリングだけです。

アプリを実行すると、以前と同じオーディオ出力が生成されますが、Rust WASM 部分の実装に成功しました。

やった！

次のステップは、実際のアプリ（デモではない）の実装に進みます。たとえば、より多くのオシレーターを追加できるようにオシレーターを設計する、複数のオシレーターをロード、管理、ミックスするようにワーカースレッドをリファクタリングする、より多くのオーディオジェネレーター（オシレーターだけでなく）を実装する、エフェクト用のプラグインシステムを実装する、実際の UI とタイムラインの配置がオーディオソースをどのように制御するかを実装する、オーディオを録音して保存するなどです。

読んでいただきありがとうございます
