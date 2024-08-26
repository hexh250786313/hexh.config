import runCommand from "@/utils/run-command";
import runPacman from "@/utils/run-pacman";
import { existsSync, readFileSync, writeFileSync } from "fs-extra";
import { homedir } from "os";
import ln from "../../ln";
import generateClashDir from "./generateClashDir";
import clashConfig from "./yaml/clash-config";

export default class Proxy {
  private proxyCommand = [
    'export all_proxy="socks5://127.0.0.1:4780"',
    'export http_proxy="http://127.0.0.1:4780"',
    'export https_proxy="http://127.0.0.1:4780"',
  ];

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
        await runCommand(`pkill -e clash`);
        process.stdout.write("Clash killed...\n");
      } catch (e) {
        /* handle error */
      }
      const allPromise = targets.reduce(async (promise, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
      process.stdout.write("OJBK. Please restart your clash.\n");
    }
  }

  async setup() {
    await this.clash();
    await this.generate();
    await this.fetchYaml();
    await this.systemProxySet();
    this.bashProxySet();
    // await this.ln();
  }

  bashProxySet() {
    const path = `${homedir()}/.bashrc`;
    let target = "";
    if (existsSync(path)) {
      target = readFileSync(path).toString();
    }

    this.proxyCommand.forEach((text) => {
      if (!target.includes(text)) {
        writeFileSync(path, "\n" + text, { flag: "a" });
      }
    });
  }

  public async ln() {
    await ln("/.config/autostart/clash.desktop");
  }

  async clash() {
    await runCommand(`timedatectl set-ntp true`);
    await runPacman({
      pkg: "clash",
      testCommand: "clash",
      // withEnter: true,
    });
  }

  async systemProxySet() {
    const systemProxyPath = `/etc/sudoers.d/05_proxy`;
    const targetText = ['Defaults env_keep += "*_proxy *_PROXY"'];
    let systemProxyText = "";
    try {
      systemProxyText = await runCommand(`sudo cat ${systemProxyPath}`);
    } catch (e) {
      /* handle error */
    }

    const promises = targetText.reduce(async (promise: Promise<any>, text) => {
      return promise.then(async () => {
        if (!systemProxyText.includes(text)) {
          // echo not work for root file even if use sudo, so use tee
          // await runCommand(`sudo echo '${text}' > ${systemProxyPath}`);
          return runCommand(`echo '${text}' | sudo tee ${systemProxyPath}`) // # add -a for append (>>)
            .then(() => {
              console.log("OJBK for system proxy");
            });
        }
      });
    }, Promise.resolve());
    await promises;
  }

  async xProxySet() {
    const xprofilePath = `${homedir()}/.xprofile`;
    let xprofileText = "";
    if (existsSync(xprofilePath)) {
      xprofileText = readFileSync(xprofilePath).toString();
    }

    this.proxyCommand.forEach((text) => {
      if (!xprofileText.includes(text)) {
        writeFileSync(xprofilePath, "\n" + text, { flag: "a" });
      }
    });
  }

  async xProxyUnset() {
    const xprofilePath = `${homedir()}/.xprofile`;
    let xprofileText = "";
    if (existsSync(xprofilePath)) {
      xprofileText = readFileSync(xprofilePath).toString();
    }

    this.proxyCommand.forEach((text) => {
      if (xprofileText.includes(text)) {
        xprofileText = xprofileText.replace(text, "");
      }
    });

    writeFileSync(xprofilePath, xprofileText);
  }

  async generate() {
    if (!existsSync(`${homedir()}/.config/clash/cache.db`)) {
      process.stdout.write("No clash cache.db found, generating...\n");
      await generateClashDir();
    }
  }

  async fetchYaml() {
    try {
      await runCommand("pkill -e clash");
    } catch (e) {
      /* handle error */
    }

    await this.generate();

    process.stdout.write("Fetching yaml file...\n");
    await runCommand(
      `unset all_proxy && unset http_proxy && unset https_proxy && curl -L -o ${homedir()}/.config/clash/config.yaml https://qikapiu.hexh.xyz`
    );

    await runCommand(
      `perl -0777 -i -pe "s/port(.*\n){8}.*dns:/${clashConfig}/gi" ${homedir()}/.config/clash/config.yaml`
    );

    const command = this.proxyCommand.join(" && ");
    process.stdout.write("" + command + "\n");
    process.stdout.write("https://clash.razord.top/" + "\n");
  }
}
