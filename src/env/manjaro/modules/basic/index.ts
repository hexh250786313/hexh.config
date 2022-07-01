import runCommand from "@/utils/run-command";
import runPacman from "@/utils/run-pacman";
import runSpawn from "@/utils/run-spawn";
import runYay from "@/utils/run-yay";
import { existsSync } from "fs-extra";
import { homedir } from "os";
import ln from "../../ln";

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
    await this.resetPacmanKey();
    await this.needed();
    await this.dkms();
    await this.dotfiles();
    await this.software();
  }

  async dkms() {
    await runSpawn(`sudo pacman -Syu base-devel --needed`);
    const linuxInfo = await runCommand(`mhwd-kernel -li`);
    const kernelMatch = linuxInfo.match(/(linux\d+(?<!=(\*\s)))(?=((\s)+))/g);
    if (Array.isArray(kernelMatch) && kernelMatch.length > 0) {
      const kernel = kernelMatch[0];
      // console.log(kernel === "linux515");
      await runSpawn(`sudo pacman -S ${kernel}-headers dkms`);
    }
    // https://blog.hexuhua.vercel.app/post/19
  }

  public async ssh() {
    if (!existsSync(`${homedir()}/.ssh`)) {
      process.stdout.write("Initial ssh" + "\n");
      await runSpawn(`ssh-keygen -t rsa -C "250786313@qq.com"`);
    }
    // await runSpawn(`xclip -sel clip ${homedir()}/.ssh/id_rsa.pub`);
    await runCommand(`xsel --clipboard < ${homedir()}/.ssh/id_rsa.pub`);
    await runCommand(`sudo systemctl enable sshd.service`);
    await runCommand(`sudo systemctl start sshd.service`);
    process.stdout.write("Copy ssh key to clipboard" + "\n");
  }

  async dotfiles() {
    await runYay({ pkg: "nmap-netcat", testCommand: "ncat" });
    if (!existsSync(`${homedir()}/workspace`)) {
      await runCommand(`mkdir -p ${homedir()}/workspace`);
    }
    if (!existsSync(`${homedir()}/workspace/dotfiles`)) {
      try {
        await runCommand(
          `git clone https://github.com/hexh250786313/dotfiles ${homedir()}/下载/dotfiles`
        );
      } catch (e) {
        /* handle error */
      } finally {
        await runCommand(`rm -fr ${homedir()}/下载/dotfiles`);
      }
      try {
        await runCommand(`rm -rf ${homedir()}/.ssh/config`);
      } catch (e) {
        /* handle error */
      }
      await runCommand(
        `ln -s ${homedir()}/下载/dotfiles/.ssh/config ${homedir()}/.ssh/config`
      );
      await runCommand(
        `git clone git@github.com:hexh250786313/dotfiles.git ${homedir()}/workspace/dotfiles`
      );
    }
    if (!existsSync(`${homedir()}/workspace/hexh.config`)) {
      await runCommand(
        `git clone git@github.com:hexh250786313/hexh.config.git ${homedir()}/workspace/hexh.config`
      );
      await runCommand(`npm uninstall -g hexh-config`);
      await runCommand(`yarn`, {
        cwd: `${homedir()}/workspace/hexh.config`,
      });
      await runCommand(`npm link`, {
        cwd: `${homedir()}/workspace/hexh.config`,
      });
    }
    await ln(`/.ssh/config`);
  }

  async needed() {
    const pkgs = [
      { pkg: "yay", testCommand: "yay" },
      { pkg: "cmake", testCommand: "cmake" },
      { pkg: "boost", testPath: "/usr/bin/b2" },
      { pkg: "xclip", testCommand: "xclip" },
      { pkg: "xsel", testCommand: "xsel" },
      { pkg: "net-tools", testCommand: "ifconfig" },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(() => runPacman(pkg));
    }, Promise.resolve());
    await promises;
    await runSpawn(`sudo pacman -S base-devel`);
  }

  // pacman 初始化 gpg key 报错时运行, 否则不运行
  async resetPacmanKey() {
    await runPacman({ pkg: "haveged", testPath: "/usr/bin/haveged" });
    await runCommand(`sudo systemctl start haveged`);
    await runCommand(`sudo systemctl enable haveged`);

    try {
      await runCommand(`sudo rm -fr /etc/pacman.d/gnupg`);
    } catch (e) {
      /* handle error */
    }

    await runSpawn(`sudo pacman-key --init`);
    await runSpawn(`sudo pacman-key --populate`);
    // await runSpawn(`sudo pacman -Syyu`);
  }

  // 貌似没用
  // async vmTools() {
  // try {
  // await runCommand(`sudo rm -rf /etc/vmware-tools`);
  // } catch (e) {
  // /* handle error */
  // }
  // try {
  // await runCommand(`sudo rm -rf /usr/bin/vmtoolsd`);
  // } catch (e) {
  // /* handle error */
  // }
  // try {
  // await runCommand(`sudo rm -rf ${homedir()}/下载/vmware-tools-distrib`);
  // } catch (e) {
  // /* handle error */
  // }

  // await runCommand(`timedatectl set-ntp true`);
  // await runPacman({ pkg: "net-tools", testCommand: "ifconfig" });
  // try {
  // await runCommand(`sudo mkdir /etc/init.d`);
  // const promises = [0, 1, 2, 3, 4, 5, 6].reduce((promise, number) => {
  // promise.then(
  // async () => await runCommand(`sudo mkdir /etc/rc${number}.d`)
  // );
  // return promise;
  // }, Promise.resolve());
  // await promises;
  // } catch (e) {
  // /* handle error */
  // }

  // await runCommand(`tar xvf ./*VMware*tar.gz`, {
  // cwd: `${homedir()}/下载`,
  // });
  // await runSpawn("sudo ./vmware-install.pl", {
  // cwd: `${homedir()}/下载/vmware-tools-distrib`,
  // });

  // try {
  // await runCommand(`sudo rm -rf ${homedir()}/下载/vmware-tools-distrib`);
  // } catch (e) {
  // /* handle error */
  // }
  // }

  async test() {
    await runSpawn(`yay -Syu --devel`);
  }

  async software() {
    const packages = [
      {
        pkg: "google-chrome-stable",
        testCommand: "google-chrome",
      },
      {
        pkg: "flameshot-git",
        testCommand: "flameshot",
      },
      {
        pkg: "cava-git",
        testCommand: "cava",
        // withEnter: true,
      },
      {
        pkg: "speedtest-cli",
        testCommand: "speedtest",
        // withEnter: true,
      },
      {
        pkg: "alacritty-git",
        testCommand: "alacritty",
      },
      {
        pkg: "xunlei-bin",
        testCommand: "xunlei",
      },
      {
        pkg: "landrop-git",
        testCommand: "landrop",
      },
      {
        pkg: "utools",
        testCommand: "utools",
      },
      {
        pkg: "pcmanfm-qt",
        testCommand: "pcmanfm-qt",
      },
      {
        pkg: "telegram-desktop-bin",
        testCommand: "telegram-desktop",
      },
      {
        pkg: "hid-nintendo-dkms",
        testPath: "/usr/src/hid-nintendo-3.2/dkms.conf",
      },
      {
        pkg: "joycond-git",
        testCommand: "joycond",
      },
      {
        pkg: "neofetch",
        testCommand: "neofetch",
      },
      {
        pkg: "bucklespring-git",
        testCommand: "buckle",
      },
      {
        pkg: "tilda-git",
        testCommand: "tilda",
      },
      {
        pkg: "nyancat-git",
        testCommand: "nyancat",
      },
      {
        pkg: "cajviewer",
        testCommand: "cajviewer",
      },
      {
        pkg: "vmware-workstation",
        testCommand: "vmware",
      },
      {
        pkg: "listen1-desktop-appimage",
        testPath: "/opt/appimages/listen1.AppImage",
      },
      {
        pkg: "wemeet-bin",
        testCommand: "wemeet",
      },
      {
        pkg: "jq",
        testCommand: "jq",
      },
      {
        pkg: "zoom",
        testCommand: "zoom",
      },
      {
        pkg: "mpd-git",
        testCommand: "mpd",
      },
      {
        pkg: "imwheel",
        testCommand: "imwheel",
      },
      {
        pkg: "timidity++",
        testPath: "/usr/bin/timidity",
      },
      {
        pkg: "mpdevil-git",
        testCommand: "mpdeil",
      },
      {
        pkg: "farge-git",
        testCommand: "farge",
      },
      {
        pkg: "xcolor-git",
        testCommand: "xcolor",
      },
      {
        pkg: "simplescreenrecorder",
        testCommand: "simplescreenrecorder",
      },
      {
        pkg: "deno",
        testCommand: "deno",
      },
      {
        pkg: "ttf-wps-fonts",
        testPath: "/usr/share/fonts/wps-fonts/WEBDINGS.TTF",
      },
      {
        pkg: "ttf-ms-fonts",
        testPath: "/usr/share/fonts/TTF/AndaleMo.TTF",
      },
      {
        pkg: "wps-office-fonts",
        testPath: "/usr/share/fonts/wps-office/FZCCHK.TTF",
      },
      {
        pkg: "wps-office-cn",
        testPath: "/usr/bin/wps",
      },
      {
        pkg: "wps-office-mime-cn",
        testPath: "/usr/share/mime/packages/wps-office-et.xml",
      },
      {
        pkg: "wps-office-mui-zh-cn",
        testPath: "/usr/lib/office6/mui/en_US/resource/help/common.chm",
      },
      {
        pkg: "watchman-bin",
        testCommand: "watchman",
      },
      {
        pkg: "postman-bin",
        testCommand: "postman",
      },
      {
        pkg: "postman-bin",
        testCommand: "postman",
      },
      {
        pkg: "screenkey",
        testCommand: "screenkey",
      },
      {
        pkg: "mpv-build-git",
        testCommand: "mpv",
      },
    ];

    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;

    await runCommand(
      `flatpak install --assumeyes flathub me.hyliu.fluentreader`
    );
    await runCommand(`flatpak install flathub com.github.debauchee.barrier`);
  }
}
