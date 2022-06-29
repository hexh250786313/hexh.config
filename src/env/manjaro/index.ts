// import applyMixins from "@/utils/apply-mixins";
// import Common from "../common";
import Editor from "./modules/editor";
import InputMethod from "./modules/input-method";
import Proxy from "./modules/proxy";
import Basic from "./modules/basic";
import Git from "./modules/git";
import Zsh from "./modules/zsh";
import Node from "./modules/node";
import Hosts from "./modules/hosts";
import Pamac from "./modules/pamac";
import Nutstore from "./modules/nutstore";

// class Manjaro extends Common implements InputMethod {
// // @ts-expect-errors: is-not-undefined
// inputMethod(): () => Promise<void>;
// }

// applyMixins(Manjaro, [InputMethod]);

const Manjaro = {
  inputMethod: InputMethod,
  proxy: Proxy,
  editor: Editor,
  basic: Basic,
  git: Git,
  zsh: Zsh,
  node: Node,
  hosts: Hosts,
  pamac: Pamac,
  nutstore: Nutstore,
};

export default Manjaro;
