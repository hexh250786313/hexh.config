import runCommand from "@/utils/run-command";
import { existsSync } from "fs-extra";
import { homedir } from "os";

export default async function generateClashDir(timeout?: number) {
  return new Promise((resolve) => {
    (function attempt(count) {
      count = count ? count : 1;
      runCommand("pkill -e clash")
        .finally(async () => {
          process.stdout.write("Clash is killed...\n");
          process.stdout.write("Clash is running...\n");
          await runCommand(
            "unset all_proxy && unset http_proxy && unset https_proxy && clash &"
          );
        })
        .catch(() => {
          //
        });
      setTimeout(async () => {
        if (!existsSync(`${homedir()}/.config/clash/cache.db`)) {
          process.stdout.write(
            "Failed to generate clash directory, trying again...\n"
          );
          attempt(count + 1);
        } else {
          process.stdout.write(
            "OJBK generating clash directory, please restart your clash and click https://clash.razord.top to select a global proxy.\n"
          );
          try {
            await runCommand("pkill -e clash");
          } catch (e: any) {
            console.log(e + "\n");
          }
          resolve(null);
        }
      }, (timeout || 60000) * count);
    })(1);
  });
}
