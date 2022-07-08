import runCommand from "@/utils/run-command";
import runSpawn from "@/utils/run-spawn";
import runYay from "@/utils/run-yay";

export default class Asus {
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
    await this.prevAction();
    await this.install();
    // await this.uninstall();
  }

  async fetch() {
    process.stdout.write("Fetching asus-touchpad-numpad-driver...\n");
    await runCommand(`rm -rf ${__dirname}/build/asus-touchpad-numpad-driver`);
    await runCommand(
      `git clone https://github.com/mohamed-badaoui/asus-touchpad-numpad-driver ${__dirname}/build/asus-touchpad-numpad-driver`
    );
    process.stdout.write("Fetching asus-touchpad-numpad-driver... Done.\n");
  }

  async clear() {
    await runCommand(`rm -rf ${__dirname}/build/asus-touchpad-numpad-driver`);
  }

  async uninstall() {
    try {
      await this.fetch();
      await runSpawn(`sudo ./uninstall.sh`, {
        cwd: `${__dirname}/build/asus-touchpad-numpad-driver`,
      });
    } catch (e) {
      /* handle error */
    } finally {
      await this.clear();
    }
  }

  async install() {
    try {
      await this.fetch();
      process.stdout.write(
        `Click to confirm numpad type: https://github.com/mohamed-badaoui/asus-touchpad-numpad-driver\n`
      );
      await runSpawn(`sudo ./install.sh`, {
        cwd: `${__dirname}/build/asus-touchpad-numpad-driver`,
      });
    } catch (e) {
      /* handle error */
    } finally {
      await this.clear();
    }
  }

  async prevAction() {
    await runCommand(`sudo modprobe i2c-dev`);
    await runCommand(`sudo i2cdetect -l`);
  }

  async deps() {
    const pkgs = [
      {
        pkg: "libevdev",
        testPath: "/usr/bin/libevdev-tweak-device",
      },
      {
        pkg: "python-libevdev",
        testPath: "/usr/share/doc/python-libevdev/html/.buildinfo",
      },
      {
        pkg: "i2c-tools",
        testPath: "/usr/bin/i2cget",
      },
    ];
    const promises = pkgs.reduce(async (promise, params) => {
      return promise.then(() => {
        return runYay(params);
      });
    }, Promise.resolve());
    await promises;
  }
}
