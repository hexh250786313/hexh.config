import { program } from "commander";
import { pkg } from "./constants";
import Env from "./env";

program.version(pkg.version, "-v, --version").parse(process.argv);

export async function run() {
  const env: keyof typeof Env = program.args[0] as any;
  const module: keyof typeof Env = program.args[1] as any;
  const args = program.args.slice(2, program.args.length);

  const P = Env[env];

  if (P) {
    const moduleValid = (P as any)[module] !== undefined;
    if (moduleValid) {
      const processer = new (P as any)[module]();
      processer.run(args);
    }
  }
}
