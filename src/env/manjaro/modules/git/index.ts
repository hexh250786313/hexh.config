import runCommand from "@/utils/run-command";
import { homedir } from "os";
import ln from "../../ln";
import Basic from "../basic";

export default class Git {
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
    await this.init();
    // await this.proxy();
    // await this.unProxy();
    const basic = new Basic();
    await basic.dotfiles();
    await this.ln();
  }

  async init() {
    await runCommand(`ssh-keygen -t rsa -C "250786313@qq.com"`);
    const output = await runCommand(`cat ${homedir()}/.ssh/id_rsa.pub`);
    process.stdout.write(output + "\n");
    process.stdout.write(
      `GitHub SSH key setting url is: https://github.com/settings/keys\n`
    );
    process.stdout.write(`Then run: "ssh -T git@github.com"\n`);
  }

  async ln() {
    ln("/.gitconfig");
  }

  async proxy() {
    await runCommand(`git config --global http.proxy http://127.0.0.1:4780`);
    await runCommand(`git config --global https.proxy https://127.0.0.1:4780`);
  }

  async unProxy() {
    await runCommand(`git config --global --unset http.proxy`);
    await runCommand(`git config --global --unset https.proxy`);
  }
}