/*

PrintTree(TWF_v, init_font_size, app);

TWF_v - корень дерева из библиотеки TWF, которое надо отобразить
init_font_size - желаемый размер шрифта
app - SVG контейнер, в который надо поместить отрисованное дерево

Возвращает SVG контейнер, содержащий отрисованное интерактивное дерево
P.S. не надо добавлять возвращенный контейнер в app: это делается
автоматически в PrintTree


PlainPrintTree(TWF_v, init_font_size, app);

Делает то же самое, но дерево будет лишено интерактивности


initTestingGround(test_expr, font_size);

test_expr - structure_string строка, описывающая дерево для отрисовки
font_size - желаемый размер шрифта

Создает небольшую сцену, на которую отрисовывает дерево из test_expr

*/

//const test_string = "^(A;^(/(/(/(C;D);D);D);B))";
//initTestingGround(test_string, 100);

const Colors = Object.freeze({
  'dark_t':'#3c413b',
  'dark_o':'#55635e',
  'rich':'#727e6c',
  'background':'#d4d6ca',
  'gradient_from':'#a93535',
  'gradient_to':'#26ab93'
});

const Fonts = Object.freeze({
  'main':'WebFont',
  'expr':'WebFont'
});

let level = '';
let multi_id_list = [];
let multi_cont_list = [];
let lefts_list = [];
let rights_list = [];

let compiledConfiguration = TWF_lib.createCompiledConfigurationFromExpressionSubstitutionsAndParams([
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "NumberPlusMinus1",                    void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "DecimalToFraction",                   void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "PowFactorization",                    void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MultiplicationFactorization",         void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "OpeningBrackets",                     void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ParentBracketsExpansion",             void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ArgumentsSwap",                       void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ArgumentsPermutationInOther",         void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ReduceArithmetic",                    void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "ReduceFraction",                      void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "AdditiveComplicatingExtension",       void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MultiplicativeComplicatingExtension", void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "MinusInOutBrackets",                  void 0, void 0),
  TWF_lib.expressionSubstitutionFromStructureStrings(void 0, void 0, void 0, void 0, void 0, void 0, void 0, "SimpleComputation",                   void 0, void 0)
]);

function initTestingGround(test_expr, font_size) {
  const background_colour = Colors.background;
  const background_width = 800;
  const background_height = 800;

  const app = new SVG()
    .addTo('body')
    .size(background_width, background_height);
  app.rect(background_width, background_height).fill(background_colour);

  let NewTreeRoot = TWF_lib.structureStringToExpression(test_expr);
  PrintTree(NewTreeRoot, font_size, app).move(0, 100);
}

function MakeNode(node, app) {
  this.value = node.value;
  this.children = [];
  this.add = function (child_node) {
    this.children.push(child_node);
  }
  this.cont = app.group();
  this.twfNode = node;
  this.cont.addClass("uncolored");
}

function MakeTree(node, app) {
  let cur_node = new MakeNode(node, app);
  for (let i = 0; i < node.children.size; i++) {
    cur_node.add(MakeTree(node.children.toArray()[i], app));
  }
  return cur_node;
}

const default_text_color = Colors.dark_t;

function getColor(n) {
  let color = new SVG.Color(Colors.gradient_to).to(Colors.gradient_from);
  return color.at(2 / (n + 2)).toHex();
}

function recolor(index) {
  for (let i = index; i < multi_id_list.length; ++i) {
    changeColor(multi_cont_list[i], multi_cont_list[i].classes()[0],
                `colored${multi_id_list[i]}`, getColor(i));
  }
}

function changeColor(con, fromClass, toClass, toColor) {
  if (!con.hasClass(fromClass)) {
    return;
  }

  con.animate(300, "<>").fill(toColor);
  con.removeClass(fromClass);
  con.addClass(toClass);
  for (let item of con.children()) {
    changeColor(item, fromClass, toClass, toColor);
  }
}

