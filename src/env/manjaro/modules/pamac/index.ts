import runCommand from "@/utils/run-command";

export default class Pamac {
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

  async fixSnapBrokenP() {
    const output = await runCommand(`snap changes`);
    process.stdout.write(output + "\n");
    process.stdout.write(
      `Find the code of the error program and run: sudo snap abort <code>\n`
    );
  }

  async config() {
    await runCommand(
      `echo "EnableAUR\nCheckAURUpdates\nCheckAURVCSUpdates\nCheckFlatpakUpdates\nEnableSnap\nEnableFlatpak\n" | sudo tee -a /etc/pamac.conf`
    );
    //
  }

  async flatpak() {
    await runCommand(
      `flatpak install --assumeyes flathub com.calibre_ebook.calibre`
    );
  }

  async snap() {
    await runCommand(`sudo snap refresh`);
    await runCommand(`sudo snap install dingtalk-notifier`);
  }
}
