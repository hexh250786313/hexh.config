export default class {
  constructor(configs: string[]) {
    process.stdout.write("manjaro " + configs.join("+") + "\n");
  }
}
