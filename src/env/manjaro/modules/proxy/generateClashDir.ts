import runCommand from "@/utils/run-command";
import { existsSync } from "fs-extra";
import { homedir } from "os";

export default async function generateClashDir(timeout?: number) {
  try {
    await runCommand("pkill -e clash");
  } catch (e) {
    /* handle error */
  }

  // this step is to generate fcitx diretory and config file: ~/.config/fcitx
  setTimeout(async () => {
    if (!existsSync(`${homedir()}/.config/clash/cache.db`)) {
      process.stdout.write(
        "Failed to generate clash directory, trying again...\n"
      );
      await generateClashDir();
    } else {
      await runCommand("pkill -e clash");
      process.stdout.write(
        "Done generating clash directory, please your clash and click https://clash.razord.top to select a global proxy.\n"
      );
    }
  }, timeout || 60000);

  await runCommand("clash &");
}
