import { Expr } from '../ExpressionClasses/Expr';
import { Timer } from '../TimerClass/TimerClass';
import { Config } from '../Config/ConfigClass';
import * as SVG from '@svgdotjs/svg.js';
// @ts-ignore
import { TWF_lib } from '../libs/TWF_lib';
import { Button } from '../GameClasses/ButtonClass';
import { MainMenu } from './MainMenuClass';
import { LearnSubmenu } from './LearnSubmenuClass';
import { compiledConfiguration } from '../index';

class Level {
  config: Config;
  levels_json: any;
  level_index: number;
  task_index: number;
  svg: SVG.Container;
  expr: Expr;
  goal: Expr;
  timer: Timer;
  step_counter: SVG.Text;
  is_completed: boolean;
  is_info_shown: boolean;
  lefts_list: Array<any>;
  rights_list: Array<any>;
  state_stack: Array<string>;
  subs_cont: SVG.Container;
  subs_window: SVG.Container;

  constructor(levels_json: any, level_index: number, task_index: number, config: Config, show_info: boolean) {
    this.level_index = level_index;
    this.task_index = task_index;
    this.config = config;
    this.levels_json = levels_json;
    this.is_info_shown = show_info;
    this.svg = SVG.SVG().addTo('body').size(window.innerWidth,
      window.innerHeight);
    this.svg.rect(window.innerWidth, window.innerHeight).fill(config.color_set.background);

    let task = levels_json.levels[level_index].tasks[task_index];

    this.goal = new Expr(task.goalExpressionStructureString, this.svg, false, 100, config);
    this.goal.svg.remove();
    this.expr = new Expr(task.originalExpressionStructureString, this.svg, true, 100, config);
    PutExpr(this.expr, this.svg);

    this.is_completed = false;
    this.lefts_list = [];
    this.rights_list = [];

    this.state_stack = [ task.originalExpressionStructureString ];

    this.subs_window = this.svg.nested();
    const subs_window_width = window.innerWidth - 200;
    const subs_window_height = window.innerHeight / 2.7;
    this.subs_window
      .size(subs_window_width, subs_window_height)
      .move(100, window.innerHeight / 5 * 3)
      .rect(subs_window_width, subs_window_height)
      .fill(config.color_set.background).radius(10);

    this.subs_cont = this.subs_window.group();

//===============================top_interface_init============================

    const top_interface_margin = 50;

    let levels_menu_button = new Button(this.svg, 60, 60, 40, '🡸', config);
    levels_menu_button.svg.center(50, top_interface_margin);
    levels_menu_button.svg.on('mousedown', () => {
      new LearnSubmenu(config, levels_json);
      this.clear();
    });

    this.timer = new Timer(this.svg, 50, config);
    this.timer.svg.center(window.innerWidth / 2, top_interface_margin);

    let step_counter_indicator = this.svg.group();
    this.step_counter = make_text(step_counter_indicator, '0', config)
      .center(step_counter_indicator.cx(), step_counter_indicator.cy());
    step_counter_indicator.center((levels_menu_button.svg.cx() + this.timer.svg.cx()) / 2,
      top_interface_margin);

    const reset_button_width = 60;
    const reset_button_height = 60;
    let reset_button = new Button(this.svg, reset_button_width, reset_button_height, 50, '\u27F2', config);
    reset_button.svg.on('mousedown', () => {
      this.clear();
      new Level(levels_json, level_index, task_index, config, false);
    });
    reset_button.svg.center(window.innerWidth * 3.5 / 5, top_interface_margin);

    const undo_button_width = 60;
    const undo_button_height = 60;
    let undo_button = new Button(this.svg, undo_button_width, undo_button_height, 45, '\u27F5', config);
    undo_button.svg.on('mousedown', () => {
      if (this.state_stack.length === 1) {
        return;
      }
      this.lefts_list = [];
      this.rights_list = [];
      this.state_stack.pop();
      this.step_counter.text(`${this.state_stack.length - 1}`);
      // @ts-ignored
      this.expr.string = this.state_stack[this.state_stack.length - 1];
      this.expr.RebuildExpr();
      this.expr.svg.on('click', this.rebuildSubsMenu.bind(this));
      PutExpr(this.expr, this.svg);
    });

    undo_button.svg.center(window.innerWidth * 4 / 5, top_interface_margin);

    const unmark_button_width = 60;
    const unmark_button_height = 60;
    let unmark_button = new Button(this.svg, unmark_button_width, unmark_button_height, 45, '🧽', config);
    unmark_button.svg.on('mousedown', () => {
      this.expr.UnmarkExpr(); //TODO============================
      this.lefts_list = [];
      this.rights_list = [];
      this.subs_cont.remove();
    });
    unmark_button.svg.center(window.innerWidth * 4.5 / 5, top_interface_margin);

    //document.addEventListener('keydown', spaceDown);
    //document.addEventListener('keyup', spaceUp);

    let pretty_line = this.svg.group();
    pretty_line.line(10,
      top_interface_margin * 2,
      window.innerWidth - 10,
      top_interface_margin * 2)
      .stroke({ width: 3, color: config.color_set.dark_o });

//===============================top_interface_init============================

    let task_description = this.svg.group();

    if (task.goalType === 'CUSTOM') {
      make_text(task_description, task.descriptionRu, config).font({
        size: 20
      });
      task_description.cx(this.svg.cx()).y(Number(pretty_line.y()) + 25);
    } else if (task.goalType === 'EXPR') {
      let task_description = new Expr(task.goalExpressionStructureString, this.svg, false, 100, config);
      task_description.svg.cx(this.svg.cx()).y(Number(pretty_line.y()) + 25);
    }

    if (show_info) {
      this.timer.stop();
      let shade = this.svg.group();
      shade.rect(Number(this.svg.width()), Number(this.svg.height())).fill({
        color: '#000',
        opacity: 0.5
      });

      let info = this.svg.group();
      let info_title = info.group();
      make_text(info_title, levels_json.levels[level_index].nameRu, config)
        .font({
          size: 30
        });

      let description = make_text(info, levels_json.levels[level_index].descriptionRu, config)
        .font({
          leading: 1.5,
          size: 20
        });

      const info_width = description.bbox().width + 60;
      const info_height = window.innerHeight * 2 / 3;
      info
        .rect(info_width, info_height)
        .radius(10)
        .fill(config.color_set.background)
        .stroke({ color: config.color_set.rich, width: 5 })
        .after(description).after(info_title);

      info_title.cx(info.cx()).dy(20);
      description.cx(info.cx()).dy(150);

      const check_button_width = 100;
      const check_button_height = 60;
      let check_button = new Button(info, check_button_width, check_button_height, 45, '✓', config);
      check_button.svg.cx(info.cx()).dy(info_height * 3 / 4);

      info.cx(this.svg.cx()).dy(30);

      shade.on('mousedown', () => remove_info(this));
      check_button.svg.on('mousedown', () => remove_info(this));

      function remove_info(level: Level){
        level.timer.start();
        shade.remove();
        info.remove();
      }
    }

    this.expr.svg.on('click', this.rebuildSubsMenu.bind(this));
    this.subs_window.on('click', this.rebuildLevel.bind(this));
  }

