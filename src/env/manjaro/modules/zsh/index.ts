import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import runSpawn from "@/utils/run-spawn";
import runYay from "@/utils/run-yay";
import commandExists from "command-exists";
import { homedir } from "os";
import ln from "../../ln";

export default class Zsh {
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
    await this.env();
    await this.ohmyzsh();
    // await this.colorls();
  }

  async ln() {
    await ln("/.zshrc");
  }

  async ohmyzsh() {
    process.stdout.write(
      'sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"\n'
    );
  }

  async env() {
    const pkgs = [
      {
        // pkg: "rbenv-git",
        pkg: "rbenv",
        testPath: "/usr/bin/rbenv",
      },
      {
        pkg: "ruby-build-git",
        testPath: "/usr/bin/ruby-build",
      },
    ];
    const promises = pkgs.reduce(async (promise, pkg) => {
      return promise.then(() => runYay(pkg));
    }, Promise.resolve());
    await promises;
  }

  async fzf() {
    try {
      await commandExists("fzf");
    } catch (e) {
      await runSpawn(
        `git clone --depth 1 https://github.com/junegunn/fzf.git ${homedir()}/.fzf`
      );
      process.stdout.write(`${homedir()}/.fzf/install\n`);
    }
  }

  async colorls() {
    try {
      await commandExists("colorls");
    } catch (e) {
      await runCommand(`rbenv install 3.1.0`);
      process.stdout.write(`zsh`);
      process.stdout.write(`rbenv shell 3.1.0\n`);
      process.stdout.write(`rbenv global 3.1.0\n`);
      process.stdout.write(`rbenv local 3.1.0\n`);
      process.stdout.write(`gem install colorls\n`);
      process.stdout.write(
        `nvim ${dotfilesPath}/.config/colorls/dark_colors.yaml\n`
      );
      process.stdout.write(`nvim $(dirname $(gem which colorls))/yaml`);
    }
  }
}
