import { readJsonSync } from "fs-extra";
import { resolve } from "path";
import { homedir } from "os";

const _pkg = readJsonSync(resolve(__dirname, "../package.json"));

const _toolName = _pkg.name;
const _prefix = `[${_toolName}]` as const;

const _dotfilesPath = `${homedir()}/workspace/dotfiles` as const;

export const dotfilesPath = _dotfilesPath;
export const pkg = _pkg;
export const toolName = _toolName;
export const prefix = _prefix;
