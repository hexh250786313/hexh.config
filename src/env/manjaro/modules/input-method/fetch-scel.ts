import runCommand from "@/utils/run-command";
import { readFileSync, writeFileSync } from "fs-extra";
import { homedir } from "os";
import { customDictConfig, dictSpChar } from "./sh/custom-dict-config";

async function fetchSogouScel() {
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

async function fetchScel() {
  await runCommand(`sh -c "${__dirname}/build/scel-rime/fetch.sh"`, {
    cwd: `${__dirname}/build/scel-rime`,
  });
  const filePaths = await runCommand(
    `find ${homedir()}/.config/fcitx/rime -type f -name '*${dictSpChar}*'`
  );

  if (filePaths) {
    const filePathsArray = filePaths
      .split("\n")
      .filter((path) => path && new RegExp(`.*${dictSpChar}.*`, "g"));

    const someEmpty = filePathsArray.some((path) => {
      const text = readFileSync(path).toString();
      return !/(.*\n){10,}/g.test(text);
    });

    if (someEmpty) {
      process.stdout.write("Scel fetch failed. Again fetching...\n");
      await fetchScel();
    }
  }
}

export default fetchSogouScel;
