import runCommand from "@/utils/run-command";

export default async function generateFcitxDir(timeout?: number) {
  try {
    await runCommand("killall fcitx");
  } catch (e) {
    /* handle error */
  }

  // this step is to generate fcitx diretory and config file: ~/.config/fcitx
  setTimeout(async () => {
    await runCommand("killall fcitx");
  }, timeout || 10000);

  await runCommand("fcitx &");
}
