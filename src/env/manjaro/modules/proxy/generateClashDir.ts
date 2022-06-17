import runCommand from "@/utils/run-command";
import { existsSync } from "fs-extra";
import { homedir } from "os";

export default async function generateClashDir(timeout?: number) {
  return new Promise((resolve) => {
    runCommand("pkill -e clash")
      .then(async () => {
        setTimeout(async () => {
          if (!existsSync(`${homedir()}/.config/clash/cache.db`)) {
            process.stdout.write(
              "Failed to generate clash directory, trying again...\n"
            );
            await generateClashDir();
          } else {
            await runCommand("pkill -e clash");
            process.stdout.write(
              "OJBK generating clash directory, please your clash and click https://clash.razord.top to select a global proxy.\n"
            );
            resolve(null);
          }
        }, timeout || 60000);
        await runCommand("clash &");
      })
      .catch(() => {
        /* handle error */
      });
  });

  // try {
  // await runCommand("pkill -e clash");
  // } catch (e) {
  // /* handle error */
  // }
  // setTimeout(async () => {
  // if (!existsSync(`${homedir()}/.config/clash/cache.db`)) {
  // process.stdout.write(
  // "Failed to generate clash directory, trying again...\n"
  // );
  // await generateClashDir();
  // } else {
  // await runCommand("pkill -e clash");
  // process.stdout.write(
  // "OJBK generating clash directory, please your clash and click https://clash.razord.top to select a global proxy.\n"
  // );
  // }
  // }, timeout || 60000);
  // await runCommand("clash &");
}
