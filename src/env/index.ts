import { default as _manjaro } from "./manjaro";
import { default as _wsl } from "./wsl";
import { default as _common } from "./common";
import { default as _vmUbuntu } from "./vm-ubuntu";

const Env = {
  manjaro: _manjaro,
  wsl: _wsl,
  common: _common,
  vmUbuntu: _vmUbuntu,
};

export default Env;
