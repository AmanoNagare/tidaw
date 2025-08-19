use js_sys::{Float32Array, SharedArrayBuffer};
use wasm_bindgen::prelude::*;

// Use an enum for parameter indices for type safety and readability.
#[wasm_bindgen]
pub enum Parameter {
    Frequency = 0,
}

#[wasm_bindgen]
pub struct WasmSineProcessor {
    params: Float32Array,
    phase: f32,
    sample_rate: f32,
}

#[wasm_bindgen]
impl WasmSineProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(shared_buffer: JsValue, sample_rate: f32) -> Result<WasmSineProcessor, JsValue> {
        if !shared_buffer.is_instance_of::<SharedArrayBuffer>() {
            return Err(JsValue::from_str("Argument must be a SharedArrayBuffer."));
        }
        let params_view = Float32Array::new(&shared_buffer);

        Ok(WasmSineProcessor {
            params: params_view,
            phase: 0.0,
            sample_rate,
        })
    }

    /// The real-time audio processing function.
    pub fn process(&mut self, output_left: &mut [f32], output_right: &mut [f32]) {
        // Read the latest frequency value directly from shared memory.
        let freq = self.params.get_index(Parameter::Frequency as u32);
        let phase_increment = freq * 2.0 * std::f32::consts::PI / self.sample_rate;

        for i in 0..output_left.len() {
            let value = (self.phase).sin();
            output_left[i] = value;
            output_right[i] = value; // Output to both channels (mono)

            self.phase += phase_increment;
            if self.phase > 2.0 * std::f32::consts::PI {
                self.phase -= 2.0 * std::f32::consts::PI;
            }
        }
    }
}
