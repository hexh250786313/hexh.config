export default class {
  constructor(configs: string[]) {
    process.stdout.write("wsl " + configs.join("+") + "\n");
  }
}
