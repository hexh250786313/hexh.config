import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";
import { existsSync, readFileSync, writeFileSync } from "fs-extra";
import { homedir } from "os";
import ln from "../../ln";

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

  async deps() {
    const pkgs = [
      {
        pkg: "fd",
        testCommand: "fd",
      },
      {
        pkg: "highlight",
        testPath: "/usr/bin/highlight",
      },
      {
        pkg: "ripgrep",
        testPath: "/usr/bin/rg",
      },
      {
        pkg: "go",
        testPath: "/usr/bin/go",
      },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(() => runYay(pkg));
    }, Promise.resolve());
    await promises;
    await runCommand(`pip3 install neovim`);
    await runCommand(`pip3 install Send2Trash`);
  }

  async setup() {
    await this.nightly();
  }

  async ln() {
    await ln("/.config/nvim");
  }

  async appimageStable() {
    await this.fetch(async () => {
      await runCommand(
        `curl -L -o ${homedir()}/build/nvim.appimage https://github.com/neovim/neovim/releases/download/v0.8.0/nvim.appimage`
      );
      await setApp();
    });
  }

  async appimageNightly() {
    await this.fetch(async () => {
      await runCommand(
        `curl -L -o ${homedir()}/build/nvim.appimage https://github.com/neovim/neovim/releases/download/nightly/nvim.appimage`
      );
      await setApp();
    });
  }

  async stable() {
    await this.fetch(async () => {
      await runCommand(
        `git clone https://github.com/neovim/neovim ${homedir()}/build/neovim`
      );
      await runCommand(`git checkout release-0.8`, {
        cwd: `${homedir()}/build/neovim`,
      });
      await installNvim();
    });
  }

  async nightly() {
    await this.fetch(async () => {
      await runCommand(
        `git clone https://github.com/neovim/neovim ${homedir()}/build/neovim`
      );
      await installNvim();
    });
  }

  async fetch(cb: () => PromiseLike<void>) {
    await this.deps();
    await runCommand(`rm -rf ${homedir()}/build/neovim`);
    // await runCommand(`rm -rf ${homedir()}/build/nvim.appimage`);

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

    process.stdout.write("Fetching nvim...\n");
    await cb();

    await this.latexConfig();
  }

  async release() {
    await this.deps();
  }

  async latexConfig() {
    const path = `${homedir()}/.local/state/mume/katex_config.js`;
    if (existsSync(path)) {
      const text = readFileSync(path).toString();
      if (text && /.*module\.exports.*/g.test(text)) {
        let nextText = text;
        if (/(\t|\u0020)*strict(\t|\u0020)*:(\t|\u0020)*true/g.test(nextText)) {
          nextText = nextText.replace(
            /(\t|\u0020)*strict(\t|\u0020)*:(\t|\u0020)*true/,
            "\u0020\u0020strict: false"
          );
        }
        if (
          !/(\t|\u0020)*strict(\t|\u0020)*:(\t|\u0020)*(true|false)/g.test(
            nextText
          )
        ) {
          nextText = nextText.replace(
            /(?<=(module.exports(\t|\u0020)*=(\t|\u0020)*)){/g,
            "{\u0020\u0020strict: false,"
          );
        }
        writeFileSync(path, nextText);
      }
    }
  }
}

const installNvim = async () => {
  process.stdout.write("Installing nvim...\n");
  try {
    await runCommand(`make CMAKE_BUILD_TYPE=RelWithDebInfo`, {
      cwd: `${homedir()}/build/neovim`,
    });
    await runCommand(`sudo make install`, {
      cwd: `${homedir()}/build/neovim`,
    });
  } catch (e: any) {
    process.stdout.write(
      `${e.message}\nFailed to install nvim. Trying again...\n`
    );
    await installNvim();
  }
};

const setApp = async () => {
  process.stdout.write("Setting nvim.appimage...\n");
  await runCommand(`chmod +x ${homedir()}/build/nvim.appimage`);
  await runCommand(
    `sudo ln -s ${homedir()}/build/nvim.appimage /usr/local/bin/nvim`
  );
};
