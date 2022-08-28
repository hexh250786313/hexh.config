import runCommand from "@/utils/run-command";
import runSpawn from "@/utils/run-spawn";
import { existsSync } from "fs-extra";
import { homedir } from "os";

export default class Basic {
  async run(args: string[]) {
    let targets: string[] = JSON.parse(JSON.stringify(args));
    if (args.length === 0) {
      targets = ["setup"];
    }

    const allArgsValid = targets.every((T: string) => {
      return (this as any)[T] !== undefined;
    });

    if (allArgsValid) {
      const allPromise = targets.reduce(
        async (promise: Promise<any>, T: string) => {
          return promise.then(() => (this as any)[T]());
        },
        Promise.resolve()
      );
      await allPromise;
      process.stdout.write("OJBK.\n");
    }
  }

  async setup() {
    await this.needed();
  }

  async needed() {
    await runSpawn(`sudo apt install build-essential`);
  }

  async dotfiles() {
    if (!existsSync(`${homedir()}/workspace`)) {
      await runCommand(`mkdir -p ${homedir()}/workspace`);
    }
    if (!existsSync(`${homedir()}/workspace/dotfiles`)) {
      try {
        await runCommand(
          `git clone https://github.com/hexh250786313/dotfiles ${homedir()}/workspace/dotfiles`
        );
      } catch (e) {
        /* handle error */
        await runCommand(`rm -fr ${homedir()}/workspace/dotfiles`);
      }
    }
    if (!existsSync(`${homedir()}/workspace/hexh.config`)) {
      try {
        await runCommand(
          `git clone https://github.com/hexh250786313/hexh.config ${homedir()}/workspace/hexh.config`
        );
      } catch (e) {
        await runCommand(`rm -fr ${homedir()}/workspace/hexh.config`);
      }
      await runCommand(`npm uninstall -g hexh-config`);
      await runCommand(`yarn`, {
        cwd: `${homedir()}/workspace/hexh.config`,
      });
      await runCommand(`npm link`, {
        cwd: `${homedir()}/workspace/hexh.config`,
      });
      await runCommand(`rm -fr /home/hexh/桌面/hexh.config`);
    }

    await runSpawn(`git checkout vmUbuntu`, {
      cwd: `${homedir()}/workspace/dotfiles`,
    });
  }
}
