import runCommand from "@/utils/run-command";
import runPacman from "@/utils/run-pacman";
import runSpawn from "@/utils/run-spawn";
import runYay from "@/utils/run-yay";

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
      const allPromise = targets.reduce(async (promise: any, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
      process.stdout.write("OJBK.\n");
    }
  }

  async setup() {
    // await this.resetPacmanKey();
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

  async dotfiles() {
    await runCommand(`mkdir -p ~/workspace`);
    // await runCommand(`git clone `);
  }

  async needed() {
    const pkgs = [
      { pkg: "yay", testCommand: "yay" },
      { pkg: "cmake", testCommand: "cmake" },
      { pkg: "boost", testPath: "/usr/bin/b2" },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(async () => await runPacman(pkg));
    }, Promise.resolve());
    await promises;
    await runSpawn(`sudo pacman -S base-devel`);
  }

  // pacman 初始化 gpg key 报错时运行, 否则不运行
  async resetPacmanKey() {
    await runPacman({ pkg: "haveged", testPath: "/usr/bin/haveged" });
    await runCommand(`systemctl start haveged`);
    await runCommand(`systemctl enable haveged`);

    try {
      await runCommand(`sudo rm -fr /etc/pacman.d/gnupg`);
    } catch (e) {
      /* handle error */
    }

    await runSpawn(`sudo pacman-key --init`);
    await runSpawn(`sudo pacman-key --populate`);
    await runSpawn(`sudo pacman -Syyu`);
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
        pkg: "cava-git",
        testCommand: "cava",
        // withEnter: true,
      },
      {
        pkg: "speedtest-cli",
        testCommand: "speedtest",
        // withEnter: true,
      },
    ];

    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;

    await this.inputRemapper();
  }

  async inputRemapper() {
    const packages = [
      {
        pkg: "input-remapper-git",
        testCommand: "/usr/bin/input-remapper-control",
        // withEnter: true,
      },
    ];

    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;
  }
}
