import applyMixins from "@/utils/apply-mixins";
import Common from "../common";
import InputMethod from "./modules/input-method";

class Manjaro extends Common implements InputMethod {
  // @ts-expect-errors: not-empty
  inputMethod(): () => Promise<void>;
}

applyMixins(Manjaro, [InputMethod]);

export default Manjaro;
