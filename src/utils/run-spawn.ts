import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { platform } from "os";
import { emitKeypressEvents } from "readline";

emitKeypressEvents(process.stdin);

/** runCommand
 * @desc Runs a command in the shell
 *  */
export default function (
  /** The command to run */
  cmd: string,
  /** Options to pass to exec */
  opts: SpawnOptionsWithoutStdio = {}
): Promise<string> {
  if (platform() === "win32") {
    opts.shell = opts.shell || process.env.SHELL;
  }
  return new Promise<string>((resolve, reject) => {
    const cmds = cmd.split(" ");
    const exec = spawn(cmds[0], cmds.slice(1), opts);

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.on("keypress", (...args: any[]) => {
      if (args[0] === "\x03") {
        process.exit();
      }
      if (args[0] === "\r") {
        exec.stdin.write("\n");
      }
      if (args[0]) {
        exec.stdin.write(args[0]);
      }
    });

    exec.stdout.on("data", (data) => process.stdout.write(data.toString()));

    exec.stderr.on("error", (err) =>
      reject(new Error(`exited with ${err.message}\n`))
    );

    exec.stderr.on("data", (data) => process.stdout.write(data.toString()));

    exec.on("end", () => {
      // process.stdin.setRawMode(false);
      // process.stdin.removeAllListeners("keypress");
      process.stdin.destroy();
      resolve(cmd + " end!\n");
    });
    exec.on("close", () => {
      // process.stdin.setRawMode(false);
      // process.stdin.removeAllListeners("keypress");
      process.stdin.destroy();
      resolve(cmd + " close!\n");
    });
  });
}
