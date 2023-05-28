import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import { homedir } from "os";
import { readFileSync, writeFileSync } from "fs";
import ln from "../../ln";

export default class Ranger {
  async run(args: string[]) {
    let targets: string[] = JSON.parse(JSON.stringify(args));
    if (args.length === 0) {
      targets = ["setup"];
    }

    const allArgsValid = targets.every((T: string) => {
      return (this as any)[T] !== undefined;
    });

    if (allArgsValid) {
      const allPromise = targets.reduce(async (promise, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
      process.stdout.write("OJBK.\n");
    }
  }

  async setup() {
    await this.ranger();
  }

  async ranger() {
    await runCommand(`pip install ranger-fm`);
    await runCommand(`rm -rf ${homedir()}/.config/ranger`);
    await runCommand(`mkdir -p ${homedir()}/.config/ranger`);
    await ln(`/.config/ranger/rc.conf`);
    await runCommand(
      `git clone https://github.com/alexanderjeurissen/ranger_devicons ~/.config/ranger/plugins/ranger_devicons`
    );
    await runCommand(`/home/hexh/.local/bin/ranger --copy-config=rifle`);

    const addition = readFileSync(
      `${dotfilesPath}/.config/ranger/rifle.conf`
    ).toString();
    const rifle = readFileSync(
      `${homedir()}/.config/ranger/rifle.conf`
    ).toString();

    const text = addition + "\n" + rifle;

    writeFileSync(`${homedir()}/.config/ranger/rifle.conf`, text);
  }
}
