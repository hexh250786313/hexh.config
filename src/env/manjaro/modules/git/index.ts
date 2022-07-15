import runCommand from "@/utils/run-command";
import { existsSync, readdirSync } from "fs-extra";
import { homedir } from "os";
import ln from "../../ln";
import Basic from "../basic";
import config from "./config";
import workspace from "./workspace";

async function cloneMirror(url: string, cwd: string) {
  cwd = cwd.replace(/\/$/g, "");
  const folder = url.split("/").pop()?.replace(".git", "");
  const path = cwd + "/" + folder + ".git/";
  if (!existsSync(path)) {
    process.stdout.write(`Cloning ${folder} ...\n`);
    try {
      await runCommand(`git clone --mirror ${url}`, { cwd });
    } catch (e) {
      await runCommand(`rm -rf ${folder}`, { cwd });
    }
  }
}

async function clone(url: string, cwd: string, args: string[] = []) {
  cwd = cwd.replace(/\/$/g, "");
  const folder = url.split("/").pop()?.replace(".git", "");
  const path = cwd + "/" + folder;
  if (!existsSync(path)) {
    process.stdout.write(`Cloning ${folder} ...\n`);
    try {
      await runCommand(`git clone ${args.join(" ")} ${url}`, { cwd });
    } catch (e) {
      await runCommand(`rm -rf ${folder}`, { cwd });
    }
  }
}

export default class Git {
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
    const basic = new Basic();
    await basic.ssh();
    await this.init();
    // await basic.dotfiles();
    // await this.ln();
    // await this.proxy();
    // await this.unProxy();
  }

  async init() {
    if (!existsSync(homedir() + "/.git-dude")) {
      await runCommand(`mkdir -p ${homedir()}/.git-dude`);
    }
    const promises = config.reduce(async (promise, repo) => {
      return promise.then(() =>
        cloneMirror("https://github.com/" + repo, homedir() + "/.git-dude")
      );
    }, Promise.resolve());
    await promises;

    const deletes = readdirSync(homedir() + "/.git-dude").reduce(
      async (promise: Promise<any>, fileName) => {
        return promise.then(() => {
          if (
            !config.some(
              (repo) => repo.split("/").pop() === fileName.replace(/\.git/g, "")
            )
          ) {
            return runCommand(`rm -rf ${homedir()}/.git-dude/${fileName}`);
          }
          return Promise.resolve("");
        });
      },
      Promise.resolve()
    );
    await deletes;

    process.stdout.write(
      `GitHub SSH key setting url is: https://github.com/settings/keys\n`
    );
    process.stdout.write(`Then run: "ssh -T git@github.com"\n`);
    process.stdout.write(`Remind : input "YES" to confirm. Default is "No"\n`);
  }

  async ln() {
    await ln("/.gitconfig");
    await ln("/.config/autostart/git-dude.desktop");
  }

  async proxy() {
    await runCommand(`git config --global http.proxy http://127.0.0.1:4780`);
    await runCommand(`git config --global https.proxy https://127.0.0.1:4780`);
  }

  async unProxy() {
    await runCommand(`git config --global --unset http.proxy`);
    await runCommand(`git config --global --unset https.proxy`);
  }

  async workspace() {
    if (!existsSync(homedir() + "/workspace")) {
      await runCommand(`mkdir -p ${homedir()}/workspace`);
    }
    const promises = workspace.reduce(async (promise, repo) => {
      return promise.then(() => clone(repo, homedir() + "/workspace"));
    }, Promise.resolve());
    await promises;
  }
}
