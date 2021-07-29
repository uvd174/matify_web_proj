import * as SVG from '@svgdotjs/svg.js';
import { Expr } from '../ExpressionClasses/Expr'
// @ts-ignore
import { TWF_lib } from '../libs/TWF_lib';
import { Config } from '../Config/ConfigClass';

function printExpr(expr: Expr) {
  let fonts = expr.config.userConfig.fontSet;
  let initFontSize = expr.fontSize;

  let chrSample = SVG.SVG().text("X").font({size: initFontSize});
  const initChrSize = chrSample.bbox().height;
  chrSample.remove();

  let min = Math.min;

  const fontSize = [
    initFontSize,
    initFontSize / Math.sqrt(2),
    initFontSize / 2
  ];

  const chrSize = [
    initChrSize,
    initChrSize / Math.sqrt(2),
    initChrSize / 2
  ];

  const maxSize = 2;
  const interletterInterval = initChrSize / 36;

  //fraction line
  const lineHeight = [
    chrSize[0] / 22.16,
    chrSize[1] / 19.6,
    chrSize[2] / 18.47
  ];

  const lineElongation = initChrSize / 3.7;

  const defaultVertShiftOffset = [
    chrSize[0] / 2,
    chrSize[1] / 2,
    chrSize[2] / 2
  ];

  const powVertOffset = chrSize[2] / 5;
  const powHitboxWidth = [chrSize[1] / 2.5, chrSize[2] / 2.5];
  const powHitboxHeight = [chrSize[1] / 2, chrSize[2] / 2];
  const powHitboxVertOffset = [chrSize[1] / 8, chrSize[2] / 8];

  const logSubVertOffset = [
    chrSize[0] / 2,
    chrSize[1] / 2,
    chrSize[2] / 1.3
  ];

  const combiTopVertOffset = [
    chrSize[0] / 5,
    chrSize[1] / 5,
    chrSize[2] / 4
  ];

  function interactiveText(value: string, cont: SVG.Container,
    size: number, nodeId: number = -1, config: Config) {
    let txt = cont.text(value).font({
      size: fontSize[min(size, maxSize)],
      family: fonts.expr,
      fill: config.userConfig.colorSet.darkMain
    });
    txt.css("cursor", "pointer");
    // @ts-ignore
    txt.css("user-select", "none");
    txt.leading(0.9);
    txt.on("mousedown", () => onButtonDown(cont, nodeId, expr));
    txt.on("mouseup mouseover", () => onButtonOver(cont));
    txt.on("mouseout", () => onButtonOut(cont));
    txt.addClass("uncolored");
    return txt;
  }

  function division(topCont: SVG.Container, bottomCont: SVG.Container, cont: SVG.Container,
    size: number, nodeId: number) {
    let topContWidth = topCont.bbox().width;
    let bottomContWidth = bottomCont.bbox().width;
    let topContHeight = topCont.bbox().height;
    let topContX = topCont.x();
    let topContY = Number(topCont.y());
    let lineX = topContX;
    let lineY = topContY + topContHeight;
    let width = Math.max(topContWidth, bottomContWidth) + lineElongation;
    let height = lineHeight[min(size - 1, maxSize)];
    cont.add(topCont);
    cont.add(bottomCont);
    let line = cont
      .rect(width, height)
      .fill(expr.config.userConfig.colorSet.darkMain)
      .move(lineX, lineY);

    line.addClass("uncolored");
    cont.add(line);

    let lineHitbox = cont
      .rect(width, height * 5)
      .move(lineX, lineY - height * 2);

    lineHitbox.css("cursor", "pointer");
    lineHitbox.on("mousedown", () => onButtonDown(cont, nodeId, expr));
    lineHitbox.on("mouseup mouseover", () => onButtonOver(cont));
    lineHitbox.on("mouseout", () => onButtonOut(cont));
    lineHitbox.opacity(0);

    bottomCont.y(topContY + topContHeight + height);
    topCont.dx((width - topContWidth) / 2);
    bottomCont.dx((width - bottomContWidth) / 2);
    return topContHeight - height * 1.5; //recommended vertical shift
    //to keep the fraction centered
  }

  function calculateVertShift(shift: number, size: number) {
    return shift + defaultVertShiftOffset[min(size, maxSize)];
  }

  function draw(cont: SVG.Container, child: SVG.Element, del: number) {
    child.dx(del);
    cont.add(child);
    return child.bbox().width;
  }

  function drawWithVerticalShift(cont: SVG.Container, child: SVG.Element, del: number,
    vert: number, size: number) {
    child.y(calculateVertShift(vert, size));
    return draw(cont, child, del);
  }

  function drawWithBrackets(cont: SVG.Container, child: SVG.Container,
    delta: number, shift: number, size: number,
    nodeId: number) {
    let tmp = interactiveText("(", child, size, nodeId, expr.config);
    delta += drawWithVerticalShift(cont, tmp, delta,
      -defaultVertShiftOffset[min(size, maxSize)], size) +
      interletterInterval;
    delta += drawWithVerticalShift(cont, child, delta, shift, size) + interletterInterval;
    tmp = interactiveText(")", child, size, nodeId, expr.config);
    delta += drawWithVerticalShift(cont, tmp, delta,
      -defaultVertShiftOffset[min(size, maxSize)], size) +
      interletterInterval;
    return delta;
  }

  function recPrintTree(v: any, size: number) {
    let vertShift = -defaultVertShiftOffset[min(size, maxSize)];
    let delta = 0;
    let curCont = v.cont;

    if (v.value === "/") {
      vertShift = -division(recPrintTree(v.children[0], size + 1)[0],
        recPrintTree(v.children[1], size + 1)[0],
        curCont, size + 1, v.twfNode.nodeId);

    } else if (v.value === "^") {
      let firstChild, anotherChild, firstShift, anotherShift;
      [firstChild, firstShift] = recPrintTree(v.children[0], size);
      [anotherChild, anotherShift] = recPrintTree(v.children[1], size + 1);
      if (v.children[0].children.length > 0) {
        delta = drawWithBrackets(curCont, firstChild, delta, firstShift,
          size, v.children[0].twfNode.nodeId);
      } else {
        delta += drawWithVerticalShift(curCont, firstChild, delta, firstShift, size) +
          interletterInterval;
      }
      drawWithVerticalShift(curCont, anotherChild, delta, anotherShift, size + 1);
      anotherChild.y(firstChild.y() - firstShift -
        anotherChild.bbox().height +
        powVertOffset * Number(size >= 2));
      let powHitbox: SVG.Rect = curCont
        .rect(powHitboxWidth[min(size, maxSize - 1)],
          powHitboxHeight[min(size, maxSize - 1)])
        .move(anotherChild.bbox().x, anotherChild.bbox().y);
      powHitbox.dy(anotherChild.bbox().height - Number(powHitbox.height()) -
        powHitboxVertOffset[min(size, maxSize - 1)]);
      powHitbox.dx(-powHitbox.width() / 1.8);
      powHitbox.css("cursor", "pointer");
      powHitbox.on("mousedown", () => onButtonDown(curCont,
        v.twfNode.nodeId, expr));
      powHitbox.on("mouseup mouseover", () => onButtonOver(curCont));
      powHitbox.on("mouseout", () => onButtonOut(curCont));
      powHitbox.opacity(0);
      vertShift = curCont.bbox().y - firstChild.bbox().y + firstShift;

    } else if (v.value === "log") {
      let firstChild, anotherChild, firstShift, anotherShift, tmp;
      tmp = interactiveText(v.value, curCont, size, v.twfNode.nodeId, expr.config);
      delta += draw(curCont, tmp, delta) + interletterInterval;
      [firstChild, firstShift] = recPrintTree(v.children[0], size + 1);
      [anotherChild, anotherShift] = recPrintTree(v.children[1], size);
      vertShift = min(anotherShift, vertShift);
      delta += drawWithVerticalShift(curCont, firstChild, delta, firstShift, size) +
        interletterInterval;
      firstChild.y(Number(tmp.y()) + tmp.bbox().height -
        logSubVertOffset[min(size, maxSize)]);
      if (v.children[1].children.length > 0) {
        drawWithBrackets(curCont, anotherChild, delta, anotherShift,
          size, v.children[1].twfNode.nodeId);
      } else {
        drawWithVerticalShift(curCont, anotherChild, delta, anotherShift, size);
      }

    } else if ((v.value === "C" ||
      v.value === "A" ||
      v.value === "V" ||
      v.value === "U") && v.children.length === 2) {
      let firstChild, anotherChild, firstShift, anotherShift, tmp;
      tmp = interactiveText(v.value, curCont, size, v.twfNode.nodeId, expr.config);
      delta += draw(curCont, tmp, delta) + interletterInterval;
      [firstChild, firstShift] = recPrintTree(v.children[0], size + 1);
      [anotherChild, anotherShift] = recPrintTree(v.children[1], size + 1);
      drawWithVerticalShift(curCont, firstChild, delta, firstShift, size);
      firstChild.y(Number(tmp.y()) + tmp.bbox().height -
        defaultVertShiftOffset[min(size, maxSize)]);
      drawWithVerticalShift(curCont, anotherChild, delta, anotherShift, size);
      anotherChild.y(Number(tmp.y()) - combiTopVertOffset[min(size, maxSize)]);
      if (anotherChild.y() + anotherChild.bbox().height > firstChild.y()) {
        anotherChild.dy(-anotherChild.y() - anotherChild.bbox().height +
          firstChild.y());
      }
      vertShift += curCont.bbox().y - tmp.bbox().y;

    } else if (v.value === "-") {
      let child, curShift, tmp;
      tmp = interactiveText("\u2212", curCont, size, v.twfNode.nodeId, expr.config);
      delta += drawWithVerticalShift(curCont, tmp, delta,
        -defaultVertShiftOffset[min(size, maxSize)], size) +
        interletterInterval;
      [child, curShift] = recPrintTree(v.children[0], size);
      vertShift = min(curShift, vertShift);
      if (v.children[0].value === "-" ||
        v.children[0].value === "*" ||
        v.children[0].value === "+") {
        drawWithBrackets(curCont, child, delta, curShift,
          size, v.children[0].twfNode.nodeId);
      } else {
        drawWithVerticalShift(curCont, child, delta, curShift, size);
      }

    } else if (v.value === "+") {
      let firstChild, anotherChild, curShift, tmp;
      [firstChild, curShift] = recPrintTree(v.children[0], size);
      vertShift = min(curShift, vertShift);
      if (v.children[0].value === "+") {
        delta = drawWithBrackets(curCont, firstChild, delta, curShift,
          size, v.children[0].twfNode.nodeId);
      } else {
        delta += drawWithVerticalShift(curCont, firstChild, delta, curShift, size) +
          interletterInterval;
      }
      for (let i = 1; i < v.children.length; i++) {
        if (v.children[i].value !== "-") {
          tmp = interactiveText(v.value, curCont, size, v.twfNode.nodeId, expr.config);
          delta += drawWithVerticalShift(curCont, tmp, delta,
            -defaultVertShiftOffset[min(size, maxSize)],
            size) + interletterInterval;
        }
        [anotherChild, curShift] = recPrintTree(v.children[i], size);
        vertShift = min(curShift, vertShift);
        if (v.children[i].value === "+") {
          delta = drawWithBrackets(curCont, anotherChild, delta, curShift,
            size, v.children[i].twfNode.nodeId);
        } else {
          delta += drawWithVerticalShift(curCont, anotherChild, delta, curShift, size) +
            interletterInterval;
        }
      }


    } else if (v.value === "*") {
      let firstChild, anotherChild, curShift, tmp;
      [firstChild, curShift] = recPrintTree(v.children[0], size);
      vertShift = min(curShift, vertShift);
      if (v.children[0].value === "*" || v.children[0].value === "+") {
        delta = drawWithBrackets(curCont, firstChild, delta, curShift,
          size, v.children[0].twfNode.nodeId);
      } else {
        delta += drawWithVerticalShift(curCont, firstChild, delta, curShift, size) +
          interletterInterval;
      }
      for (let i = 1; i < v.children.length; i++) {
        tmp = interactiveText("\u2219", curCont, size, v.twfNode.nodeId, expr.config);
        delta += drawWithVerticalShift(curCont, tmp, delta,
          -defaultVertShiftOffset[min(size, maxSize)],
          size) + interletterInterval;
        [anotherChild, curShift] = recPrintTree(v.children[i], size);
        vertShift = min(curShift, vertShift);
        if (v.children[i].value === "*" || v.children[i].value === "+") {
          delta = drawWithBrackets(curCont, anotherChild, delta,
            curShift, size,
            v.children[i].twfNode.nodeId);
        } else {
          delta += drawWithVerticalShift(curCont, anotherChild, delta, curShift, size) +
            interletterInterval;
        }
      }

    } else if (v.value === '' ||
      v.value === 'sin' ||
      v.value === 'cos' ||
      v.value === 'tg' ||
      v.value === 'ctg') {
      let child, curShift, tmp;
      [child, curShift] = recPrintTree(v.children[0], size);
      vertShift = min(curShift, vertShift);
      tmp = interactiveText(v.value, curCont, size, v.twfNode.nodeId, expr.config);
      delta += draw(curCont, tmp, delta) + interletterInterval;
      drawWithBrackets(curCont, child, delta, curShift,
        size, v.children[0].twfNode.nodeId);

    } else {
      let variable = interactiveText(v.value, curCont, size,
        v.twfNode.nodeId, expr.config);
      curCont.add(variable);
    }

    return [curCont, vertShift];
  }

  function onButtonDown(con: SVG.Element, nodeId: number, expr: Expr) {
    let index = expr.multiIdList.indexOf(nodeId);
    if (index !== -1) {
      expr.multiContList.splice(index, 1);
      expr.multiIdList.splice(index, 1);
      // @ts-ignore
      if (con.parent().hasClass("uncolored") ||
        // @ts-ignore
        con.parent().classes().length === 0) {
        changeColor(con, con.classes()[0], "uncolored", expr.config.userConfig.colorSet.darkMain);
      } else {
        // @ts-ignore
        changeColor(con, con.classes()[0], con.parent().classes()[0],
        // @ts-ignore
          getColor(expr.multiContList.indexOf(con.parent()), expr.config));
      }
      for (let i = index; i < expr.multiIdList.length; ++i) {
        changeColor(expr.multiContList[i], expr.multiContList[i].classes()[0],
          `colored${expr.multiIdList[i]}`, getColor(i, expr.config));
      }
    } else {
      expr.multiIdList.unshift(nodeId);
      expr.multiContList.unshift(con);
      for (let i = 0; i < expr.multiIdList.length; ++i) {
        changeColor(expr.multiContList[i], expr.multiContList[i].classes()[0],
          `colored${expr.multiIdList[i]}`, getColor(i, expr.config));
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

  return recPrintTree(expr.tree.root, 0)[0];
}

function plainPrintExpr(expr: Expr) {
  let exprSvg: SVG.Container = printExpr(expr);
  exprSvg.flatten(exprSvg);
  for (let item of exprSvg.children()) {
    item.off();
    item.css("cursor", "default");
  }
  return exprSvg;
}

function getColor(n: number, config: Config): string {
  let color = new SVG.Color(config.userConfig.colorSet.gradientTo).to(config.userConfig.colorSet.gradientFrom);
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

export { printExpr, plainPrintExpr, changeColor };