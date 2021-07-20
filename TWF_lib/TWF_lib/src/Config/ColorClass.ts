import defaults from '../defaults.json'

interface IColors {
  dark_t: string;
  dark_o: string;
  rich: string;
  background: string;
  gradient_from: string;
  gradient_to: string;
}

class Colors {
  dark_t: string;
  dark_o: string;
  rich: string;
  background: string;
  gradient_from: string;
  gradient_to: string;

  constructor(colors?: IColors) {
    this.dark_t = colors && colors.dark_t || defaults.Colors.dark_t;
    this.dark_o = colors && colors.dark_o || defaults.Colors.dark_o;
    this.rich = colors && colors.rich || defaults.Colors.rich;
    this.background = colors && colors.background ||
                      defaults.Colors.background;
    this.gradient_from = colors && colors.gradient_from ||
                         defaults.Colors.gradient_from;
    this.gradient_to = colors && colors.gradient_to ||
                       defaults.Colors.gradient_to;
  }
}

export { Colors, IColors };