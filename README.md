# Web-DAW Project: "TIDaw"

## 概要 (Overview)

このプロジェクトは、React, Tailwind CSS, そして Rust (WebAssembly) を使用して、モダンなブラウザベースのデジタル・オーディオ・ワークステーション（DAW）を構築することを目的としています。

パフォーマンスが要求される音声処理部分は Rust で記述し WASM にコンパイルすることで、ネイティブアプリケーションに匹敵する速度と安定性を目指します。UI は React と Tailwind CSS を用いて、直感的で応答性の高いコンポーネントベースのインターフェースを構築します。

このドキュメントは、プロジェクトの全体像と開発のロードマップをチームメンバーに共有するためのものです。

## 💻 使用技術スタック (Tech Stack)

- **フロントエンド**: React 18+, Vite
- **UI フレームワーク**: Tailwind CSS
- **オーディオエンジン**: Rust (WebAssembly/WASM)
- **WASM ビルドツール**: wasm-pack
- **状態管理**: React Context API (初期段階), Zustand/Redux (拡張に応じて検討)
- **ブラウザ API**: Web Audio API (AudioWorklet), Web MIDI API

## 🚀 開発の始め方 (Getting Started)

### 1. リポジトリをクローン

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Rust の WASM ターゲットを追加 (初回のみ)

```bash
rustup target add wasm32-unknown-unknown
```

### 3. wasm-pack をインストール (初回のみ)

```bash
cargo install wasm-pack
```

### 4. 依存関係をインストール

```bash
npm install
```

### 5. WASM モジュールをビルド

`audio-engine` ディレクトリ内で `wasm-pack` を実行し、`pkg` ディレクトリを生成します。

```bash
cd audio-engine
wasm-pack build --target web
cd ..
```

### 6. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:5173](http://localhost:5173) (Vite のデフォルト) を開きます。

## 🗺️ 開発ロードマップ (Development Roadmap)

開発は以下のフェーズに分けて段階的に進めます。各フェーズの目標を達成することを確認しながら、着実にプロジェクトを前進させましょう。

### フェーズ 1: コア・オーディオエンジンの構築 (Rust & WASM)

**目標**: React 側から制御可能な、安定した音声処理コアを Rust で作成する。

#### Rust 開発環境のセットアップ

- `audio-engine` という名前で Rust のライブラリプロジェクトを作成します。
- `Cargo.toml` に `wasm-bindgen`, `web-sys`, `js-sys` などの基本的なクレートを追加します。

#### コアとなるデータ構造の定義 (`lib.rs`)

- `struct AudioEngine`: DAW 全体の状態（テンポ、再生状態、トラックリストなど）を管理するメイン構造体。
- `struct Track`: オーディオ/MIDI トラック。ボリューム、パン、ノートイベントのリストを保持します。
- `struct Note`: MIDI ノート情報（ピッチ、ベロシティ、開始時間、長さ）を定義します。
- `trait Instrument`: シンセサイザーやサンプラーのためのトレイト（インターフェース）。将来的な拡張性を見据えます。

#### 最初の音源

まずはテスト用として、シンプルなサイン波オシレーターを実装します。

#### メイン音声処理ループの実装

- `process(&mut self, output_buffer: &mut [f32])` メソッドを実装します。これはブラウザのオーディオスレッドから呼ばれるエンジンの心臓部です。
- このループ内で、アクティブなノートを合成し、トラックごとの処理（ボリューム/パン）を適用し、最終的な出力を `output_buffer` にミックスします。

#### JavaScript への API 公開 (wasm-bindgen)

`#[wasm_bindgen]` アトリビュートを使い、JavaScript から呼び出すためのシンプルな API（ファサード）を作成します。

- `new()`: AudioEngine を初期化するコンストラクタ。
- `play()` / `stop()`: 再生・停止を制御。
- `set_tempo(bpm: f64)`: テンポを変更。
- `add_note(...)`: 指定したトラックにノートを追加。

#### React プロジェクトとの連携

- `wasm-pack build` で WASM パッケージをビルドします。
- Vite の設定を更新し、生成された WASM モジュールを React アプリケーションからインポートできるようにします。

### フェーズ 2: UI 実装 - シーケンサーとトランスポート

**目標**: オーディオエンジンを制御するための主要な UI コンポーネントを React で作成する。

#### AudioWorklet のセットアップ

- パフォーマンスのため、WASM エンジンは AudioWorklet を介して高優先度のオーディオスレッドで実行します。
- `engine-processor.js` ファイルを作成し、その中で WASM モジュールをロード・実行するロジックを記述します。
- `useAudioEngine.js` というカスタムフックを作成し、AudioContext と AudioWorkletNode の初期化と管理をカプセル化します。このフックがエンジン制御関数を各コンポーネントに提供します。

#### トランスポート・コンポーネント (`Transport.jsx`)

- 再生、停止、録音ボタンを Tailwind CSS でスタイリングして作成します。
- `useAudioEngine` フックから提供される関数を各ボタンの `onClick` イベントに接続します。

#### シーケンサー / ピアノロール・コンポーネント (`Sequencer.jsx`)

- **グリッド描画**: CSS Grid または `<canvas>` を用いてタイムライングリッドを描画します。ノート数が多くなることを想定し、パフォーマンス面で有利な `<canvas>` の利用を推奨します。
- **ノート操作**: クリック＆ドラッグによるノートの追加、削除、長さの変更機能を実装します。
- **UI とエンジンの連携**: UI 上でノートが変更されたら、React の state を更新し、その情報を元に `audioEngine.add_note()` などのエンジン関数を呼び出します。UI の状態を常に「正」とします。

### フェーズ 3: 双方向通信と高度な機能

**目標**: エンジンからのフィードバックを UI に反映させ、よりインタラクティブで実践的な機能を追加する。

#### エンジンから UI へのフィードバック

- **再生ヘッドカーソル**: Rust エンジン側で現在の再生位置を計算し、AudioWorklet の `postMessage` を使って定期的にメインスレッド（React 側）へ送信します。UI 側ではその情報を受け取り、シーケンサー上の再生カーソルを動かします。
- **オーディオメーター**: Rust の `process` ループ内で各トラックの音量（RMS やピーク）を計算し、再生位置と一緒に UI へ送信します。このデータを使ってミキサーの VU メーターをリアルタイムに描画します。

#### ミキサー・コンポーネント (`Mixer.jsx`)

- 各トラックに対応するチャンネルストリップ (`ChannelStrip.jsx`) を作成します。
- コンポーネントにはボリュームフェーダー、パンニングノブ、ミュート/ソロボタンを実装します。
- これらの UI 操作は、`engine.set_track_volume(...)` のようなエンジン関数を呼び出すことで音声処理に反映させます。

#### MIDI 入力対応

- Web MIDI API を利用して、接続された MIDI キーボードからの入力をリッスンします。
- `noteon` / `noteoff` といった MIDI メッセージを受信したら、即座にエンジンへ転送し、選択中のトラックの楽器を鳴らします。

#### プロジェクトの保存・読み込み機能

- **シリアライズ**: Rust 側に、エンジン全体の現在の状態（全ノート、テンポ、ミキサー設定など）を JSON 形式に変換（シリアライズ）する機能を実装します。（`serde` クレートが便利です）
- **ファイル操作**: React 側からシリアライズ関数を呼び出し、得られた JSON 文字列をファイルとして保存・ダウンロードさせます。また、プロジェクトファイルを読み込み、その内容をエンジンに渡して状態を復元する機能も実装します。
