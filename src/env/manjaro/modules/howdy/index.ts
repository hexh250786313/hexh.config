import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";
import { existsSync, readFileSync } from "fs-extra";
import { camDevice } from "./config";

export default class Howdy {
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
    await this.deps();
    await this.findDev();
    // await this.config();
  }

  async deps() {
    const pkgs = [{ pkg: "v4l-utils", testCommand: "v4l2-ctl" }];
    const promises = pkgs.reduce(async (promise, params) => {
      return promise.then(() => {
        return runYay(params);
      });
    }, Promise.resolve());
    await promises;
    try {
      await runCommand(`sudo howdy -h`);
    } catch (e) {
      await runYay({ pkg: "howdy-git" });
    }
  }

  async findDev() {
    const output = await runCommand(`v4l2-ctl --list-devices`);
    process.stdout.write(output + "\n");
    process.stdout.write(`Run: mpv /dev/video0\n`);
    process.stdout.write(`Find the flashing one\n`);
  }

  async config() {
    const targets = ["/etc/pam.d/sudo", "/etc/pam.d/lightdm"];
    const config = `auth\u0020sufficient\u0020pam_python.so\u0020\\/lib\\/security\\/howdy\\/pam.py`;

    const promises = targets.reduce(async (promise, path) => {
      return promise.then(() => {
        const text = readFileSync(path).toString();
        // if (!text.includes(config)) {
        if (!new RegExp(config, "g").test(text)) {
          const go = async () => {
            if (!existsSync(`${path}.bak`)) {
              await runCommand(`sudo cp ${path} ${path}.bak`);
            }
            await runCommand(
              `sudo perl -0777 -i -pe 's/^/\n${config}\n/g' ${path}`
            );
          };
          return go();
        }
        return Promise.resolve();
      });
    }, Promise.resolve());
    await promises;

    await runCommand(
      `sudo perl -0777 -i -pe 's/device_path.*=.*/device_path\u0020=\u0020${camDevice}/g' /lib/security/howdy/config.ini`
    );

    await runCommand(
      `sudo perl -0777 -i -pe 's/certainty.*=.*/certainty\u0020=\u00204.5/g' /lib/security/howdy/config.ini`
    );

    await runCommand(
      `sudo perl -0777 -i -pe 's/dark_threshold.*=.*/dark_threshold\u0020=\u0020100/g' /lib/security/howdy/config.ini`
    );

    await runCommand(
      `sudo perl -0777 -i -pe 's/detection_notice.*=.*/detection_notice\u0020=\u0020true/g' /lib/security/howdy/config.ini`
    );

    process.stdout.write(`Run: sudo howdy add\n`);
  }
}
