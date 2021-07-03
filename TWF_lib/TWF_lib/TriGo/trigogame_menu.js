function MakeMainMenu(game) {
  let app = new SVG().addTo('body').size(window.innerWidth,
                                         window.innerHeight);
  app.rect(window.innerWidth, window.innerHeight).fill(Colors.background);

  let title = app.group();
  let title_text = make_text(title, 'TriGo');
  title_text
    .font({
            size: 100,
            weight: 'bold'
          })
    .center(app.cx(), 80);

  let main_box = app.group()
  const main_box_button_width = 300;
  const main_box_button_height = 80;

  let learn_button = main_box.group().center(main_box.cx(), main_box.cy());
  make_interactive(learn_button, main_box_button_width,
                   main_box_button_height);
  make_text(learn_button, 'Learn').center(learn_button.cx(),
                                          learn_button.cy());
  learn_button.on('mousedown', () => {
    cleanMainMenu();
    MakeLearnLevelsMenu(game);
  });

  let practice_button = main_box.group().center(main_box.cx(), main_box.cy());
  make_interactive(practice_button, main_box_button_width,
                   main_box_button_height);
  make_text(practice_button, 'Practice').center(practice_button.cx(),
                                                practice_button.cy());
  practice_button.on('mousedown', () => {
    cleanMainMenu();
    MakePracticeLevelsMenu(game);
  });
  practice_button.dy(learn_button.height() + 5)

  main_box.center(window.innerWidth / 2,
                  window.innerHeight / 2);

  function cleanMainMenu() {
    app.remove();
  }
}


function MakeLearnLevelsMenu(game) {
  let app = new SVG().addTo('body').size(window.innerWidth,
                                         window.innerHeight);
  app.rect(window.innerWidth, window.innerHeight).fill(Colors.background);

  let title = app.group();
  make_text(title, 'Learn levels');
  title.center(app.cx(), 50);

  let main_menu_button = make_main_menu_button(app);
  main_menu_button.dmove(20, 20);
  main_menu_button.on('mousedown', () => {
    cleanLearnLevelsMenu();
    MakeMainMenu(game);
  });

  let levels_cont = app.group();
  const level_button_width = 400;
  const level_button_height = 100;

  let vertical_offset = 0;
  for (let i = 0; i < game.levels.length; ++i) {
    let level_button = levels_cont.group();
    make_interactive(level_button, level_button_width, level_button_height);

    level_button.on('mousedown', () => {
      cleanLearnLevelsMenu();
      MakeLearnLevelScene(game, i, 0, true);
    })

    make_text(level_button, `${game.levels[i].code}.`)
      .font({ size: 40 }).cy(level_button.cy()).dx(20);

    make_text(level_button, game.levels[i].nameRu)
      .font({ size: 40 }).cy(level_button.cy()).dx(70);

    level_button.dy(vertical_offset);
    vertical_offset += level_button_height + 5;
  }

  levels_cont.cx(app.cx()).y(200);

  function cleanLearnLevelsMenu() {
    app.remove();
  }
}


function MakePracticeLevelsMenu(game) {
  let app = new SVG().addTo('body').size(window.innerWidth,
                                         window.innerHeight);
  app.rect(window.innerWidth, window.innerHeight).fill(Colors.background);

  let title = app.group();
  make_text(title, 'Coming soon');
  title.center(app.cx(), 50);

  let main_menu_button = make_main_menu_button(app);
  main_menu_button.dmove(20, 20);
  main_menu_button.on('mousedown', () => {
    cleanPracticeLevelsMenu();
    MakeMainMenu(game);
  })

  function cleanPracticeLevelsMenu() {
    app.remove();
  }
}


