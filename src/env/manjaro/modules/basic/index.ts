import runCommand from "@/utils/run-command";
import runPacman from "@/utils/run-pacman";
import runSpawn from "@/utils/run-spawn";
import runYay from "@/utils/run-yay";
import { spawn } from "child_process";
import { homedir } from "os";

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
    await this.software();
  }

  async dkms() {
    // https://blog.hexuhua.vercel.app/post/19
  }

  async initPacman() {
    await runCommand(`sudo pacman-key --init`);
    await runCommand(`sudo pacman-key --populate`);
    await runCommand(`sudo pacman-key --Syyu`);
  }

  async vmTools() {
    try {
      await runCommand(`sudo rm -rf /etc/vmware-tools`);
    } catch (e) {
      /* handle error */
    }
    try {
      await runCommand(`sudo rm -rf /usr/bin/vmtoolsd`);
    } catch (e) {
      /* handle error */
    }
    try {
      await runCommand(`sudo rm -rf ${homedir()}/下载/vmware-tools-distrib`);
    } catch (e) {
      /* handle error */
    }

    await runCommand(`timedatectl set-ntp true`);
    await runPacman({ pkg: "net-tools", testCommand: "ifconfig" });
    try {
      await runCommand(`sudo mkdir /etc/init.d`);
      const promises = [0, 1, 2, 3, 4, 5, 6].reduce((promise, number) => {
        promise.then(
          async () => await runCommand(`sudo mkdir /etc/rc${number}.d`)
        );
        return promise;
      }, Promise.resolve());
      await promises;
    } catch (e) {
      /* handle error */
    }

    await runCommand(`tar xvf ./*VMware*tar.gz`, {
      cwd: `${homedir()}/下载`,
    });
    await runSpawn("sudo ./vmware-install.pl", {
      cwd: `${homedir()}/下载/vmware-tools-distrib`,
    });

    // process.stdout.write(
    // "sudo ~/下载/vmware-tools-distrib/vmware-install.pl\n"
    // );
  }

  async test() {
    await runSpawn("sudo pacman -S qq");
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
