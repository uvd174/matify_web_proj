import defaults from '../defaults.json'

class Fonts {
  main: string;
  expr: string;
  unicode: string;

  constructor(fonts?: Fonts) {
    this.main = fonts && fonts.main || defaults.fonts.main;
    this.expr = fonts && fonts.expr || defaults.fonts.expr;
    this.unicode = fonts && fonts.unicode || defaults.fonts.unicode;
  }
}

export { Fonts };