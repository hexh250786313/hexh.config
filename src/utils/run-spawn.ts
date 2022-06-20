import { spawn, SpawnOptionsWithoutStdio } from "child_process";
import { platform } from "os";

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
    const exec = spawn(cmd, opts);

    exec.stdout.on("data", (data) => {
      process.stdout.write(data.toString());
    });

    exec.stderr.on("error", (err) =>
      reject(new Error(`exited with ${err.message}\n`))
    );

    exec.on("end", () => resolve(cmd + " end!\n"));
    exec.on("close", () => resolve(cmd + " close!\n"));
  });
}
