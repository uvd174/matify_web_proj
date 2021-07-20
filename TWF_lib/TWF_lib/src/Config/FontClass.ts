import defaults from '../defaults.json'

interface IFonts {
  main: string;
  expr: string;
}

class Fonts {
  main: string;
  expr: string;

  constructor(fonts?: IFonts) {
    this.main = fonts && fonts.main || defaults.Fonts.main;
    this.expr = fonts && fonts.expr || defaults.Fonts.expr;
  }
}

export { Fonts, IFonts };