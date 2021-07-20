import * as SVG from '@svgdotjs/svg.js';
import { ExprNode } from '../ExpressionClasses/ExprNode';
import { Expr } from '../ExpressionClasses/Expr'
// @ts-ignore
import { TWF_lib } from '../libs/TWF_lib';
import { Config } from '../Config/ConfigClass';

function PrintExpr(expr: Expr, init_font_size: number, config: Config) {
  let Fonts = config.font_set;
  let text_color = config.color_set.dark_t;

  let TreeRoot: ExprNode = expr.tree.root;

  let chr_sample = SVG.SVG().text("X").font({size: init_font_size});
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

  function interactive_text(value: string, cont: SVG.Container,
    size: number, nodeId: number = -1, config: Config) {
    let txt = cont.text(value).font({
      size: font_size[min(size, max_size)],
      family: Fonts.expr,
      fill: config.color_set.dark_t
    });
    txt.css("cursor", "pointer");
    // @ts-ignore
    txt.css("user-select", "none");
    txt.leading(0.9);
    txt.on("mousedown", () => onButtonDown(cont, nodeId));
    txt.on("mouseup mouseover", () => onButtonOver(cont));
    txt.on("mouseout", () => onButtonOut(cont));
    txt.addClass("uncolored");
    return txt;
  }

  function Division(a: SVG.Container, b: SVG.Container, cont: SVG.Container,
    size: number, nodeId: number) {
    cont.add(a);
    cont.add(b);
    let width = Math.max(a.bbox().width, b.bbox().width) + line_elongation;
    let height = line_height[min(size - 1, max_size)];
    let line = cont
      .rect(width, height)
      .fill(text_color)
      .move(a.bbox().x, Number(a.y()) + a.bbox().height);

    line.addClass("uncolored");
    cont.add(line);

    let line_hitbox = cont
      .rect(width, height * 5)
      .move(line.x(), Number(line.y()) - height * 2);

    line_hitbox.css("cursor", "pointer");
    line_hitbox.on("mousedown", () => onButtonDown(cont, nodeId));
    line_hitbox.on("mouseup mouseover", () => onButtonOver(cont));
    line_hitbox.on("mouseout", () => onButtonOut(cont));
    line_hitbox.opacity(0);

    b.y(Number(a.y()) + a.bbox().height + Number(line.height()));
    a.dx((Number(line.width()) - a.bbox().width) / 2);
    b.dx((Number(line.width()) - b.bbox().width) / 2);
    return a.bbox().height - Number(line.height()) * 1.5; //recommended vertical shift
    //to keep the fraction centered
  }

  function calculate_vert_shift(shift: number, size: number) {
    return shift + default_vert_shift_offset[min(size, max_size)];
  }

  function draw(cont: SVG.Container, child: SVG.Element, del: number) {
    child.dx(del);
    cont.add(child);
    return child.bbox().width;
  }

  function v_draw(cont: SVG.Container, child: SVG.Element, del: number,
    vert: number, size: number) {
    child.y(calculate_vert_shift(vert, size));
    return draw(cont, child, del);
  }

  function draw_with_brackets(cont: SVG.Container, child: SVG.Container,
    delta: number, shift: number, size: number,
    nodeId: number) {
    let tmp = interactive_text("(", child, size, nodeId, config);
    delta += v_draw(cont, tmp, delta,
      -default_vert_shift_offset[min(size, max_size)], size) +
      interletter_interval;
    delta += v_draw(cont, child, delta, shift, size) + interletter_interval;
    tmp = interactive_text(")", child, size, nodeId, config);
    delta += v_draw(cont, tmp, delta,
      -default_vert_shift_offset[min(size, max_size)], size) +
      interletter_interval;
    return delta;
  }

  function recPrintTree(v: any, size: number) {
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
        pow_vert_offset * Number(size >= 2));
      let pow_hitbox: SVG.Rect = cur_cont
        .rect(pow_hitbox_width[min(size, max_size - 1)],
          pow_hitbox_height[min(size, max_size - 1)])
        .move(another_child.bbox().x, another_child.bbox().y);
      pow_hitbox.dy(another_child.bbox().height - Number(pow_hitbox.height()) -
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
      tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId, config);
      delta += draw(cur_cont, tmp, delta) + interletter_interval;
      [first_child, first_shift] = recPrintTree(v.children[0], size + 1);
      [another_child, another_shift] = recPrintTree(v.children[1], size);
      vert_shift = min(another_shift, vert_shift);
      delta += v_draw(cur_cont, first_child, delta, first_shift, size) +
        interletter_interval;
      first_child.y(Number(tmp.y()) + tmp.bbox().height -
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
      tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId, config);
      delta += draw(cur_cont, tmp, delta) + interletter_interval;
      [first_child, first_shift] = recPrintTree(v.children[0], size + 1);
      [another_child, another_shift] = recPrintTree(v.children[1], size + 1);
      v_draw(cur_cont, first_child, delta, first_shift, size);
      first_child.y(Number(tmp.y()) + tmp.bbox().height -
        default_vert_shift_offset[min(size, max_size)]);
      v_draw(cur_cont, another_child, delta, another_shift, size);
      another_child.y(Number(tmp.y()) - combi_top_vert_offset[min(size, max_size)]);
      if (another_child.y() + another_child.bbox().height > first_child.y()) {
        another_child.dy(-another_child.y() - another_child.bbox().height +
          first_child.y());
      }
      vert_shift += cur_cont.bbox().y - tmp.bbox().y;

    } else if (v.value === "-") {
      let child, cur_shift, tmp;
      tmp = interactive_text("\u2212", cur_cont, size, v.twfNode.nodeId, config);
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
          tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId, config);
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
        tmp = interactive_text("\u2219", cur_cont, size, v.twfNode.nodeId, config);
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
      tmp = interactive_text(v.value, cur_cont, size, v.twfNode.nodeId, config);
      delta += draw(cur_cont, tmp, delta) + interletter_interval;
      draw_with_brackets(cur_cont, child, delta, cur_shift,
        size, v.children[0].twfNode.nodeId);

    } else {
      let variable = interactive_text(v.value, cur_cont, size,
        v.twfNode.nodeId, config);
      cur_cont.add(variable);
    }

    return [cur_cont, vert_shift];
  }

  function onButtonDown(con: SVG.Element, nodeId: number) {
    let index = expr.multi_id_list.indexOf(nodeId);
    if (index !== -1) {
      expr.multi_cont_list.splice(index, 1);
      expr.multi_id_list.splice(index, 1);
      // @ts-ignore
      if (con.parent().hasClass("uncolored") ||
        // @ts-ignore
        con.parent().classes().length === 0) {
        changeColor(con, con.classes()[0], "uncolored", text_color);
      } else {
        // @ts-ignore
        changeColor(con, con.classes()[0], con.parent().classes()[0],
        // @ts-ignore
          getColor(expr.multi_cont_list.indexOf(con.parent()), config));
      }
      for (let i = index; i < expr.multi_id_list.length; ++i) {
        changeColor(expr.multi_cont_list[i], expr.multi_cont_list[i].classes()[0],
          `colored${expr.multi_id_list[i]}`, getColor(i, config));
      }
    } else {
      expr.multi_id_list.unshift(nodeId);
      expr.multi_cont_list.unshift(con);
      for (let i = 0; i < expr.multi_id_list.length; ++i) {
        changeColor(expr.multi_cont_list[i], expr.multi_cont_list[i].classes()[0],
          `colored${expr.multi_id_list[i]}`, getColor(i, config));
      }
    }
  }


  function onButtonOver(con: SVG.Element) {
    // @ts-ignore
    con.animate(300, "<>").attr({ opacity: 0.5 });
  }

  function onButtonOut(con: SVG.Element) {
    // @ts-ignore
    con.animate(300, "<>").attr({ opacity: 1 });
  }

  return recPrintTree(TreeRoot, 0)[0];
}

function PlainPrintExpr(expr: Expr, init_font_size: number, config: Config) {
  let expr_svg: SVG.Container = PrintExpr(expr, init_font_size, config);
  expr_svg.flatten(expr_svg);
  for (let item of expr_svg.children()) {
    item.off();
    item.css("cursor", "default");
  }
  return expr_svg;
}

function getColor(n: number, config: Config): string {
  let color = new SVG.Color(config.color_set.gradient_to).to(config.color_set.gradient_from);
  return color.at(2 / (n + 2)).toHex();
}

function changeColor(con: SVG.Element, fromClass: string, toClass: string,
  toColor: string) {
  if (!con.hasClass(fromClass)) {
    return;
  }

  // @ts-ignore
  con.animate(300, '<>').attr({ fill: toColor });
  con.removeClass(fromClass);
  con.addClass(toClass);
  for (let item of con.children()) {
    changeColor(item, fromClass, toClass, toColor);
  }
}

export { PrintExpr, PlainPrintExpr, changeColor }