function PrintTree(TWF_v, init_font_size, app) {
  let TreeRoot = MakeTree(TWF_v.children.toArray()[0], app);

  let chr_sample = SVG().text("X").font({size: init_font_size});
  const init_chr_size = chr_sample.bbox().height;
  chr_sample.remove();

  let min = Math.min;

  const font_size = [
    init_font_size,
    init_font_size / Math.sqrt(2),
    init_font_size / 2
  ];

  const chr_size = [
    init_chr_size,
    init_chr_size / Math.sqrt(2),
    init_chr_size / 2
  ];

  const max_size = 2;
  const interletter_interval = init_chr_size / 36;

  //fraction line
  const line_height = [
    chr_size[0] / 22.16,
    chr_size[1] / 19.6,
    chr_size[2] / 18.47
  ];

  const line_elongation = init_chr_size / 3.7;

  const default_vert_shift_offset = [
    chr_size[0] / 2,
    chr_size[1] / 2,
    chr_size[2] / 2
  ];

  const pow_vert_offset = chr_size[2] / 5;
  const pow_hitbox_width = [chr_size[1] / 2.5, chr_size[2] / 2.5];
  const pow_hitbox_height = [chr_size[1] / 2, chr_size[2] / 2];
  const pow_hitbox_vert_offset = [chr_size[1] / 8, chr_size[2] / 8];

  const log_sub_vert_offset = [
    chr_size[0] / 2,
    chr_size[1] / 2,
    chr_size[2] / 1.3
  ];

  const combi_top_vert_offset = [
    chr_size[0] / 5,
    chr_size[1] / 5,
    chr_size[2] / 4
  ];

  function interactive_text(value, cont, size, nodeId = -1) {
    let txt = cont.text(value).font({
                                      size: font_size[min(size, max_size)],
                                      family: Fonts.expr,
                                      fill: default_text_color
                                    });
    txt.css("cursor", "pointer");
    txt.css("user-select", "none");
    txt.leading(0.9);
    txt.on("mousedown", () => onButtonDown(cont, nodeId));
    txt.on("mouseup mouseover", () => onButtonOver(cont, nodeId));
    txt.on("mouseout", () => onButtonOut(cont, nodeId));
    txt.addClass("uncolored");
    return txt;
  }

  function Division(a, b, cont, size, nodeId) {
    cont.add(a);
    cont.add(b);
    let width = Math.max(a.bbox().width, b.bbox().width) + line_elongation;
    let height = line_height[min(size - 1, max_size)];
    let line = cont
      .rect(width, height)
      .fill(default_text_color)
      .move(a.bbox().x, a.y() + a.bbox().height);

    line.addClass("uncolored");
    cont.add(line);

    let line_hitbox = cont
      .rect(width, height * 5)
      .move(line.x(), line.y() - height * 2);

    line_hitbox.css("cursor", "pointer");
    line_hitbox.on("mousedown", () => onButtonDown(cont, nodeId));
    line_hitbox.on("mouseup mouseover", () => onButtonOver(cont));
    line_hitbox.on("mouseout", () => onButtonOut(cont));
    line_hitbox.opacity(0);

    b.y(a.y() + a.bbox().height + line.height());
    a.dx((line.width() - a.bbox().width) / 2);
    b.dx((line.width() - b.bbox().width) / 2);
    return a.bbox().height - line.height() * 1.5; //recommended vertical shift
    //to keep the fraction centered
  }

  function calculate_vert_shift(shift, size) {
    return shift + default_vert_shift_offset[min(size, max_size)];
  }

  function draw(cont, child, del) {
    child.dx(del);
    cont.add(child);
    return child.bbox().width;
  }

  function v_draw(cont, child, del, vert, size) {
    child.y(calculate_vert_shift(vert, size));
    return draw(cont, child, del);
  }

  function draw_with_brackets(cont, child, delta, shift, size, nodeId) {
    let tmp = interactive_text("(", child, size, nodeId);
    delta += v_draw(cont, tmp, delta,
                    -default_vert_shift_offset[min(size, max_size)], size) +
                    interletter_interval;
    delta += v_draw(cont, child, delta, shift, size) + interletter_interval;
    tmp = interactive_text(")", child, size, nodeId);
    delta += v_draw(cont, tmp, delta,
                    -default_vert_shift_offset[min(size, max_size)], size) +
                    interletter_interval;
    return delta;
  }

  function recPrintTree(v, size) {
    let vert_shift = -default_vert_shift_offset[min(size, max_size)];
    let delta = 0;
    let cur_cont = v.cont;

    if (v.value === "/") {
      vert_shift = -Division(recPrintTree(v.children[0], size + 1)[0],
                             recPrintTree(v.children[1], size + 1)[0],
                             cur_cont, size + 1, v.twfNode.nodeId);

    } else if (v.value === "^") {
      let first_child, another_child, first_shift, another_shift;
      [first_child, first_shift] = recPrintTree(v.children[0], size);
      [another_child, another_shift] = recPrintTree(v.children[1], size + 1);
      if (v.children[0].children.length > 0) {
        delta = draw_with_brackets(cur_cont, first_child, delta, first_shift,
                                   size, v.children[0].twfNode.nodeId);
      } else {
        delta += v_draw(cur_cont, first_child, delta, first_shift, size) +
                 interletter_interval;
      }
      v_draw(cur_cont, another_child, delta, another_shift, size + 1);
      another_child.y(first_child.y() - first_shift -
                      another_child.bbox().height +
                      pow_vert_offset * (size >= 2));
      let pow_hitbox = cur_cont
        .rect(pow_hitbox_width[min(size, max_size - 1)],
              pow_hitbox_height[min(size, max_size - 1)])
        .move(another_child.bbox().x, another_child.bbox().y);
      pow_hitbox.dy(another_child.bbox().height - pow_hitbox.height() -
                    pow_hitbox_vert_offset[min(size, max_size - 1)]);
      pow_hitbox.dx(-pow_hitbox.width() / 1.8);
      pow_hitbox.css("cursor", "pointer");
      pow_hitbox.on("mousedown", () => onButtonDown(cur_cont,
                                                    v.twfNode.nodeId));
      pow_hitbox.on("mouseup mouseover", () => onButtonOver(cur_cont));
      pow_hitbox.on("mouseout", () => onButtonOut(cur_cont));
      pow_hitbox.opacity(0);
      vert_shift = cur_cont.bbox().y - first_child.bbox().y + first_shift;

    } else if (v.value === "log") {
      let first_child, another_child, first_shift, another_shift, tmp;
      tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
      delta += draw(cur_cont, tmp, delta) + interletter_interval;
      [first_child, first_shift] = recPrintTree(v.children[0], size + 1);
      [another_child, another_shift] = recPrintTree(v.children[1], size);
      vert_shift = min(another_shift, vert_shift);
      delta += v_draw(cur_cont, first_child, delta, first_shift, size) +
               interletter_interval;
      first_child.y(tmp.y() + tmp.bbox().height -
                    log_sub_vert_offset[min(size, max_size)]);
      if (v.children[1].children.length > 0) {
        draw_with_brackets(cur_cont, another_child, delta, another_shift,
                           size, v.children[1].twfNode.nodeId);
      } else {
        v_draw(cur_cont, another_child, delta, another_shift, size);
      }

    } else if ((v.value === "C" ||
                v.value === "A" ||
                v.value === "V" ||
                v.value === "U") && v.children.length === 2) {
      let first_child, another_child, first_shift, another_shift, tmp;
      tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
      delta += draw(cur_cont, tmp, delta) + interletter_interval;
      [first_child, first_shift] = recPrintTree(v.children[0], size + 1);
      [another_child, another_shift] = recPrintTree(v.children[1], size + 1);
      v_draw(cur_cont, first_child, delta, first_shift, size);
      first_child.y(tmp.y() + tmp.bbox().height -
                    default_vert_shift_offset[min(size, max_size)]);
      v_draw(cur_cont, another_child, delta, another_shift, size);
      another_child.y(tmp.y() - combi_top_vert_offset[min(size, max_size)]);
      if (another_child.y() + another_child.bbox().height > first_child.y()) {
        another_child.dy(-another_child.y() - another_child.bbox().height +
                         first_child.y());
      }
      vert_shift += cur_cont.bbox().y - tmp.bbox().y;

    } else if (v.value === "-") {
      let child, cur_shift, tmp;
      tmp = interactive_text("\u2212", cur_cont, size, v.twfNode.nodeId);
      delta += v_draw(cur_cont, tmp, delta,
                      -default_vert_shift_offset[min(size, max_size)], size) +
               interletter_interval;
      [child, cur_shift] = recPrintTree(v.children[0], size);
      vert_shift = min(cur_shift, vert_shift);
      if (v.children[0].value === "-" ||
          v.children[0].value === "*" ||
          v.children[0].value === "+") {
        draw_with_brackets(cur_cont, child, delta, cur_shift,
                           size, v.children[0].twfNode.nodeId);
      } else {
        v_draw(cur_cont, child, delta, cur_shift, size);
      }

    } else if (v.value === "+") {
      let first_child, another_child, cur_shift, tmp;
      [first_child, cur_shift] = recPrintTree(v.children[0], size);
      vert_shift = min(cur_shift, vert_shift);
      if (v.children[0].value === "+") {
        delta = draw_with_brackets(cur_cont, first_child, delta, cur_shift,
                                   size, v.children[0].twfNode.nodeId);
      } else {
        delta += v_draw(cur_cont, first_child, delta, cur_shift, size) +
                 interletter_interval;
      }
      for (let i = 1; i < v.children.length; i++) {
        if (v.children[i].value !== "-") {
          tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
          delta += v_draw(cur_cont, tmp, delta,
                          -default_vert_shift_offset[min(size, max_size)],
                          size) + interletter_interval;
        }
        [another_child, cur_shift] = recPrintTree(v.children[i], size);
        vert_shift = min(cur_shift, vert_shift);
        if (v.children[i].value === "+") {
          delta = draw_with_brackets(cur_cont, another_child, delta, cur_shift,
                                     size, v.children[i].twfNode.nodeId);
        } else {
           delta += v_draw(cur_cont, another_child, delta, cur_shift, size) +
                    interletter_interval;
        }
      }


    } else if (v.value === "*") {
      let first_child, another_child, cur_shift, tmp;
      [first_child, cur_shift] = recPrintTree(v.children[0], size);
      vert_shift = min(cur_shift, vert_shift);
      if (v.children[0].value === "*" || v.children[0].value === "+") {
        delta = draw_with_brackets(cur_cont, first_child, delta, cur_shift,
                                   size, v.children[0].twfNode.nodeId);
      } else {
        delta += v_draw(cur_cont, first_child, delta, cur_shift, size) +
                 interletter_interval;
      }
      for (let i = 1; i < v.children.length; i++) {
        tmp = interactive_text("\u2219", cur_cont, size, v.twfNode.nodeId);
        delta += v_draw(cur_cont, tmp, delta,
                        -default_vert_shift_offset[min(size, max_size)],
                        size) + interletter_interval;
        [another_child, cur_shift] = recPrintTree(v.children[i], size);
        vert_shift = min(cur_shift, vert_shift);
        if (v.children[i].value === "*" || v.children[i].value === "+") {
          delta = draw_with_brackets(cur_cont, another_child, delta,
                                     cur_shift, size,
                                     v.children[i].twfNode.nodeId);
        } else {
          delta += v_draw(cur_cont, another_child, delta, cur_shift, size) +
                   interletter_interval;
        }
      }

    } else if (v.value === '' ||
               v.value === 'sin' ||
               v.value === 'cos' ||
               v.value === 'tg' ||
               v.value === 'ctg') {
      let child, cur_shift, tmp;
      [child, cur_shift] = recPrintTree(v.children[0], size);
      vert_shift = min(cur_shift, vert_shift);
      tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId);
      delta += draw(cur_cont, tmp, delta) + interletter_interval;
      draw_with_brackets(cur_cont, child, delta, cur_shift,
                         size, v.children[0].twfNode.nodeId);

    } else {
      let variable = interactive_text(v.value, cur_cont, size,
                                      v.twfNode.nodeId);
      cur_cont.add(variable);
    }

    return [cur_cont, vert_shift];
  }

  function onButtonDown(con, nodeId) {
    let index = multi_id_list.indexOf(nodeId);
    if (index !== -1) {
      multi_cont_list.splice(index, 1);
      multi_id_list.splice(index, 1);
      if (con.parent().hasClass("uncolored") ||
        con.parent().classes().length === 0) {
        changeColor(con, con.classes()[0], "uncolored", default_text_color);
      } else {
        changeColor(con, con.classes()[0], con.parent().classes()[0],
                    getColor(multi_cont_list.indexOf(con.parent())));
      }
      recolor(index);
    } else {
      multi_id_list.unshift(nodeId);
      multi_cont_list.unshift(con);
      recolor(0);
    }

    rights_list = [];
    if (multi_id_list.length !== 0) {
      rights_list = (TWF_lib.findApplicableSubstitutionsInSelectedPlace(
        TWF_lib.structureStringToExpression(level),
        multi_id_list,
        compiledConfiguration)).toArray();
    }
    lefts_list = [];
    for (let i = 0; i < rights_list.length; i++) {
      if (rights_list[i].resultExpression.toString() === "To get application result use argument 'withReadyApplicationResult' = 'true'()") continue;
      lefts_list.push([rights_list[i].originalExpressionChangingPart.toString(),
                     rights_list[i].resultExpressionChangingPart.toString()])
    }
    document.dispatchEvent(new CustomEvent('rebuild-subs-menu'));
  }


  function onButtonOver(con) {
    con.animate(300, "<>").attr({ opacity: 0.5 });
  }

  function onButtonOut(con) {
    con.animate(300, "<>").attr({ opacity: 1 });
  }

  return recPrintTree(TreeRoot, 0)[0];
}

function PlainPrintTree(TWF_v, init_font_size, app) {
  let expr = PrintTree(TWF_v, init_font_size, app);
  expr.flatten(expr);
  for (let item of expr.children()) {
    item.off();
    item.css("cursor", "default");
  }
  return expr;
}
