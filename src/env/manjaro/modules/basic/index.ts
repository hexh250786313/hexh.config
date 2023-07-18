import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import runPacman from "@/utils/run-pacman";
import runSpawn from "@/utils/run-spawn";
import runYay from "@/utils/run-yay";
import commandExists from "command-exists";
import { existsSync, readFileSync } from "fs-extra";
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
    await runCommand(
      `sudo perl -0777 -i -pe "s/.*X11Forwarding.*/X11Forwarding\u0020yes/gi" /etc/ssh/sshd_config`
    );
    // 如果是服务器 ( 无 X 环境 ) 的话需要打开下面这一条才能用 -Y 同步剪贴板, 但会有安全问题
    // await runCommand(
    // `sudo perl -0777 -i -pe "s/.*X11UseLocalhost.*/X11UseLocalhost\u0020no/gi" /etc/ssh/sshd_config`
    // );
    await runCommand(`xhost +`);
    // await runSpawn(`xclip -sel clip ${homedir()}/.ssh/id_rsa.pub`);
    await runCommand(`xsel --clipboard < ${homedir()}/.ssh/id_rsa.pub`);
    await runCommand(`sudo systemctl enable sshd.service`);
    await runCommand(`sudo systemctl restart sshd.service`);
    process.stdout.write("Copy ssh key to clipboard" + "\n");
  }

  public async samba() {
    const pkg = { pkg: "samba", testCommand: "samba" };
    const filePath = `/etc/samba/smb.conf`;
    const target = `${homedir()}/Desktop/host`;
    await runYay(pkg);
    let flag = false;
    if (!existsSync(target)) {
      await runCommand(`mkdir -p ${homedir()}/Desktop/host`);
    }
    if (!existsSync(filePath)) {
      flag = true;
    } else {
      const text = readFileSync(filePath).toString();
      if (!/[share]/g.test(text)) {
        flag = true;
      }
    }
    if (flag) {
      await runCommand(
        `echo "[share]\npath=${homedir()}/Desktop/host\navailable=yes\nbrowseable=yes\nwritable=yes\npublic=yes" | sudo tee -a ${filePath}`
      );
    }
    await runCommand(`sudo systemctl enable smb.service`);
    await runCommand(`sudo systemctl restart smb.service`);
    await runCommand(`chmod 777 ${homedir()}`);
    await runCommand(`chmod 777 ${target}`);
    process.stdout.write("Run :: smbclient //localhost/share\n");
  }

  async dotfiles() {
    await runYay({ pkg: "nmap-netcat", testCommand: "ncat" });
    if (!existsSync(`${homedir()}/build`)) {
      await runCommand(`mkdir -p ${homedir()}/build`);
    }
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
      await runCommand(`rm -rf ${homedir()}/.ssh/config`);
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
      { pkg: "python-pip", testPath: "/usr/bin/pip3" },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(() => runPacman(pkg));
    }, Promise.resolve());
    await promises;
    await runCommand(
      `echo "kernel.sysrq=1" | sudo tee /etc/sysctl.d/99-sysrq.conf` // enable sysrq: Alt + PrtSc + k
    );
    await runSpawn(`sudo pacman -S base-devel`);
    // await runSpawn(`pip3 install glad2`); // for mpv-build-git
    // await runSpawn(`pip3 install sphinx-rtd-theme`); // for mpd-git
    await runSpawn(`yay -S ceph-libs-bin`); // 这个要放最后
    await runSpawn(`yay -Y --devel --save --mflags "--nocheck"`); // 永远更新开发包且跳过检查
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

  async test() {
    await runSpawn(`yay -Syu --devel`);
  }

  async software() {
    const packages = [
      {
        pkg: "google-chrome",
        testCommand: "google-chrome-stable",
      },
      {
        pkg: "qt5-base",
        testPath: "/usr/bin/moc-qt5",
      },
      {
        pkg: "qt5-tools",
        testPath: "/usr/bin/designer-qt5",
      },
      {
        pkg: "vim",
        testCommand: "vim",
      },
      // {
      //   pkg: "cava-git",
      //   testCommand: "cava",
      //   // withEnter: true,
      // },
      {
        pkg: "speedtest-cli",
        testCommand: "speedtest",
        // withEnter: true,
      },
      {
        pkg: "alacritty",
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
        pkg: "bucklespring",
        testCommand: "buckle",
      },
      {
        pkg: "tilda",
        testCommand: "tilda",
      },
      {
        pkg: "nyancat",
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
        pkg: "mpd",
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
        pkg: "mpdevil",
        testCommand: "mpdevil",
      },
      {
        pkg: "farge-git",
        testCommand: "farge",
      },
      {
        pkg: "xcolor",
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
        pkg: "github-cli",
        testCommand: "gh",
      },
      // {
      // pkg: "powder",
      // testCommand: "powder",
      // },
      {
        pkg: "input-remapper-git",
        testCommand: "input-remapper-control",
      },
      {
        // pkg: "lazygit-git",
        pkg: "lazygit",
        testCommand: "lazygit",
      },
      {
        pkg: "charles-bin",
        testCommand: "charles4",
      },
      {
        pkg: "visual-studio-code-bin",
        testCommand: "code",
      },
      // {
      //   pkg: "i3lock-color-git",
      //   testCommand: "i3lock",
      // },
      {
        pkg: "barrier",
        testCommand: "barrier",
      },
      {
        pkg: "kguiaddons",
        testCommand: "/usr/bin/kde-geo-uri-handler",
      },
      {
        // pkg: "flameshot",
        pkg: "flameshot-old",
        testCommand: "flameshot",
      },
      {
        pkg: "ventoy-bin",
        testCommand: "ventoy",
      },
      // {
      //   pkg: "wechat-uos",
      //   testCommand: "wechat-uos",
      // },
      {
        pkg: "rofi",
        testCommand: "rofi",
      },
      {
        pkg: "wmctrl",
        testCommand: "wmctrl",
      },
      {
        pkg: "xdotool",
        testCommand: "xdotool",
      },
      // {
      //   pkg: "brave-bin",
      //   testCommand: "brave",
      // },
      {
        pkg: "lollypop",
        testCommand: "lollypop",
      },
      {
        pkg: "kid3",
        testCommand: "kid3",
      },
      {
        pkg: "spek-x-git",
        testCommand: "spek",
      },
      {
        pkg: "perl-rename",
        testCommand: "perl-rename",
      },
      {
        pkg: "btop",
        testCommand: "btop",
      },
      {
        pkg: "debtap",
        testCommand: "debtap", // debtap 1.deb && sudo pacman -U 1.tar.zst
      },
      {
        pkg: "dpkg",
        testCommand: "dpkg", // mkdir -p extract/DEBIAN && dpkg -X 1.deb ./extract && dpkg -e 1.deb ./extract/DEBIAN && dpkg -b ./extract 2.deb
      },
      {
        pkg: "alttab",
        testCommand: "alttab",
      },
      {
        pkg: "qt5-styleplugins",
        testPath: "/usr/lib/cmake/Qt5Gui/Qt5Gui_QGtk2ThemePlugin.cmake",
      },
      {
        pkg: "qt5ct",
        testCommand: "qt5ct",
      },
      {
        pkg: "ocs-url",
        testCommand: "ocs-url",
      },
      {
        pkg: "dingtalk-bin",
        testCommand: "dingtalk",
      },
      {
        pkg: "dingtalk-bin",
        testCommand: "/usr/bin/dingtalk",
      },
      // {
      //   pkg: "wechat-devtools",
      //   testCommand: "wechat-devtools",
      // },
      {
        pkg: "ctags",
        testCommand: "ctags",
      },
      {
        pkg: "tree-sitter-cli",
        testCommand: "tree-sitter",
      },
      // {
      //   pkg: "otf-nerd-fonts-fira-mono",
      //   testPath: "/usr/share/licenses/otf-nerd-fonts-fira-mono/LICENSE",
      // },
      {
        pkg: "obsidian",
        testCommand: "obsidian",
      },
      {
        pkg: "shotcut",
        testCommand: "shotcut",
      },
      {
        pkg: "tdrop",
        testCommand: "tdrop", // tdrop -am -w 100% -h 90% -x 0 -y 36 -s hexh alacritty
      },
      {
        pkg: "the_silver_searcher",
        testCommand: "ag",
      },
      {
        pkg: "icalingua++",
        testCommand: "icalingua",
      },
      {
        pkg: "git-delta",
        testCommand: "delta",
      },
      {
        pkg: "bat",
        testCommand: "bat",
      },
      {
        pkg: "mcfly",
        testCommand: "mcfly",
      },
      {
        pkg: "zoxide",
        testCommand: "zoxide",
      },
      {
        pkg: "lsd",
        testCommand: "lsd",
      },
      {
        pkg: "tealdeer",
        testCommand: "tldr",
      },
      // {
      //   pkg: "min",
      //   testCommand: "min",
      // },
      {
        pkg: "neovide",
        testCommand: "neovide",
      },
      {
        pkg: "linuxqq",
        testCommand: "linuxqq",
      },
      {
        pkg: "feishu-bin",
        testCommand: "feishu",
      },
      {
        pkg: "luarocks",
        testCommand: "luarocks",
      },
      {
        pkg: "ruby",
        testCommand: "ruby",
      },
    ];

    await runCommand(
      `sudo perl -0777 -i -pe "s/Exec=.*(?=(\\/usr\\/bin\\/google-chrome))/Exec=/gi" /usr/share/applications/google-chrome.desktop`
    );
    await runCommand(
      `sudo perl -0777 -i -pe "s/Exec=.*(?=(\\/usr\\/bin\\/google-chrome))/Exec=env\u0020all_proxy=\\"socks:\\/\\/127.0.0.1:4780\\"\u0020http_proxy=\\"http:\\/\\/127.0.0.1:4780\\"\u0020https_proxy=\\"http:\\/\\/127.0.0.1:4780\\"\u0020/gi" /usr/share/applications/google-chrome.desktop`
    );
    // await runCommand(`pip install sphinx-rtd-theme`); // for mpd-git
    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;

    // 安装 mpv-git 的话就取消这里的注释
    // if (!existsSync(`/usr/share/licenses/ffnvcodec-headers-git/LICENSE`)) {
    //   await runSpawn(`yay --remove ffnvcodec-headers`);
    //   await runSpawn(`yay -S ffnvcodec-headers-git`);
    // }

    try {
      await commandExists(`mpv`);
    } catch (e) {
      // await runSpawn(`yay -S mpv-build-git`);
      // await runSpawn(`yay -S mpv-git`);
      await runSpawn(`yay -S mpv`);
    }

    // try {
    // await commandExists(`spek-git`);
    // } catch (e) {
    // await runSpawn(`yay -S spek-git`);
    // }

    try {
      await commandExists(`baidunetdisk`);
    } catch (e) {
      await runSpawn(`yay -S baidunetdisk-electron`);
    }

    try {
      await commandExists(`jmeter`);
    } catch (e) {
      // use jdk 8 because jdk8+ versions have javascritp engine removed when jmeter requires js engine
      // if jdk exists and > 8, run: yay --remove junit jdk-openjdk
      await runSpawn(`yay -S jmeter`);
    }

    await ln(`/.config/lazygit`);
    await ln(`/.ctags`);
    await ln(`/.config/qt5ct`);
    await ln(`/.config/rofi`);
    await ln(`/.config/alacritty`);
    await ln(`/.config/autostart/utools.desktop`);
    await runCommand(`rm -rf ${homedir()}/.config/pcmanfm-qt`);
    await runCommand(
      `cp -r ${dotfilesPath}/.config/pcmanfm-qt ${homedir()}/.config/`
    );
    await ln(`/.config/autostart/pcmanfm-qt.desktop`);
    // await ln(`/.config/pcmanfm-qt`);
    await ln(`/.config/tilda`);
    await ln(`/.config/autostart/tilda.desktop`);
    // await ln(`/.config/autostart/alttab.desktop`);
    await runCommand(`sudo modprobe -a vmw_vmci vmmon`);
    await runCommand(`sudo systemctl enable --now vmware-networks.service`);
    await runCommand(
      `sudo systemctl enable --now vmware-usbarbitrator.service`
    );
    await runCommand(`sudo systemctl enable --now joycond`);
    if (!existsSync(`${homedir()}/.mpd`)) {
      await runCommand(
        `mkdir -p ${homedir()}/.mpd && mkdir -p ${homedir()}/.mpd/playlists && touch ${homedir()}/.mpd/database && touch ${homedir()}/.mpd/log && touch ${homedir()}/.mpd/state && chmod +x ${homedir()}/.mpd`
      );
    }
    await ln(`/.config/mpd`);
    await ln(`/.config/autostart/mpd.desktop`);
    await ln(`/.config/input-remapper-2`);
    await ln(`/.imwheelrc`);
    await ln(`/.config/autostart/imwheel.desktop`);
    await runCommand(
      `flatpak install --assumeyes flathub me.hyliu.fluentreader`
    );
    await ln(`/.config/autostart/fluent_proxy.desktop`);
    // await runCommand(
    // `flatpak install --assumeyes flathub com.github.debauchee.barrier`
    // );
    await ln(`/.config/gh-repo-sync`);
    await ln(`/.config/autostart/work.desktop`);
    await ln(`/.config/autostart/hexh.desktop`);
    await ln(`/.config/autostart/utools.desktop`);
    await ln(`/.config/autostart/buckle.desktop`);
    await ln(`/.config/autostart/landrop.desktop`);
    // await ln(`/.config/autostart/xcape.desktop`);

    await runSpawn(`cargo install typos-cli`);
  }

  async wechat() {
    process.stdout.write(`yay -S lib32-udis86-git deepin-wine-wechat\n`);
    process.stdout.write(`cd ~/.cache/yay/deepin-wine-wechat\n`);
    process.stdout.write(`updpkgsums\n`);
    process.stdout.write(`makepkg -si\n`);
  }

  async vmware() {
    const preferencesText = readFileSync(
      `${homedir()}/.vmware/preferences`
    ).toString();
    const configs = [
      `mks.gl.allowBlacklistedDrivers = "TRUE"`,
      `pref.hotkey.control = "false"`,
      `pref.hotkey.shift = "false"`,
      `pref.hotkey.alt = "true"`,
      `pref.hotkey.gui = "false"`,
      `pref.motionGrab = "FALSE"`,
      `pref.motionUngrab = "FALSE"`,
    ];
    const promises = configs.reduce(async (promise: Promise<any>, cmd) => {
      if (preferencesText.includes(cmd.split(" = ")[0])) {
        return promise.then(() =>
          runCommand(
            `perl -0777 -i -pe 's/${cmd
              .split(" = ")
              .shift()}.*/${cmd}/g' ${homedir()}/.vmware/preferences`
          )
        );
      }
      return promise.then(() =>
        runCommand(`echo '${cmd}' >> ~/.vmware/preferences`)
      );
    }, Promise.resolve());
    await promises;
  }

  async fixMpvBuildLibplacebo() {
    await runCommand(`yay --remove mpv-build-git`);
    await runCommand(`rm -rf ~/.cache/yay/mpv-build-git`);
    await runSpawn(`yay -Syu --devel mpv-build-git`);
  }
}
