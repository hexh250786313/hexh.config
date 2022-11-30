import runCommand from "@/utils/run-command";
import { existsSync } from "fs-extra";
import { homedir } from "os";
import ln from "../../ln";

export default class _Service {
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
    await this.ln();
    await this.enable();
  }

  async help() {
    process.stdout.write("nvim ~/.config/systemd/user/your-service.service\n");
    process.stdout.write(
      "systemctl --user enable remove-wechat-border-shadow.service"
    );
    process.stdout.write(
      "systemctl --user start remove-wechat-border-shadow.service"
    );
  }

  async ln() {
    if (!existsSync(`${homedir()}/.config/systemd/user`)) {
      await runCommand(`mkdir -p ${homedir}/.config/systemd/user`);
    }
    await ln("/.config/systemd/user/auto-restart-xfce4-notifyd.service");
    await ln("/.config/systemd/user/remove-wechat-border-shadow.service");
    await ln("/.config/systemd/user/pcmanfm-qt-daemon.service");
  }

  async enable() {
    await runCommand(
      `systemctl --user enable auto-restart-xfce4-notifyd.service`
    );
    await runCommand(
      `systemctl --user start auto-restart-xfce4-notifyd.service`
    );
    await runCommand(
      `systemctl --user enable remove-wechat-border-shadow.service`
    );
    await runCommand(
      `systemctl --user start remove-wechat-border-shadow.service`
    );
    await runCommand(`systemctl --user enable pcmanfm-qt-daemon.service`);
    await runCommand(`systemctl --user start pcmanfm-qt-daemon.service`);
  }
}
