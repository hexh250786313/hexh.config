import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";
import { readFileSync } from "fs-extra";
import { homedir } from "os";

export default class Node {
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
    await this.fnm();
    // await this.nvm();
    // await this.packages();
    await this.npm();
  }

  async npm() {
    process.stdout.write("npm list -g --depth=0\n");
  }

  async fnm() {
    const packages = [
      {
        pkg: "fnm-bin",
        testCommand: "fnm",
      },
    ];
    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;
    const zshrc = readFileSync(`${homedir()}/.zshrc`).toString();
    if (zshrc) {
      const target = zshrc.match(
        /export\u0020MY_NODE_PATH="\/home\/hexh\/.local\/share\/fnm\/node-versions\/v.*/g
      );
      if (target && target[0]) {
        const version = target[0].replace(
          /export\u0020MY_NODE_PATH="\/home\/hexh\/.local\/share\/fnm\/node-versions\/v|\/installation"$/g,
          ""
        );
        process.stdout.write("nvm ls-remote\n");
        process.stdout.write(`fnm install v${version}\n`);
        process.stdout.write(`fnm use v${version}\n`);
        process.stdout.write(`fnm default v${version}\n`);
      }
    }
  }

  async nvm() {
    const zshrc = readFileSync(`${homedir()}/.zshrc`).toString();
    if (zshrc) {
      const target = zshrc.match(
        /export\u0020MY_NODE_PATH="\/home\/hexh\/.nvm\/versions\/node\/v.*/g
      );
      if (target && target[0]) {
        const version = target[0].replace(
          /export\u0020MY_NODE_PATH="\/home\/hexh\/.nvm\/versions\/node\/v|"/g,
          ""
        );
        process.stdout.write("nvm ls-remote\n");
        process.stdout.write(`nvm install v${version}\n`);
        process.stdout.write(`nvm use v${version}\n`);
        process.stdout.write(`nvm alias default v${version}\n`);
      }
    }
  }

  async packages() {
    const allPkgsStr = await runCommand("npm list -g --depth=0");
    const allPkgs = allPkgsStr
      .split("\n")
      .map((pkg) =>
        pkg.replace(/(├──\u0020)|(└──\u0020)|(@(?!(.*@.*)).*$)/g, "")
      );
    const pkgs = [
      "@fsouza/prettierd",
      "@babel/eslint-parser",
      "diagnostic-languageserver",
      "eslint_d",
      "eslint",
      "gh-repo-sync-cli",
      "git-cz",
      "http-server",
      "lua-fmt",
      "neovim",
      "nrm",
      "prettier-plugin-sh",
      "prettier",
      "spectacle-cli",
      "standard",
      "typescript-language-server",
      "yarn",
      "pnpm",
      "ts-node",
      "stylelint",
      "stylelint-config-standard-scss",
      "stylelint-config-prettier-scss",
      "rc-config-loader",
      "source-map-support",
    ];
    const promises = pkgs.reduce(async (promise: Promise<any>, pkg) => {
      if (allPkgs.includes(pkg)) {
        return promise;
      } else {
        process.stdout.write(`Installing ${pkg}...\n`);
        return promise.then(() => runCommand(`npm install -g ${pkg}`));
      }
    }, Promise.resolve());
    await promises;
  }
}
