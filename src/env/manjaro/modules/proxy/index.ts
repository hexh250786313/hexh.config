import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";

export default class Proxy {
  async run(args: string[]) {
    let targets: string[] = JSON.parse(JSON.stringify(args));
    if (args.length === 0) {
      targets = ["setup"];
    }

    const allArgsValid = targets.every((T: string) => {
      return (this as any)[T] !== undefined;
    });

    if (allArgsValid) {
      const allPromise = targets.reduce(async (promise: any, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
    }
  }

  async setup() {
    await this.clash();
  }

  async clash() {
    try {
      await runCommand(`pkill -e clash`);
    } catch (e) {
      /* handle error */
    }

    runYay({
      pkg: "clash",
      testCommand: "clash",
      // withEnter: true,
    });
  }
}
