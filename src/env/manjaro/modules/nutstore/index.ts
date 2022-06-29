import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";
import { existsSync, readFileSync, writeFileSync } from "fs-extra";
import { homedir } from "os";
import ln from "../../ln";

export default class Nutstore {
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
  }

  async init() {
    const pkgs = [
      {
        pkg: "nutstore-experimental",
        testPath: "/usr/bin/nutstore",
      },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(() => runYay(pkg));
    }, Promise.resolve());
    await promises;
    await runCommand(
      `unset all_proxy && unset http_proxy && unset https_proxy && nutstore`
    );
  }

  async config() {
    const path = `${homedir()}/.config/autostart/nutstore-daemon.desktop`;
    let target = "";
    if (existsSync(path)) {
      target = readFileSync(path).toString();
    }

    if (/.*sleep\s30\s&&\s.*/g.test(target)) {
      writeFileSync(path, target.replace(/sleep\s30\s&&\s/g, ""));
    }
    // await runCommand(
  }

  async clipman() {
    const path = `${homedir()}/.config/autostart/xfce4-clipman-plugin-autostart.desktop`;
    try {
      await runCommand(`pkill -e clipman`);
    } catch (e: any) {
      //
    }
    await runCommand(`rm -r ~/.cache/xfce4/clipman`);
    process.stdout.write("Sync to ~/.cache/xfce4/clipman\n");

    let target = "";
    if (existsSync(path)) {
      target = readFileSync(path).toString();
    }

    if (!target.includes("30")) {
      await runCommand(
        `sudo mv /etc/xdg/autostart/xfce4-clipman-plugin-autostart.desktop /etc/xdg/autostart/xfce4-clipman-plugin-autostart.desktop.bak`
      );
      await runCommand(
        `sudo mv /etc/skel/.config/autostart/xfce4-clipman-plugin-autostart.desktop /etc/skel/.config/autostart/xfce4-clipman-plugin-autostart.desktop.bak`
      );
      await runCommand(
        `cp ${homedir()}/.config/autostart/xfce4-clipman-plugin-autostart.desktop ~/.config/autostart/xfce4-clipman-plugin-autostart.desktop.bak`
      );
      await runCommand(
        `sudo chattr -i ${homedir()}/.config/autostart/xfce4-clipman-plugin-autostart.desktop`
      );
      await runCommand(
        `sudo rm ${homedir()}/.config/autostart/xfce4-clipman-plugin-autostart.desktop`
      );
      await ln(`/.config/autostart/xfce4-clipman-plugin-autostart.desktop`);
    }
  }
}
