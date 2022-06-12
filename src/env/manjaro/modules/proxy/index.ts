import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";
import { existsSync } from "fs-extra";
import { homedir } from "os";
import generateClashDir from "./generateClashDir";
import clashConfig from "./yaml/clash-config";

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
      try {
        await runCommand(`pkill -e clash`);
        process.stdout.write("Clash killed...\n");
      } catch (e) {
        /* handle error */
      }
      const allPromise = targets.reduce(async (promise: any, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
      process.stdout.write("Done. Please restart your clash.\n");
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

  async fetchYaml() {
    await runCommand(
      `unset all_proxy && unset http_proxy && unset https_proxy`
    );

    if (!existsSync(`${homedir()}/.config/clash/cache.db`)) {
      process.stdout.write("No clash cache.db found, generating...\n");
      await generateClashDir();
    }

    process.stdout.write("Fetching yaml file...\n");
    await runCommand(
      `curl -L -o ${homedir()}/.config/clash/config.yaml https://api.dogeconfig.com/link/gBTCS4Rfy9y1Xr4z?clash=1`
    );

    await runCommand(
      `perl -0777 -i -pe "s/port(.*\n){8}.*dns:/${clashConfig}/gi" ${homedir()}/.config/clash/config.yaml`
    );

    await runCommand(
      `export all_proxy="socks://127.0.0.1:4780" && export http_proxy="http://127.0.0.1:4780" && export https_proxy="http://127.0.0.1:4780"`
    );
  }
}
