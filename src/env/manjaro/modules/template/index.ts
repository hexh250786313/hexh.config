export default class _RenameThis {
  async run(args: string[]) {
    let targets: string[] = JSON.parse(JSON.stringify(args));
    if (args.length === 0) {
      targets = ["setup"];
    }

    const allArgsValid = targets.every((T: string) => {
      return (this as any)[T] !== undefined;
    });

    if (allArgsValid) {
      const allPromise = targets.reduce(async (promise, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
      process.stdout.write("OJBK.\n");
    }
  }

  async setup() {
    await this.ln();
  }

  async ln() {
    //
  }
}