  clear() {
    this.svg.remove();
    if (this.timer.is_active) {
      clearInterval(this.timer.intervalId);
    }
  }

  rebuildLevel() {
    this.expr.RebuildExpr();
    this.expr.svg.on('click', this.rebuildSubsMenu.bind(this));
    this.lefts_list = [];
    this.rights_list = [];
    this.state_stack.push(this.expr.string);
    this.step_counter.text(`${this.state_stack.length - 1}`);
    this.rebuildSubsMenu();
    PutExpr(this.expr, this.svg);
    if (this.expr.string === this.goal.string) {
      this.MakeWinMenu();
    }
  }

  MakeWinMenu() {
    let win_shade = this.svg.group();
    win_shade.rect(Number(this.svg.width()), Number(this.svg.height())).fill({
      color: this.config.color_set.rich,
      opacity: 0.6
    });

    clearInterval(this.timer.intervalId);

    let win_box = this.svg.group();
    win_box
      .rect(450, window.innerHeight / 3)
      .fill(this.config.color_set.background)
      .radius(10);

    let win_title = win_box.group();
    make_text(win_title, 'Level completed!', this.config).center(win_title.cx(),
      win_title.cy());
    win_title.center(win_box.cx(), Number(win_box.height()) / 3);

    const bottom_offset = Number(win_box.height()) - 50;

    if (this.task_index !== this.levels_json.levels.length) {

      const next_button_width = 100;
      const next_botton_height = 80;
      let next_button = new Button(win_box, next_button_width, next_botton_height, 70, '➔', this.config);

      next_button.svg
        .cx(win_box.cx())
        .cy(bottom_offset)
        .on('mousedown', () => {
          new Level(this.levels_json, this.level_index, this.task_index + 1, this.config, false);
          this.clear();
        })
    }

    let reset_button = new Button(win_box, 60, 60, 50, '\u27F2', this.config);
    reset_button.svg.cx(win_box.cx() + 100).cy(bottom_offset);
    reset_button.svg.on('mousedown', () => {
      new Level(this.levels_json, this.level_index, this.task_index, this.config, false);
      this.clear();
    })

    let learn_submenu_button = new Button(win_box, 60, 60, 40, '🡸', this.config);
    learn_submenu_button.svg.cx(win_box.cx() - 100)
      .cy(bottom_offset)
      .on('mousedown', () => {
        new LearnSubmenu(this.config, this.levels_json)
        this.clear();
      })

    win_box.center(this.svg.cx(), window.innerHeight / 2 - 60)
  }

