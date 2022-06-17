import commandExists from "command-exists";
import runCommand from "./run-command";
import { existsSync } from "fs-extra";

interface Params {
  pkg: string;
  testCommand?: string;
  testPath?: string;
  withEnter?: boolean;
}

export default async function runPacman({
  pkg,
  testCommand,
  testPath,
  withEnter,
}: Params) {
  try {
    if (testPath && !existsSync(testPath)) {
      throw new Error();
    } else if (!testPath) {
      await commandExists(testCommand || pkg);
    }
  } catch (e) {
    process.stdout.write(`==== Installing ${pkg}...\n`);
    await runCommand(
      `${
        withEnter ? "echo y |" : ""
      } echo $'\n' | LANG=C sudo pacman --noconfirm -S ${pkg}`
    );
    process.stdout.write(`${pkg} installed!\n`);
  }
}
