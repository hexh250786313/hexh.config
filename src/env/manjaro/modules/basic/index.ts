import runYay from "@/utils/run-yay";

export default class Basic {
  async run(args: string[]) {
    let targets: string[] = JSON.parse(JSON.stringify(args));
    if (args.length === 0) {
      targets = ["setup"];
    }

    const allArgsValid = targets.every((T: string) => {
      return (this as any)[T] !== undefined;
    });

    if (allArgsValid) {
      const allPromise = targets.reduce(async (promise: any, T: string) => {
        return promise.then(() => (this as any)[T]());
      }, Promise.resolve());
      await allPromise;
      process.stdout.write("OJBK.\n");
    }
  }

  async setup() {
    await this.software();
  }

  async dkms() {
    // https://blog.hexuhua.vercel.app/post/19
  }

  async software() {
    const packages = [
      {
        pkg: "cava-git",
        testCommand: "cava",
        // withEnter: true,
      },
    ];

    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;

    await this.inputRemapper();
  }

  async inputRemapper() {
    const packages = [
      {
        pkg: "input-remapper-git",
        testCommand: "/usr/bin/input-remapper-control",
        // withEnter: true,
      },
    ];

    const allPromise = packages.reduce(async (promise, params) => {
      return promise.then(() => runYay(params));
    }, Promise.resolve());
    await allPromise;
  }
}
