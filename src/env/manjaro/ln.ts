import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import { homedir } from "os";

async function ln(path: string) {
  try {
    await runCommand(`rm -rf ${homedir()}${path}`);
  } catch (e) {
    /* handle error */
  }
  await runCommand(`ln -s ${dotfilesPath}${path} ${homedir()}${path}`);
}

export default ln;
