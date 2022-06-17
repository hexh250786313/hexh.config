import runCommand from "@/utils/run-command";

export default class Editor {
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
    await this.nightly();
  }

  async nightly() {
    try {
      await runCommand(`rm -rf ${__dirname}/build/neovim`);
    } catch (e) {
      /* handle error */
    }

    try {
      const paths = await runCommand(`zsh -c "where nvim"`);
      // const paths = await runCommand(`which nvim`);

      if (paths) {
        const pathsArray = paths.split("\n").filter((path) => path);

        const allPromise = pathsArray.reduce(
          async (promise: any, path: string) => {
            return promise.then(() => runCommand(`sudo rm -rf ${path}`));
          },
          Promise.resolve()
        );
        await allPromise;
        process.stdout.write("Nvim deleted...\n");
      }
    } catch (e) {
      /* handle error */
    }

    process.stdout.write("Fetching nightly-nvim...\n");
    await runCommand(
      `git clone https://github.com/neovim/neovim ${__dirname}/build/neovim`
    );

    await installNvim();
  }

  async release() {
    //
  }
}

const installNvim = async () => {
  process.stdout.write("Installing nvim...\n");
  try {
    await runCommand(
      `make --directory=${__dirname}/build/neovim CMAKE_BUILD_TYPE=RelWithDebInfo`
    );
    await runCommand(
      `sudo make --directory=${__dirname}/build/neovim  install`
    );
  } catch (e: any) {
    process.stdout.write(
      `${e.message}\nFailed to install nvim. Trying again...\n`
    );
    await installNvim();
  }
};
