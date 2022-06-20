import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";
import { existsSync, readFileSync, writeFileSync } from "fs-extra";
import { homedir } from "os";
import generateFcitxDir from "./generate-fcitx-dir";
import ln from "../../ln";
import plum from "./plum";
import { customDictConfig, dictSpChar } from "./sh/custom-dict-config";
import fetchScel from "./fetch-scel";

export default class InputMethod {
  async run(args: string[]) {
    let targets: string[] = JSON.parse(JSON.stringify(args));
    if (args.length === 0) {
      targets = ["setup"];
    }

    const allArgsValid = targets.every((T: string) => {
      return (this as any)[T] !== undefined;
    });

    if (allArgsValid) {
      try {
        await runCommand(`pkill -e fcitx`);
        process.stdout.write("Fcitx killed...\n");
      } catch (e) {
        /* handle error */
      }

      if (targets.includes("rime")) {
        targets = ["rime"].concat(targets.filter((T: string) => T !== "rime"));
      }
      if (targets.includes("fcitx")) {
        targets = ["fcitx"].concat(
          targets.filter((T: string) => T !== "fcitx")
        );
      }

      const allPromise = targets.reduce(async (promise: any, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
      await generateFcitxDir();
      process.stdout.write("OJBK. Please restart your fcitx.\n");
    }
  }

  async setup() {
    await this.fcitx();
    await this.rime();
    await this.plum();
    await this.fetchSogouScel();
  }

  async fcitx() {
    const packages = [
      {
        pkg: "fcitx-im",
        testCommand: "fcitx",
        withEnter: true,
      },
      {
        pkg: "fcitx-configtool",
        testPath: "/usr/bin/fcitx-config-gtk3",
      },
      {
        pkg: "fcitx-skin-material",
        testPath: "/usr/share/fcitx/skin/material/theme.conf",
      },
    ];

    process.stdout.write("Fcitx installer processing...\n");

    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;

    const xprofilePath = `${homedir()}/.xprofile`;
    const targetText = [
      "export GTK_IM_MODULE=fcitx",
      "export QT_IM_MODULE=fcitx",
      'export XMODIFIERS="@im=fcitx"',
    ];
    let xprofileText = "";
    if (existsSync(xprofilePath)) {
      xprofileText = readFileSync(xprofilePath).toString();
    }

    targetText.forEach((text) => {
      if (!xprofileText.includes(text)) {
        writeFileSync(xprofilePath, "\n" + text, { flag: "a" });
      }
    });

    process.stdout.write("Now restart your computer.\n");
  }

  async rime() {
    // rime log: /tmp/rime.*
    const packages = [
      { pkg: "fcitx-rime", testPath: "/usr/lib/fcitx/fcitx-rime.so" },
      { pkg: "gtest", testPath: "/usr/bin/gtest-config.in" },
    ];

    process.stdout.write("Rime installer processing...\n");

    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;

    const profilePath = `${homedir()}/.config/fcitx/profile`;
    const uiPath = `${homedir()}/.config/fcitx/conf/fcitx-classic-ui.config`;

    if (!existsSync(profilePath)) {
      await generateFcitxDir();
      // 以下 10 秒後執行
    }

    let profileText = readFileSync(profilePath).toString();

    if (!/EnabledIMList=fcitx-keyboard-cn:True,rime:True,/g.test(profileText)) {
      profileText = profileText.replace(/rime:False,/g, "");
      profileText = profileText.replace(
        /EnabledIMList=fcitx-keyboard-cn:True,/g,
        "EnabledIMList=fcitx-keyboard-cn:True,rime:True,"
      );
      profileText = profileText.replace(
        /#?\u0020*IMName\u0020*=.*/g,
        "IMName=rime"
      );

      writeFileSync(profilePath, profileText);
    }

    let uiText = readFileSync(uiPath).toString();

    if (!/SkinType=material/g.test(uiText)) {
      uiText = uiText.replace(/#SkinType=default/g, "SkinType=material");

      writeFileSync(uiPath, uiText);
    }

    if (!existsSync(`${homedir()}/.config/fcitx/rime/installation.yaml`)) {
      // 這一步是爲了生成 rime 的配置文件
      await generateFcitxDir();
      // 以下 10 秒後執行
    }

    ln("/.config/fcitx/rime/lua");
    ln("/.config/fcitx/rime/luna_pinyin_simp.custom.punctuator.yaml");
    ln("/.config/fcitx/rime/luna_pinyin_simp.custom.yaml");
    ln("/.config/fcitx/rime/rime.lua");

    const userYamlPath = `${homedir()}/.config/fcitx/rime/user.yaml`;

    let userYamlText = readFileSync(userYamlPath).toString();

    userYamlText =
      userYamlText + "\n  previously_selected_schema: luna_pinyin_simp";

    writeFileSync(userYamlPath, userYamlText);

    process.stdout.write("Installing librime...\n");

    if (
      !existsSync(
        `${homedir()}/.config/fcitx/rime/build/terra_pinyin.reverse.bin`
      )
    ) {
      try {
        await runCommand(`mkdir -p ${__dirname}/build`);
        await runCommand(
          `git clone https://github.com/hexh250786313/librime ${__dirname}/build/librime`
        );
        await runCommand(
          `sh -c "${__dirname}/build/librime/install-plugins.sh hexh250786313/librime-lua"`
        );
        await runCommand(
          `sh -c "${__dirname}/build/librime/install-plugins.sh hexh250786313/librime-octagram"`
        );
        await runCommand(
          `make --directory=${__dirname}/build/librime merged-plugins`
        );
        await runCommand(
          `sudo make --directory=${__dirname}/build/librime install`
        );
        try {
          await runCommand(
            `ln -s /usr/share/rime-data/build/terra_pinyin.reverse.bin ${homedir()}/.config/fcitx/rime/build/`
          );
        } catch (e) {
          /* handle error */
        }
      } catch (err: any) {
        console.log(err.message);
        // await runCommand(`rm -rf ${__dirname}/build/librime`);
        throw new Error("librime install failed");
      }
      try {
        // await runCommand(`rm -rf ${__dirname}/build/librime`);
      } catch (e) {
        /* handle error */
      }
    }
  }

  async plum() {
    process.stdout.write("Plum Processing...\n");

    await plum([
      "hexh250786313/rime-emoji",
      "hexh250786313/rime-easy-en",
      "hexh250786313/rime-octagram-data hexh250786313/rime-octagram-data@hans",
    ]);
  }

  async fetchSogouScel() {
    process.stdout.write("Scel fetching...\n");

    try {
      try {
        await runCommand(`rm -rf ${__dirname}/build/scel-rime`);
      } catch (e) {
        /* handle error */
      }
      await runCommand(
        `git clone https://github.com/hexh250786313/scel-rime ${__dirname}/build/scel-rime`
      );
      await runCommand(`touch ${__dirname}/build/scel-rime/config`);
      writeFileSync(`${__dirname}/build/scel-rime/config`, customDictConfig, {
        flag: "a",
      });

      await runCommand(
        `touch ${homedir()}/.config/fcitx/rime/luna_pinyin_simp.custom.dict.yaml`
      );

      await fetchScel();
    } catch (e: any) {
      process.stdout.write(e + "\n");
      await runCommand(
        `find ${homedir()}/.config/fcitx/rime -type f -name '*${dictSpChar}*' -delete`
      );
    } finally {
      await runCommand(`rm -rf ${__dirname}/build/scel-rime`);
    }
  }
}
