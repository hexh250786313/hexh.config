// import applyMixins from "@/utils/apply-mixins";
// import Common from "../common";
import InputMethod from "./modules/input-method";

// class Manjaro extends Common implements InputMethod {
// // @ts-expect-errors: is-not-undefined
// inputMethod(): () => Promise<void>;
// }

// applyMixins(Manjaro, [InputMethod]);

const Manjaro = {
  inputMethod: InputMethod,
};

export default Manjaro;
