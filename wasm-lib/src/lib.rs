use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SineOscillator {
    phase: f32,
    sample_rate: f32,
}

#[wasm_bindgen]
impl SineOscillator {
    /// it's the constructor function
    /// it can be called from javascript with `new SineOscillator(sampleRate)`
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
