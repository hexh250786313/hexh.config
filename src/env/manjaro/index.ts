import applyMixins from "@/utils/apply-mixins";
import InputMethod from "../arch/input-method";
import Common from "../common";

class Manjaro extends Common implements InputMethod {
  // @ts-expect-errors: not-empty
  fcitx: () => Promise<void>;
  // @ts-expect-errors: not-empty
  rime: () => Promise<void>;
}

applyMixins(Manjaro, [InputMethod]);

export default Manjaro;