function MakeLearnLevelScene(game, level_index, task_index, show_info) {
  let app = new SVG().addTo('body').size(window.innerWidth,
                                         window.innerHeight);
  app.rect(window.innerWidth, window.innerHeight).fill(Colors.background);

  let task = game.levels[level_index].tasks[task_index];

  let goal_tree_root = TWF_lib.structureStringToExpression(
    task.goalExpressionStructureString
  );

  let expr_tree_root = TWF_lib.structureStringToExpression(
    task.originalExpressionStructureString
  );

  let state_stack = [];
  let expr = PutExpr(expr_tree_root, app);
  state_stack.push(task.originalExpressionStructureString);

  let subs_window = app.nested();
  const subs_window_width = window.innerWidth - 200;
  const subs_window_height = window.innerHeight / 2.7;
  subs_window
    .size(subs_window_width, subs_window_height)
    .move(100, window.innerHeight / 5 * 3)
    .rect(subs_window_width, subs_window_height)
    .fill(Colors.background).radius(10);

  let subs_cont = subs_window.group();

//===============================top_interface_init============================

  const top_interface_margin = 50;

  let levels_menu_button = make_main_menu_button(app);
  levels_menu_button.center(50, top_interface_margin);
  levels_menu_button.on('mousedown', () => {
    cleanLevelScene();
    MakeLearnLevelsMenu(game);
  });

  let timer_box = app.group();
  let intervalId;
  let timer = initTimer(timer_box, 50).center(timer_box.cx(), timer_box.cy());
  timer_box.center(window.innerWidth / 2, top_interface_margin);

  let step_counter_indicator = app.group();
  let counter = make_text(step_counter_indicator, '0')
    .center(step_counter_indicator.cx(), step_counter_indicator.cy());
  step_counter_indicator.center((levels_menu_button.cx() + timer_box.cx()) / 2,
                                top_interface_margin);

  let reset_button = app.group();
  const reset_button_width = 60;
  const reset_button_height = 60;
  make_interactive(reset_button, reset_button_width, reset_button_height);
  make_text(reset_button, '\u27F2').center(reset_button.cx(),
                                           reset_button.cy());
  reset_button.on('mousedown', () => {
    cleanLevelScene();
    MakeLearnLevelScene(game, level_index, task_index, false);
  });
  reset_button.center(window.innerWidth * 3.5 / 5, top_interface_margin);

  let undo_button = app.group();
  const undo_button_width = 60;
  const undo_button_height = 60;
  make_interactive(undo_button, undo_button_width, undo_button_height);
  make_text(undo_button, '\u27F5').font({ size: 45 })
                                  .center(undo_button.cx(), undo_button.cy());
  undo_button.on('mousedown', () => {
    if (state_stack.length === 1) {
      return;
    }
    subs_cont.remove();
    state_stack.pop();
    level = state_stack.pop();
    document.dispatchEvent(new CustomEvent('rebuild-level'));
  });
  undo_button.center(window.innerWidth * 4 / 5, top_interface_margin);

  let unmark_button = app.group();
  const unmark_button_width = 60;
  const unmark_button_height = 60;
  make_interactive(unmark_button, unmark_button_width, unmark_button_height);
  make_text(unmark_button, '🧽').font({ size: 45 })
                                .center(unmark_button.cx(),
                                        unmark_button.cy());
  unmark_button.on('mousedown', () => {
    UnmarkExpr();
    lefts_list = [];
    rights_list = [];
    subs_cont.remove();
  });

  unmark_button.center(window.innerWidth * 4.5 / 5, top_interface_margin);

  document.addEventListener('keydown', spaceDown);
  document.addEventListener('keyup', spaceUp);

  let pretty_line = app.group();
  pretty_line.line(10,
                   top_interface_margin * 2,
                   window.innerWidth - 10,
                   top_interface_margin * 2)
             .stroke({ width: 3, color: Colors.dark_o });

//===============================top_interface_init============================

  let task_description = app.group();

  level = task.originalExpressionStructureString;

  document.addEventListener('rebuild-subs-menu', rebuildSubsMenu);
  document.addEventListener('rebuild-level', rebuildLevel);

  if (task.goalType === 'CUSTOM') {
    make_text(task_description, task.descriptionRu).font({
                                                           size: 20
                                                         });
    task_description.cx(app.cx()).y(pretty_line.y() + 25);
  } else if (task.goalType === 'EXPR') {
    task_description = PlainPrintTree(
      TWF_lib.structureStringToExpression(task.goalExpressionStructureString),
      60, app
    )
      .cx(app.cx()).y(pretty_line.y() + 25);
  }

  if (show_info) {
    let shade = app.group();
    shade.rect(app.width(), app.height()).fill({
                                                 color: '#000',
                                                 opacity: 0.5
                                               });

    let info = app.group();
    let info_title = info.group();
    make_text(info_title, game.levels[level_index].nameRu)
      .font({
              size: 30
            });

    let description = make_text(info, game.levels[level_index].descriptionRu)
      .font({
              leading: 1.5,
              size: 20
            });

    const info_width = description.bbox().width + 60;
    const info_height = window.innerHeight * 2 / 3;
    info
      .rect(info_width, info_height)
      .radius(10)
      .fill(Colors.background)
      .stroke({ color: Colors.rich, width: 5 })
      .after(description).after(info_title);

    info_title.cx(info.cx()).dy(20);
    description.cx(info.cx()).dy(150);

    let check_button = info.group();
    const check_button_width = 100;
    const check_button_height = 60;
    make_interactive(check_button, check_button_width, check_button_height);
    make_text(check_button, '✓').font({ size: 45 })
                                .center(check_button.cx(), check_button.cy());
    check_button.cx(info.cx()).dy(info_height * 3 / 4);

    info.cx(app.cx()).dy(30);

    shade.on('mousedown', () => remove_info())
    check_button.on('mousedown', () => remove_info())

    function remove_info(){
      shade.remove();
      info.remove();
      timer.remove();
      timer = initTimer(timer_box, 50).center(timer_box.cx(), timer_box.cy());
      timer_box.center(window.innerWidth / 2, top_interface_margin);
    }
  }

  function rebuildLevel() {
    expr.remove();
    multi_id_list = [];
    multi_cont_list = [];
    lefts_list = [];
    rights_list = [];
    state_stack.push(level);
    counter.text(`${state_stack.length - 1}`);
    expr = PutExpr(TWF_lib.structureStringToExpression(level), app);
    if (level === task.goalExpressionStructureString) {
      MakeWinMenu();
    }
  }

  function rebuildSubsMenu() {
    subs_cont.remove();
    subs_cont = MakeSubsMenu(subs_window, lefts_list, rights_list);
  }

  function spaceDown(event) {
    if (event.code === 'Space') {
      onMouseEnter(unmark_button);
      UnmarkExpr();
      lefts_list = [];
      rights_list = [];
      subs_cont.remove();
    }
  }

  function spaceUp(event) {
    if (event.code === 'Space') {
      onMouseLeave(unmark_button);
    }
  }

  function initTimer(cont, init_font_size) {
    const timer_colour = Colors.dark_t;
    let counter = 0;

    let timer = cont.text('00:00').font({
                                          size: init_font_size,
                                          family: Fonts.main,
                                          fill: timer_colour,
                                          leading: 0.9
                                        });

    timer.css('user-select', 'none');

    function updateTimer() {
      counter++;
      let time_passed = new Date(1000 * counter);

      timer.text(`${Math.floor(time_passed.getMinutes() / 10)}` +
                 `${time_passed.getMinutes() % 10}:` +
                 `${Math.floor(time_passed.getSeconds() / 10)}` +
                 `${time_passed.getSeconds() % 10}`);
    }

    intervalId = setInterval(updateTimer, 1000);

    return timer;
  }

  function PutExpr(tree_root, app) {
    const width_limit = window.innerWidth - 200;
    const height_limit = window.innerHeight / 3;

    let expr = PrintTree(tree_root, 100, app);
    let current_width_ratio = expr.bbox().width / width_limit;
    let current_height_ratio = expr.bbox().height / height_limit

    if (current_width_ratio > 1 || current_height_ratio > 1) {
      expr.remove()
      expr = PrintTree(tree_root, 100 / Math.max(current_width_ratio,
                                                 current_height_ratio), app);
    }

    expr.cx(app.cx());
    expr.cy(window.innerHeight / 2.4);
    return expr;
  }

  function MakeWinMenu() {
    let win_shade = app.group();
    win_shade.rect(app.width(), app.height()).fill({
                                                     color: Colors.rich,
                                                     opacity: 0.6
                                                   });

    clearInterval(intervalId);

    let win_box = app.group();
    win_box
      .rect(450, window.innerHeight / 3)
      .fill(Colors.background)
      .radius(10);

    let win_title = win_box.group();
    make_text(win_title, 'Level completed!').center(win_title.cx(),
                                                   win_title.cy());
    win_title.center(win_box.cx(), win_box.height() / 3);

    const bottom_offset = win_box.height() - 50;

    if (task_index !== game.levels.length) {
      let next_button = win_box.group();
      const next_button_width = 100;
      const next_botton_height = 80;
      make_interactive(next_button, next_button_width, next_botton_height);
      make_text(next_button, '➔')
        .font({ size: 70 })
        .center(next_button.cx(), next_button.cy());

      next_button
        .cx(win_box.cx())
        .cy(bottom_offset)
        .on('mousedown', () => {
          cleanLevelScene();
          MakeLearnLevelScene(game, level_index, task_index + 1, false);
        })
    }

    let reset_button = win_box.group();
    make_interactive(reset_button, 60, 60);
    make_text(reset_button, '\u27F2').center(reset_button.cx(),
                                            reset_button.cy());
    reset_button.cx(win_box.cx() + 100).cy(bottom_offset);
    reset_button.on('mousedown', () => {
      cleanLevelScene();
      MakeLearnLevelScene(game, level_index, task_index, false);
    })

    make_main_menu_button(win_box)
      .cx(win_box.cx() - 100)
      .cy(bottom_offset)
      .on('mousedown', () => {
        cleanLevelScene();
        MakeLearnLevelsMenu(game);
      })

    win_box.center(app.cx(), window.innerHeight / 2 - 60)
  }

  function cleanLevelScene() {
    document.removeEventListener('rebuild-subs-menu', rebuildSubsMenu);
    document.removeEventListener('rebuild-level', rebuildLevel);
    document.removeEventListener('keydown', spaceDown);
    document.removeEventListener('keyup', spaceUp);
    clearInterval(intervalId);
    app.remove();
    level = [];
    lefts_list = [];
    rights_list = [];
    multi_cont_list = [];
    multi_id_list = [];
  }
}

