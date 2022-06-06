import runCommand from "@/utils/run-command";
import runYay from "@/utils/run-yay";
import { existsSync, mkdirSync, readFileSync, writeFile } from "fs-extra";
import { homedir } from "os";
import generateFcitxDir from "../manjaro/generate-fcitx-dir";
import ln from "../manjaro/ln";

export default abstract class InputMethod {
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
        writeFile(xprofilePath, "\n" + text, { flag: "a" }, (err) => {
          if (err?.message) {
            process.stdout.write(err?.message);
          }
        });
      }
    });

    this.rime();
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
      profileText = profileText.replace(/#IMName=/g, "IMName=rime");

      writeFile(profilePath, profileText, (err) => {
        if (err?.message) {
          process.stdout.write(err?.message);
        }
      });
    }

    let uiText = readFileSync(uiPath).toString();

    if (!/SkinType=material/g.test(uiText)) {
      uiText = uiText.replace(/#SkinType=default/g, "SkinType=material");

      writeFile(uiPath, uiText, (err) => {
        if (err?.message) {
          process.stdout.write(err?.message);
        }
      });
    }

    if (!existsSync(`${homedir}/.config/fcitx/rime/installation.yaml`)) {
      // 這一步是爲了生成 rime 的配置文件
      await generateFcitxDir();
      // 以下 10 秒後執行
    }

    ln("/.config/fcitx/rime/emoji_suggestion.yaml");
    ln("/.config/fcitx/rime/grammar.yaml");
    ln("/.config/fcitx/rime/lua");
    ln("/.config/fcitx/rime/luna_pinyin.custom.punctuator.yaml");
    ln("/.config/fcitx/rime/luna_pinyin.custom.dict.yaml");
    ln("/.config/fcitx/rime/luna_pinyin_simp.custom.yaml");
    ln("/.config/fcitx/rime/rime.lua");
    ln("/.config/fcitx/rime/zh-hans-t-essay-bgc.gram");
    ln("/.config/fcitx/rime/zh-hans-t-essay-bgw.gram");

    if (!existsSync(`${homedir}/.config/fcitx/rime/opencc`)) {
      mkdirSync(`${homedir}/.config/fcitx/rime/opencc`);
    }

    await runCommand(
      `wget -O ${homedir}/.config/fcitx/rime/opencc/emoji.json "https://raw.githubusercontent.com/rime/rime-emoji/master/opencc/emoji.json"`
    );

    await runCommand(
      `wget -O ${homedir}/.config/fcitx/rime/opencc/emoji_category.txt "https://raw.githubusercontent.com/rime/rime-emoji/master/opencc/emoji_category.txt"`
    );

    await runCommand(
      `wget -O ${homedir}/.config/fcitx/rime/opencc/emoji_word.txt "https://raw.githubusercontent.com/rime/rime-emoji/master/opencc/emoji_word.txt"`
    );

    const userYamlPath = `${homedir}/.config/fcitx/rime/user.yaml`;

    let userYamlText = readFileSync(userYamlPath).toString();

    userYamlText =
      userYamlText + "\n  previously_selected_schema: luna_pinyin_simp";

    writeFile(userYamlPath, userYamlText, (err) => {
      if (err?.message) {
        process.stdout.write(err?.message);
      }
    });

    if (
      !existsSync(
        `${homedir}/.config/fcitx/rime/build/terra_pinyin.reverse.bin`
      )
    ) {
      try {
        // /home/hexh/workspace/hexh.config/lib
        await runCommand(`mkdir -p ${__dirname}/build`);
        await runCommand(
          `git clone https://github.com/rime/librime ${__dirname}/build/librime`
        );
        await runCommand(
          `sh -c "${__dirname}/build/librime/install-plugins.sh hchunhui/librime-lua"`
        );
        await runCommand(
          `sh -c "${__dirname}/build/librime/install-plugins.sh lotem/librime-octagram"`
        );
        await runCommand(
          `make --directory=${__dirname}/build/librime merged-plugins`
        );
        await runCommand(
          `sudo make --directory=${__dirname}/build/librime install`
        );
        try {
          await runCommand(
            `ln -s /usr/share/rime-data/build/terra_pinyin.reverse.bin ${homedir}/.config/fcitx/rime/build/`
          );
        } catch (e) {
          /* handle error */
        }
      } catch (err: any) {
        console.log(err.message);
      } finally {
        runCommand(`rm -rf ${__dirname}/build`);
      }
    }

    generateFcitxDir();
  }
}
