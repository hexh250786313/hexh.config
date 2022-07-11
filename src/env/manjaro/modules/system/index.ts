import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import runSpawn from "@/utils/run-spawn";
import runYay from "@/utils/run-yay";
import { existsSync } from "fs-extra";
import { homedir } from "os";
import ln from "../../ln";
import { wallpaper } from "./lock-wallpaper-config";

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

  async deps() {
    await runCommand(`pip3 install i3-py`);
    await runCommand(`pip3 install pynput`);
    await runCommand(`pip3 install i3ipc`);
    const pkgs = [
      {
        pkg: "xfce4-i3-workspaces-plugin-git",
        testPath: "/usr/lib/xfce4/panel/plugins/libi3workspaces.so",
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
      // {
      // pkg: "alttab-git",
      // testCommand: "alttab",
      // },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(() => runYay(pkg));
    }, Promise.resolve());
    await promises;
  }

  async config() {
    await this.deps();
    const pkgs = [
      {
        pkg: "i3-gaps-next-git",
        testPath: "/usr/bin/i3",
      },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(() => runYay(pkg));
    }, Promise.resolve());
    await promises;
    await runCommand(
      `xfconf-query -c xfce4-session -p /sessions/Failsafe/Client0_Command -t string -sa i3`
    );
    await runSpawn(`sudo pacman --remove xfdesktop`);
    await this.updateXfceConfig();
    await ln(`/.config/i3`);
    await ln(`/.config/picom`);
    await ln(`/.config/autostart/feh.desktop`);
    await ln(`/.config/autostart/picom.desktop`);
  }

  async updateXfceConfig() {
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
  }

  async init() {
    await this.face();
    await this.lockWallpaper();
    await this.defaultApp();
    await this.bluetooth();
  }

  async face() {
    await runCommand(`mugshot`);
  }

  async lockWallpaper() {
    if (
      !existsSync(`/usr/share/backgrounds/illyria-default-lockscreen.jpg.bak`)
    ) {
      await runCommand(
        `sudo mv /usr/share/backgrounds/illyria-default-lockscreen.jpg /usr/share/backgrounds/illyria-default-lockscreen.jpg.bak`
      );
    }
    await runCommand(
      `sudo cp ${wallpaper} /usr/share/backgrounds/illyria-default-lockscreen.jpg`
    );
  }

  async defaultApp() {
    const pkgs = [
      "firefox",
      "gtkhash-thunar",
      "thunar-archive-plugin",
      "thunar-media-tags-plugin",
      "thunar-volman",
      "thunar",
    ];
    const promises = pkgs.reduce(
      async (promise: Promise<any>, pkg) =>
        promise.then(() => {
          process.stdout.write(`Removing ${pkg}...\n`);
          return runSpawn(`yay --remove ${pkg}`);
        }),
      Promise.resolve()
    );
    await promises;
  }

  async bluetooth() {
    const path = `/etc/bluetooth/main.conf`;
    const targetText = "AutoEnable=true";
    let text = "";
    try {
      text = await runCommand(`sudo cat ${path}`);
    } catch (e) {
      /* handle error */
    }

    process.stdout.write("Bluetooth enabled.\n");
    if (/#?\u0020*AutoEnable=.*/g.test(text)) {
      await runCommand(
        `sudo perl -0777 -i -pe 's/#?\u0020*AutoEnable=.*/${targetText}/g' ${path}`
      );
    }
  }

  async recover() {
    await runYay({
      pkg: "xfdesktop",
      testPath: "/usr/bin/xfdesktop",
    });
    await runCommand(
      `xfconf-query -c xfce4-session -p /sessions/Failsafe/Client0_Command -t string -sa xfwm`
    );
    try {
      await runCommand(`pkill -e xfconfd`);
    } catch (e) {
      /* handle error */
    }
    await runCommand(`rm -rf ${homedir()}/.config/xfce4`);
    await runCommand(`cp -r /etc/skel/.config/xfce4 ${homedir()}/.config`);
    await runSpawn(`yay --remove i3-gaps-next-git`);
    await runCommand(`rm -rf ${homedir()}/.config/autostart/feh.desktop`);
    await runCommand(`rm -rf ${homedir()}/.config/autostart/picom.desktop`);
    process.stdout.write(`Reboot to apply changes.\n`);
  }

  async copyXfceConfig() {
    await runCommand(`rm -rf ${dotfilesPath}/.config/xfce4`);
    await runCommand(
      `cp -r ${homedir()}/.config/xfce4 ${dotfilesPath}/.config`
    );
    await runCommand(`git add .`, { cwd: `${dotfilesPath}/.config/xfce4` });
  }

  async diffXfceConfig() {
    await runCommand(`rm -rf ${dotfilesPath}/.config/xfce4`);
    await runCommand(
      `cp -r ${homedir()}/.config/xfce4 ${dotfilesPath}/.config`
    );
  }
}