function MakeSubsMenu(window, list_of_lefts, list_of_rights) {
  if (list_of_lefts.length !== list_of_rights.length) {
    console.log('left-rights error!');
  }

  let subs_menu = window.group();
  let subs_menu_height = 4;
  for (let i = 0; i < list_of_lefts.length; ++i) {

    let inner_cont = subs_menu.group();
    const inner_cont_width = window.width() - 8;
    const inner_cont_default_height = 65;

    let left_sub = PlainPrintTree(
      TWF_lib.structureStringToExpression(list_of_lefts[i][0]), 50, inner_cont
    ).x(10);

    let horizontal_offset = inner_cont.width() + 10;

    let right_arrow_box = inner_cont.group();
    let right_arrow = make_text(right_arrow_box, '\u27F6')
      .x(horizontal_offset);

    horizontal_offset = inner_cont.width() + 10;

    let right_sub;
    try {
      right_sub = PlainPrintTree(
        TWF_lib.structureStringToExpression(list_of_lefts[i][1]), 50,
        inner_cont
      ).x(horizontal_offset);
    } catch (error) {
      left_sub.remove();
      right_arrow.remove();
      console.log("Error occurred!");
      continue;
    }

    horizontal_offset = inner_cont.width() + 40;

    if (horizontal_offset > inner_cont_width ||
        inner_cont.height() > inner_cont_default_height * 2) {
      let max_ratio = Math.max(inner_cont_width / horizontal_offset,
        inner_cont.height() / (inner_cont_default_height * 2));

      left_sub.remove();
      right_arrow.remove();
      right_sub.remove();

      left_sub = PlainPrintTree(
        TWF_lib.structureStringToExpression(list_of_lefts[i][0]),
        50 / max_ratio, inner_cont
      ).x(10);

      right_arrow = make_text(right_arrow_box, '\u27F6')
        .font({ size: 50 / max_ratio })
        .x(left_sub.bbox().width + 10);

      right_sub = PlainPrintTree(
        TWF_lib.structureStringToExpression(list_of_lefts[i][1]),
        50 / max_ratio, inner_cont
      ).x(left_sub.bbox().width + right_arrow.bbox().width + 10);
    }

    make_interactive(inner_cont, inner_cont_width, inner_cont.height())
      .stroke({ width: 4 })
      .back();

    inner_cont.on('mousedown', () => {
      level = list_of_rights[i].resultExpression.toString();
      document.dispatchEvent(new CustomEvent('rebuild-level'));
      subs_menu.remove();
    });

    left_sub.cy(inner_cont.cy());
    right_arrow.cy(inner_cont.cy());
    right_sub.cy(inner_cont.cy());

    inner_cont.dx(2).y(subs_menu_height);

    subs_menu_height += inner_cont.height() + 4;
  }

  subs_menu.dy(2);

  return subs_menu;
}

