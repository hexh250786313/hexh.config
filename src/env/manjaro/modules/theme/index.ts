import { dotfilesPath } from "@/constants";
import runCommand from "@/utils/run-command";
import { readFileSync } from "fs-extra";
import { homedir } from "os";
import Tmux from "../tmux";

export default class Theme {
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
    await this.vscodeDark();
  }

  async nvimPlugin(theme: string) {
    const path = `${dotfilesPath}/.config/nvim/lua/user/plugin.lua`;
    const pluginText = readFileSync(path).toString();
    if (pluginText) {
      const modulesMatchRes = pluginText.match(
        /(?<=(--\u0020Theme\s*use\(\s*\{\s*))((.+\s)*)(?=(\}\s*\)\s*--\u0020Theme\u0020End))/gm
      );
      if (modulesMatchRes && modulesMatchRes[0]) {
        const modules = modulesMatchRes[0]
          .replace(/\//g, "\\/")
          .split("\n")
          .map((T: string) => T.trim())
          .filter((T: string) => T.trim() !== "");
        // console.log(modules);
        if (
          Object.prototype.toString.call(modules) === "[object Array]" &&
          modules.length > 0
        ) {
          const reg = new RegExp(`${theme}`, "g");
          reg.lastIndex = 0;
          if (!modules.some((T: string) => reg.test(T))) {
            process.stdout.write(`${theme} not found.\n`);
            return null;
          }
          const promises = modules.reduce(async (promise, current) => {
            reg.lastIndex = 0;
            const match = new RegExp(`${theme}`, "g").test(current);
            if (match && current.startsWith("--")) {
              // remove --
              return promise.then(() =>
                runCommand(
                  `perl -0777 -i -pe 's/${current}/${current.replace(
                    /--\u0020*/g,
                    ""
                  )}/gi' ${path}`
                )
              );
            } else if (!match && !current.startsWith("--")) {
              // add --
              return promise.then(() =>
                runCommand(
                  `perl -0777 -i -pe 's/${current}/--\u0020${current}/gi' ${path}`
                )
              );
            } else {
              return promise;
            }
          }, Promise.resolve(""));
          await promises;
        }
      }
    }
  }

  async nvimColorScheme(theme: string, background: "light" | "dark") {
    const path = `${dotfilesPath}/.config/nvim/lua/user/colorscheme.lua`;
    const colorschemeText = readFileSync(path).toString();
    if (colorschemeText) {
      await runCommand(
        `perl -0777 -i -pe 's/vim.opt.background\u0020=\u0020"(dark|light)"/vim.opt.background\u0020=\u0020"${background}"/gi' ${path}`
      );
      await runCommand(
        // eslint-disable-next-line no-useless-escape
        `perl -0777 -i -pe 's/colorscheme\u0020.*/colorscheme\u0020${theme}/gi' ${path}`
      );
    }
  }

  async alacritty(colors: string) {
    const path = `${dotfilesPath}/.config/alacritty/alacritty.yml`;
    const alacrittyText = readFileSync(path).toString();
    if (alacrittyText) {
      await runCommand(
        // eslint-disable-next-line no-useless-escape
        `perl -0777 -i -pe 's/\ncolors:\u0020\*.*/\ncolors:\u0020\*${colors}/gi' ${path}`
      );
    }
  }

  async tilda(theme: string) {
    try {
      await runCommand(`pkill -e tilda`);
    } catch (e) {
      /* handle error */
    }
    const tildaColorSchemePath = `${dotfilesPath}/.config/tilda/color`;
    const tildaColorSchemeText = readFileSync(tildaColorSchemePath).toString();
    const tildaConfigPath = `${dotfilesPath}/.config/tilda/config_0`;
    const tildaConfigText = readFileSync(tildaConfigPath).toString();
    if (tildaColorSchemeText && tildaConfigText) {
      const reg = new RegExp(
        `(?<=(${theme}\\s))(palette(.*\\s)*?)(?=(\\n|$))`,
        "g"
      );
      const colorSchemeStr = tildaColorSchemeText.match(reg);
      if (colorSchemeStr && colorSchemeStr[0]) {
        const colorScheme = colorSchemeStr[0]
          .split("\n")
          .map((T: string) => T.trim())
          .filter((T: string) => T);
        const promises = colorScheme.reduce(async (promise, current) => {
          const property = current.replace(/\u0020*=.*/g, "");
          return promise.then(() =>
            runCommand(
              `perl -0777 -i -pe 's/${property}\u0020*=.*/${current}/gi' ${tildaConfigPath}`
            )
          );
        }, Promise.resolve(""));
        await promises;
        process.stdout.write(`Restart tilda to apply theme.\n`);
      }
    }
  }

  async tmux(theme: string) {
    // /home/hexh/workspace/dotfiles/.tmux.config.color
    const tmuxColorSchemePath = `${dotfilesPath}/.tmux.config.color`;
    const tmuxColorSchemeText = readFileSync(tmuxColorSchemePath).toString();
    const tmuxConfigPath = `${dotfilesPath}/.tmux.conf.local`;
    const tmuxConfigText = readFileSync(tmuxConfigPath).toString();
    if (tmuxConfigText && tmuxColorSchemeText) {
      const reg = new RegExp(
        `(?<=(${theme}\\s))(color0(.*\\s)*?)(?=(\\n|$))`,
        "g"
      );
      const colorSchemeStr = tmuxColorSchemeText.match(reg);
      // console.log(colorSchemeStr);
      if (colorSchemeStr && colorSchemeStr[0]) {
        const colorScheme = colorSchemeStr[0]
          .split("\n")
          .map((T: string) => T.trim())
          .filter((T: string) => T);
        const promises = colorScheme.reduce(async (promise, current) => {
          const property = current.replace(/\u0020*=.*/g, "");
          return promise.then(() =>
            runCommand(
              `perl -0777 -i -pe 's/${property}\u0020*=.*/${current}/gi' ${tmuxConfigPath}`
            )
          );
        }, Promise.resolve(""));
        await promises;
        await runCommand(
          `cp ${homedir()}/.tmux/.tmux.conf.local ${homedir()}/`
        );
        const tmux = new Tmux();
        await tmux.updateConfig();
      }
    }
  }

  async everforest(mode: string) {
    const path = `${dotfilesPath}/.config/nvim/lua/user/colorscheme.lua`;
    const colorschemeText = readFileSync(path).toString();
    if (colorschemeText) {
      await runCommand(
        `perl -0777 -i -pe "s/let\u0020g:everforest_background\u0020=\u0020'.*'/let\u0020g:everforest_background\u0020=\u0020'${mode}'/gi" ${path}`
      );
    }
  }

  async vscodeDark() {
    await this.nvimPlugin("vscode");
    await this.nvimColorScheme("vscode", "dark");
    await this.alacritty("code_dark");
    await this.tilda("code_dark");
    await this.tmux("code_dark");
  }

  async everforestLightMedium() {
    await this.nvimPlugin("everforest");
    await this.nvimColorScheme("everforest", "light");
    await this.alacritty("everforest_light_medium");
    await this.everforest("medium");
    await this.tilda("everforest_light_medium");
    await this.tmux("everforest_light_medium");
  }

  async gruvbox() {
    await this.nvimPlugin("gruvbox-material");
    await this.nvimColorScheme("gruvbox-material", "dark");
    await this.alacritty("gruvbox_dark");
    await this.tilda("gruvbox_dark");
    await this.tmux("gruvbox_dark");
  }

  async enfocado() {
    await this.nvimPlugin("vim-enfocado");
    await this.nvimColorScheme("enfocado", "dark");
  }
}
