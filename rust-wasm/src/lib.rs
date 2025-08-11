mod utils;

use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// Audio-related functions for the DAW
#[wasm_bindgen]
pub struct AudioProcessor {
    sample_rate: f32,
    buffer_size: usize,
}

#[wasm_bindgen]
impl AudioProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32, buffer_size: usize) -> AudioProcessor {
        utils::set_panic_hook();
        AudioProcessor {
            sample_rate,
            buffer_size,
        }
    }

    #[wasm_bindgen]
    pub fn process_audio(&self, input: &[f32]) -> Vec<f32> {
        // Simple audio processing example - just copy input to output
        input.to_vec()
    }

    #[wasm_bindgen]
    pub fn generate_sine_wave(&self, frequency: f32, duration: f32) -> Vec<f32> {
        let num_samples = (self.sample_rate * duration) as usize;
        let mut output = Vec::with_capacity(num_samples);

        for i in 0..num_samples {
            let t = i as f32 / self.sample_rate;
            let sample = (2.0 * std::f32::consts::PI * frequency * t).sin();
            output.push(sample);
        }

        output
    }

    #[wasm_bindgen(getter)]
    pub fn sample_rate(&self) -> f32 {
        self.sample_rate
    }

    #[wasm_bindgen(getter)]
    pub fn buffer_size(&self) -> usize {
        self.buffer_size
    }
}
