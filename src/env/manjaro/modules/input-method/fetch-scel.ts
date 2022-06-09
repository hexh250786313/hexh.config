import runCommand from "@/utils/run-command";
import { readFileSync } from "fs-extra";
import { homedir } from "os";
import { dictSpChar } from "./sh/custom-dict-config";

export default async function fetchScel() {
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
