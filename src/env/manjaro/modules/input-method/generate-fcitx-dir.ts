import runCommand from "@/utils/run-command";

export default async function generateFcitxDir(timeout?: number) {
  return new Promise((resolve) => {
    (function attempt() {
      runCommand("pkill -e fcitx")
        .finally(async () => {
          await runCommand("fcitx &");
        })
        .catch(() => {
          //
        });
      setTimeout(async () => {
        try {
          await runCommand("pkill -e fcitx");
        } catch (e: any) {
          console.log(e + "\n");
        }
        resolve(null);
      }, timeout || 60000);
    })();
  });
}
