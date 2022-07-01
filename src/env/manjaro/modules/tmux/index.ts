import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";
import { homedir } from "os";
import ln from "../../ln";

export default class Tmux {
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
    await this.tmux();
  }

  async tmux() {
    try {
      await runCommand(`rm -rf ${homedir()}/.tmux`);
    } catch (e) {
      /* handle error */
    }
    await runCommand(
      `git clone https://github.com/gpakosz/.tmux.git ${homedir()}/.tmux`
    );
    try {
      await runCommand(`rm -rf ${homedir()}/.tmux.conf`);
    } catch (e) {
      /* handle error */
    }
    await runCommand(
      `ln -s ${homedir()}/.tmux/.tmux.conf ${homedir()}/.tmux.conf`
    );
    try {
      await runCommand(`rm -rf ${homedir()}/.tmux.conf.local`);
    } catch (e) {
      /* handle error */
    }
    await runCommand(`cp ${homedir()}/.tmux/.tmux.conf.local ${homedir()}/`);
    await runCommand(
      `cat ${dotfilesPath}/.tmux.conf.local >> ${homedir()}/.tmux.conf.local`
    );
    await runYay({
      pkg: "tmux",
      testCommand: "tmux",
    });

    await ln(`/.config/autostart/work.desktop`);
    await ln(`/.config/autostart/hexh.desktop`);
  }
}