function UnmarkExpr() {
  for (let i = 0; i < multi_cont_list.length; ++i) {
    changeColor(multi_cont_list[i], multi_cont_list[i].classes()[0],
                'uncolored', default_text_color);
  }
  multi_id_list = [];
  multi_cont_list = [];
}

function make_text(cont, text) {
  let txt = cont.text(text).font({
                                   size: 50,
                                   family: Fonts.expr,
                                   fill: default_text_color
                                 });
  txt.css('user-select', 'none');
  txt.leading(0.9);
  return txt;
}

function make_main_menu_button(cont) {
  let main_menu_button = cont.group();
  const main_menu_button_width = 60;
  const main_menu_button_height = 60;

  make_interactive(main_menu_button, main_menu_button_width,
                   main_menu_button_height);
  make_text(main_menu_button, '🡸')
    .font({
            size: 40
          })
    .center(main_menu_button.cx(),
            main_menu_button.cy());

  return main_menu_button;
}

function make_interactive(cont, width, height) {
  let rect = cont.rect(width, height).radius(10)
    .fill(Colors.background)
    .stroke( {color: Colors.rich, opacity: 0, width: 5} );
  cont.css('cursor', 'pointer');
  cont.on('mousedown', () => onMouseDown(cont));
  cont.on('mouseup mouseenter', () => onMouseEnter(cont));
  cont.on('mouseleave', () => onMouseLeave(cont));
  return rect;
}

function onMouseDown(con) {
  if (con.type === 'text') return;
  con.animate(300, '<>').fill(Colors.background);
  for (let item of con.children()) {
    onMouseDown(item);
  }
}

function onMouseEnter(con) {
  if (con.type === 'text') return;
  con.animate(300, '<>').stroke( {opacity: 1} );
  for (let item of con.children()) {
    onMouseEnter(item);
  }
}

function onMouseLeave(con) {
  if (con.type === 'text') return;
  con.animate(300, '<>').stroke( {opacity: 0} );
  for (let item of con.children()) {
    onMouseLeave(item);
  }
}