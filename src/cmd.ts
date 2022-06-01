import { program } from "commander";
import { pkg } from "./constants";
import Env from "./env";

program.version(pkg.version, "-v, --version").parse(process.argv);

export async function run() {
  const env: keyof typeof Env = program.args[0] as any;
  const scripts = program.args.slice(1, program.args.length);

  const Processor = Env[env];

  if (Processor && scripts.length) {
    const processor = new Processor();

    const allScriptsValid = scripts.every(
      (script) => (processor as any)[script] !== undefined
    );

    if (allScriptsValid) {
      const promises = scripts.map((script) => {
        return (processor as any)[script]();
      });

      await Promise.all(promises);
    }
  }
}
