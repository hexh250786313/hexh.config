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

      const allPromise = targets.reduce(async (promise, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
      await generateFcitxDir();
      process.stdout.write("OJBK. Please restart your fcitx.\n");
    }
  }

  async setup() {
    await this.font();
    await this.fcitx();
    await this.rime();
    await this.plum();
    await this.fetchSogouScel();
    await this.emoji();
  }

  async ln() {
    await ln("/.config/fcitx/rime/lua");
    await ln("/.config/fcitx/rime/luna_pinyin_simp.custom.yaml");
    await ln("/.config/fcitx/rime/rime.lua");
    await ln("/.config/fcitx/rime/default.custom.yaml");
    await ln("/.config/fcitx/rime/double_pinyin_abc.custom.yaml");
  }

  async font() {
    const packages = [
      {
        pkg: "wqy-bitmapfont",
        testPath: "/usr/share/fontconfig/conf.avail/85-wqy-bitmapsong.conf",
      },
      {
        pkg: "wqy-zenhei",
        testPath: "/usr/bin/zenheiset",
      },
      {
        pkg: "noto-fonts-emoji",
        testPath: "/usr/share/fonts/noto/NotoColorEmoji.ttf",
      },
    ];

    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;

    if (!existsSync(`/usr/share/fonts/custom`)) {
      process.stdout.write(`Handling big fonts...\n`);
      await runCommand(`sudo mkdir -p /usr/share/fonts/custom`);
      await runCommand(
        `sudo cp ${homedir()}/桌面/share/fonts/mingliub.ttc ${homedir()}/桌面/share/fonts/Sun-ExtA.ttf ${homedir()}/桌面/share/fonts/Sun-ExtB.ttf /usr/share/fonts/custom`
      );
      await runCommand(`sudo chmod 744 /usr/share/fonts/custom/*.ttc`);
      await runCommand(`sudo mkfontscale`, { cwd: "/usr/share/fonts/custom" });
      await runCommand(`sudo mkfontdir`, { cwd: "/usr/share/fonts/custom" });
      await runCommand(`sudo fc-cache -fv`, { cwd: "/usr/share/fonts/custom" });
    }

    if (!existsSync(`${homedir()}/.local/share/fonts/NerdFonts`)) {
      process.stdout.write(`Fetching NerdFonts...\n`);
      try {
        await runCommand(
          `rm -rf ${__dirname}/build/nerd-fonts/nerd-fonts-master`
        );
      } catch (e) {
        /* handle error */
      }
      try {
        await runCommand(`mkdir -p ${__dirname}/build/nerd-fonts`);
      } catch (e) {
        /* handle error */
      }
      if (!existsSync(`${__dirname}/build/nerd-fonts/fonts.zip`)) {
        await runCommand(
          `curl -L -o ${__dirname}/build/nerd-fonts/fonts.zip https://github.com/ryanoasis/nerd-fonts/archive/refs/heads/master.zip `
        );
      }
      await runCommand(`7z x fonts.zip -r -o./`, {
        cwd: `${__dirname}/build/nerd-fonts`,
      });

      await runCommand(`./install.sh`, {
        cwd: `${__dirname}/build/nerd-fonts/nerd-fonts-master`,
      });
      await runCommand(`rm -rf ${__dirname}/build/nerd-fonts`);
    }

    if (
      !existsSync(
        `${homedir()}/.local/share/fonts/NerdFonts/Caskaydia Cove Bold Nerd Font Complete.otf`
      )
    ) {
      process.stdout.write(`Fetching CascadiaCode...\n`);
      await runCommand(`rm -rf ${__dirname}/build/CascadiaCode`);
      await runCommand(`mkdir -p ${__dirname}/build/CascadiaCode`);
      await runCommand(
        `curl -L -o ${__dirname}/build/CascadiaCode/CascadiaCode.zip https://github.com/ryanoasis/nerd-fonts/releases/download/2.2.0-RC/CascadiaCode.zip`
      );
      await runCommand(
        `unzip ${__dirname}/build/CascadiaCode/CascadiaCode.zip`,
        {
          cwd: `${__dirname}/build/CascadiaCode`,
        }
      );
      await runCommand(`cp *.otf ${homedir()}/.local/share/fonts/NerdFonts`, {
        cwd: `${__dirname}/build/CascadiaCode`,
      });
      await runCommand(`rm -rf ${__dirname}/build/CascadiaCode`);
    }

    await runYay({
      pkg: "nerd-fonts-sarasa-mono",
      testPath:
        "/usr/share/fonts/nerd-fonts-sarasa-mono/sarasa-mono-sc-nerd-bold.ttf",
    });
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

    if (!existsSync(`${homedir()}/.config/fcitx/rime/user.yaml`)) {
      // 這一步是爲了生成 rime 的配置文件
      await generateFcitxDir();
      // 以下 10 秒後執行
    }

    await this.ln();

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
        await runCommand(`rm -rf ${__dirname}/build/librime`);
        throw new Error("librime install failed");
      }
      await runCommand(`rm -rf ${__dirname}/build/librime`);
    }
  }

  async plum() {
    process.stdout.write("Plum Processing...\n");

    await plum([
      "hexh250786313/rime-emoji",
      "hexh250786313/rime-easy-en",
      "hexh250786313/rime-octagram-data hexh250786313/rime-octagram-data@hans",
      "double-pinyin",
    ]);

    this.emoji();
  }

  async fetchSogouScel() {
    process.stdout.write("Scel fetching...\n");

    try {
      await runCommand(`rm -rf ${__dirname}/build/scel-rime`);
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

  async emoji() {
    await runCommand(
      `perl -0777 -i -pe 's/tips:.*//g' ${homedir()}/.config/fcitx/rime/emoji_suggestion.yaml`
    );
  }

  async otherDict() {
    // https://github.com/felixonmars/fcitx5-pinyin-zhwiki/releases
    const zhwiki = `https://github.com/felixonmars/fcitx5-pinyin-zhwiki/releases/download/0.2.4/zhwiki-20220722.dict.yaml`;
    // https://github.com/outloudvi/mw2fcitx/releases
    const moegirl = `https://github.com/outloudvi/mw2fcitx/releases/download/20220714/moegirl.dict.yaml`;
    await fetchOtherDict("zhwiki", zhwiki);
    await fetchOtherDict("moegirl", moegirl);
  }
}

async function fetchOtherDict(name: string, url: string) {
  await runCommand(`rm -rf ${__dirname}/build/${name}.dict.yaml`, {
    cwd: `${__dirname}/build`,
  });
  try {
    await runCommand(`curl -L -o ./${name}.dict.yaml ${url}`, {
      cwd: `${__dirname}/build`,
    });
    await runCommand(
      `perl-rename 's/${name}.*dict.yaml/luna_pinyin_simp.${dictSpChar}.${name}.dict.yaml/' *.dict.yaml`,
      {
        cwd: `${__dirname}/build`,
      }
    );
    await runCommand(
      `rm -rf ./luna_pinyin_simp.${dictSpChar}.${name}.dict.yaml`,
      {
        cwd: `${homedir()}/.config/fcitx/rime`,
      }
    );
    await runCommand(
      `cp -r ${__dirname}/build/luna_pinyin_simp.${dictSpChar}.${name}.dict.yaml ${homedir()}/.config/fcitx/rime/`
    );
    if (
      !readFileSync(
        `${homedir()}/.config/fcitx/rime/luna_pinyin_simp.custom.dict.yaml`
      )
        .toString()
        .includes("${name}")
    ) {
      await runCommand(
        `perl -0777 -i -pe 's/\\.\\.\\./\u0020\u0020-\u0020luna_pinyin_simp.${dictSpChar}.${name}\n\\.\\.\\./g' ${homedir()}/.config/fcitx/rime/luna_pinyin_simp.custom.dict.yaml`
      );
    }
  } catch (e) {
    console.log(e);
  } finally {
    await runCommand(
      `rm -rf ${__dirname}/build/luna_pinyin_simp.${dictSpChar}.${name}.dict.yaml`,
      {
        cwd: `${__dirname}/build`,
      }
    );
  }
}