  rebuildSubsMenu() {
    this.rights_list = [];
    if (this.expr.multi_id_list.length !== 0) {
      this.rights_list = (TWF_lib.findApplicableSubstitutionsInSelectedPlace(
        TWF_lib.structureStringToExpression(this.expr.string),
        this.expr.multi_id_list,
        compiledConfiguration)).toArray();
    }
    this.lefts_list = [];
    for (let i = 0; i < this.rights_list.length; i++) {
      if (this.rights_list[i].resultExpression.toString() === "To get application result use argument 'withReadyApplicationResult' = 'true'()") continue;
      this.lefts_list.push([this.rights_list[i].originalExpressionChangingPart.toString(),
        this.rights_list[i].resultExpressionChangingPart.toString()])
    }
    this.subs_cont.remove();
    this.subs_cont = MakeSubsMenu(this.subs_window, this.lefts_list, this.rights_list, this.config, this.expr);
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


function PutExpr(expr: Expr, app: SVG.Container) {
  const width_limit = window.innerWidth - 200;
  const height_limit = window.innerHeight / 3;

  let current_width_ratio = expr.svg.bbox().width / width_limit;
  let current_height_ratio = expr.svg.bbox().height / height_limit

  if (current_width_ratio > 1 || current_height_ratio > 1) {
    expr.font_size = 100 / Math.max(current_width_ratio, current_height_ratio);
    expr.RebuildExpr();
  }

  expr.svg.cx(app.cx());
  expr.svg.cy(window.innerHeight / 2.4);
}

function MakeSubsMenu(window: SVG.Container, list_of_lefts: Array<string>,
  list_of_rights: Array<string>, config: Config, expr: Expr) {
  if (list_of_lefts.length !== list_of_rights.length) {
    console.log('left-rights error!');
  }

  let subs_menu = window.group();
  let subs_menu_height = 4;
  for (let i = 0; i < list_of_lefts.length; ++i) {

    let inner_cont = subs_menu.group();
    const inner_cont_width = Number(window.width()) - 8;
    const inner_cont_default_height = 65;

    let left_sub = new Expr(list_of_lefts[i][0], inner_cont, false, 50, config)
      .svg.x(10);

    let horizontal_offset = Number(inner_cont.width()) + 10;

    let right_arrow_box = inner_cont.group();
    let right_arrow = make_text(right_arrow_box, '\u27F6', config)
      .x(horizontal_offset);

    horizontal_offset = Number(inner_cont.width()) + 10;

    let right_sub;
    try {
      right_sub = new Expr(list_of_lefts[i][1], inner_cont, false, 50, config)
        .svg.x(horizontal_offset);
    } catch (error) {
      left_sub.remove();
      right_arrow.remove();
      console.log("Error occurred!");
      continue;
    }

    horizontal_offset = Number(inner_cont.width()) + 40;

    if (horizontal_offset > inner_cont_width ||
      inner_cont.height() > inner_cont_default_height * 2) {
      let max_ratio = Math.max(inner_cont_width / horizontal_offset,
        Number(inner_cont.height()) / (inner_cont_default_height * 2));

      left_sub.remove();
      right_arrow.remove();
      right_sub.remove();

      left_sub = new Expr(list_of_lefts[i][0], inner_cont, false, 50 / max_ratio, config).svg.x(10);

      right_arrow = make_text(right_arrow_box, '\u27F6', config)
        .font({ size: 50 / max_ratio })
        .x(left_sub.bbox().width + 10);

      right_sub = new Expr(list_of_lefts[i][1], inner_cont, false, 50 / max_ratio, config)
        .svg.x(left_sub.bbox().width + right_arrow.bbox().width + 10);
    }

    new Button(inner_cont, inner_cont_width, Number(inner_cont.height()), 0, '', config).svg
      .stroke({ width: 4 })
      .back();

    inner_cont.on('mousedown', () => {
      // @ts-ignore
      expr.string = list_of_rights[i].resultExpression.toString();
    });

    left_sub.cy(inner_cont.cy());
    right_arrow.cy(inner_cont.cy());
    right_sub.cy(inner_cont.cy());

    inner_cont.dx(2).y(subs_menu_height);

    subs_menu_height += Number(inner_cont.height()) + 4;
  }

  subs_menu.dy(2);

  return subs_menu;
}

export { Level };