import { program } from "commander";
import { fileConfig, pkg } from "./constants";
import runCommand from "./utils/run-command";
import Env from "./env";

program.version(pkg.version, "-v, --version").parse(process.argv);

export async function run() {
  const env: "manjaro" | "wsl" = program.args[0] as any;
  const configs = program.args.slice(1, program.args.length);

  const Processor = Env[env];

  if (Processor) {
    const processor = new Processor(configs);

    // runCommand(`echo ${env}`);
    // process.stdout.write(env + "\n");
    // process.stdout.write(configs.join("+") + "\n");
  }
}
