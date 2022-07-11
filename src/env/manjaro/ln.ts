import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import { homedir } from "os";

async function ln(path: string) {
  await runCommand(`rm -rf ${homedir()}${path}`);
  await runCommand(`ln -s ${dotfilesPath}${path} ${homedir()}${path}`);
}

export default ln;
