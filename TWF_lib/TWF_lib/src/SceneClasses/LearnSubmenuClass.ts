import * as SVG from '@svgdotjs/svg.js';
import { Config } from '../Config/ConfigClass';
import { Button } from '../GameClasses/ButtonClass';
import { MainMenu } from './MainMenuClass';
import { Level } from './LevelClass';

class LearnSubmenu {
  config: Config;
  levels_json: any;
  svg: SVG.Container;

  constructor(config: Config, levels_json: any) {
    this.config = config;
    this.levels_json = levels_json;
    this.svg = SVG.SVG().addTo('body').size(window.innerWidth,
      window.innerHeight);
    this.svg.rect(window.innerWidth, window.innerHeight).fill(config.color_set.background);

    let title = this.svg.group();
    make_text(title, 'Learn levels', config);
    title.center(this.svg.cx(), 50);

    let main_menu_button = new Button(this.svg, 60, 60, 40, '🡸', config);
    main_menu_button.svg.dmove(20, 20);
    main_menu_button.svg.on('mousedown', () => {
      new MainMenu(config);
      this.clear();
    });

    let levels_cont = this.svg.group();
    const level_button_width = 400;
    const level_button_height = 100;

    let vertical_offset = 0;
    for (let i = 0; i < levels_json.levels.length; ++i) {
      let level_button = new Button(levels_cont, level_button_width, level_button_height, 50, `${this.levels_json.levels[i].code}.`, config);
      level_button.text.cy(level_button.rect.cy()).x(20);
      make_text(level_button.svg, this.levels_json.levels[i].nameRu, config)
        .font({ size: 40 }).cy(level_button.rect.cy()).x(70);

      level_button.svg.on('mousedown', () => {
        new Level(levels_json, i, 0, config, true); // can be stored in some config file
        this.clear();
      })

      level_button.svg.dy(vertical_offset);
      vertical_offset += level_button_height + 5;
    }

    levels_cont.center(this.svg.cx(), 200);
  }

  clear() {
    this.svg.remove();
  }
}

function make_text(cont: SVG.Container, text: string, config: Config) {
  let txt = cont.text(text).font({
    size: 50,
    family: config.font_set.expr,
    fill: config.color_set.dark_t
  });
  // @ts-ignore
  txt.css('user-select', 'none');
  txt.leading(0.9);
  return txt;
}

export { LearnSubmenu };