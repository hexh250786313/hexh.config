import runCommand from "@/utils/run-command";

async function plum(plugins: string[]) {
  try {
    await runCommand(
      `git clone https://github.com/hexh250786313/plum ${__dirname}/build/plum`
    );

    await Promise.all(
      plugins.map(async (plugin) => {
        await runCommand(
          `sh -c "rime_frontend=fcitx-rime ./rime-install ${plugin}"`,
          {
            cwd: `${__dirname}/build/plum`,
          }
        );
      })
    );
  } catch (err: any) {
    console.log(err.message);
  } finally {
    await runCommand(`rm -rf ${__dirname}/build/plum`);
  }
}

export default plum;
