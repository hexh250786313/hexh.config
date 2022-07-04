import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import runSpawn from "@/utils/run-spawn";
import runYay from "@/utils/run-yay";
import { homedir } from "os";
import ln from "../../ln";

export default class System {
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
    await this.config();
  }

  async config() {
    const pkgs = [
      {
        pkg: "xfce4-i3-workspaces-plugin-git",
        testPath: "/usr/lib/xfce4/panel/plugins/libi3workspaces.so",
      },
      {
        pkg: "i3-gaps-next-git",
        testPath: "/usr/bin/i3",
      },
      {
        pkg: "nitrogen",
        testCommand: "nitrogen",
      },
      {
        pkg: "picom",
        testCommand: "picom",
      },
      {
        pkg: "feh-git",
        testCommand: "feh",
      },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(() => runYay(pkg));
    }, Promise.resolve());
    await promises;
    await runSpawn(`sudo pacman --remove xfdesktop`);
    await runSpawn(
      `xfconf-query -c xfce4-session -p /sessions/Failsafe/Client0_Command -t string -sa i3`
    );
    try {
      await runCommand(`pkill -e xfconfd`);
    } catch (e) {
      /* handle error */
    }
    // await ln(`/.config/xfce4`);
    await runCommand(`rm -rf ${homedir()}/.config/xfce4`);
    await runCommand(
      `cp -r ${dotfilesPath}/.config/xfce4 ${homedir()}/.config`
    );
    await ln(`/.config/i3`);
    await ln(`/.config/picom`);
    await ln(`/.config/autostart/feh.desktop`);
    await ln(`/.config/autostart/picom.desktop`);
  }

  async recover() {
    try {
      await runCommand(`pkill -e xfconfd`);
    } catch (e) {
      /* handle error */
    }
    await runYay({
      pkg: "xfdesktop",
      testPath: "/usr/bin/xfdesktop",
    });
    await runCommand(`rm -rf ${homedir()}/.config/xfce4`);
    await runCommand(`cp -r /etc/skel/.config/xfce4 ${homedir()}/.config`);
    await runSpawn(`yay --remove i3-gaps-next-git`);
    await runSpawn(`yay --remove xfce4-i3-workspaces-plugin-git`);
    try {
      await runCommand(`rm -rf ${homedir()}/.config/autostart/feh.desktop`);
    } catch (e) {
      /* handle error */
    }
    try {
      await runCommand(`rm -rf ${homedir()}/.config/autostart/picom.desktop`);
    } catch (e) {
      /* handle error */
    }
    await runSpawn(
      `xfconf-query -c xfce4-session -p /sessions/Failsafe/Client0_Command -t string -sa xfwm`
    );
    process.stdout.write(`Reboot to apply changes.\n`);
  }
}
