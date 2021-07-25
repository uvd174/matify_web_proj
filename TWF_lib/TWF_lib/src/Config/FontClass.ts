import defaults from '../defaults.json'

class Fonts {
  main: string;
  expr: string;

  constructor(fonts?: Fonts) {
    this.main = fonts && fonts.main || defaults.fonts.main;
    this.expr = fonts && fonts.expr || defaults.fonts.expr;
  }
}

export { Fonts };