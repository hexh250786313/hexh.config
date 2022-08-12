import runCommand from "@/utils/run-command";

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
    await this.packages();
    await this.nvm();
    await this.npm();
  }

  async npm() {
    process.stdout.write("npm list -g --depth=0\n");
  }

  async nvm() {
    process.stdout.write("nvm ls-remote\n");
    process.stdout.write("nvm install v16.10.1\n");
    process.stdout.write("nvm use v16.10.1\n");
    process.stdout.write("nvm alias default v16.10.1\n");
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
