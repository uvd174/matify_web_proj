import { Config } from '../Config/ConfigClass';
import * as SVG from '@svgdotjs/svg.js';
import { Button } from '../GameClasses/ButtonClass';
import learn_levels from '../learn_levels.json';
import { LearnSubmenu } from './LearnSubmenuClass';

class MainMenu {
  config: Config;
  svg: SVG.Container;

  constructor(config: Config) {
    this.config = config;
    this.svg = SVG.SVG().addTo('body').size(window.innerWidth,
      window.innerHeight);
    this.svg.rect(window.innerWidth, window.innerHeight).fill(config.color_set.background);

    let title = this.svg.group();
    let title_text = title.text('TriGo')
    title_text
      .font({
        size: 100,
        weight: 'bold',
        family: config.font_set.expr,
        fill: config.color_set.dark_t
      })
      // @ts-ignore
      .css('user-select', 'none')
      .leading(0.9)
      .center(this.svg.cx(), 80);

    let main_box = this.svg.group()
    const main_box_button_width = 300;
    const main_box_button_height = 80;

    let learn_button = new Button(main_box, main_box_button_width, main_box_button_height, 50, 'Learn', config);
    learn_button.svg.center(main_box.cx(), main_box.cy());
    learn_button.svg.on('mousedown', () => {
      new LearnSubmenu(config, learn_levels);
      this.clear();
    });

    let practice_button = new Button(main_box, main_box_button_width, main_box_button_height, 50, 'Practice', config);
    practice_button.svg.center(main_box.cx(), main_box.cy());
    practice_button.svg.dy(Number(learn_button.svg.height()) + 5);
    practice_button.svg.on('mousedown', () => {
      /*
      new PracticeSubmenu(config, practice_levels);
      this.clear();
      */
    });

    main_box.center(window.innerWidth / 2, window.innerHeight / 2);
  }

  clear() {
    this.svg.remove();
  }
}

export { MainMenu };