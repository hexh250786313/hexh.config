import runCommand from "@/utils/run-command";
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
    const basic = new Basic();
    await basic.ssh();
    await this.init();
    // await basic.dotfiles();
    // await this.ln();
    // await this.proxy();
    // await this.unProxy();
  }

  async init() {
    process.stdout.write(
      `GitHub SSH key setting url is: https://github.com/settings/keys\n`
    );
    process.stdout.write(`Then run: "ssh -T git@github.com"\n`);
    process.stdout.write(`Remind : input "YES" to confirm. Default is "No"\n`);
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
