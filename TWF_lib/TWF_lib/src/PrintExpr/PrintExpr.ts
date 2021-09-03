import * as SVG from '@svgdotjs/svg.js';
import { Expr } from '../ExpressionClasses/Expr'
// @ts-ignore
import { TWF_lib } from '../libs/TWF_lib';
import { Config } from '../Config/ConfigClass';
import { ExprNode } from '../ExpressionClasses/ExprNode';

function printTree(expr: Expr/*, widthLimit: number, heightLimit: number*/) {
  let initFontSize = expr.fontSize;
  let fontFamily = expr.config.userConfig.fontSet.expr

  const fontSize = [
    initFontSize,
    initFontSize / Math.sqrt(2),
    initFontSize / 2
  ];

  let chrSampleSize0 = SVG.SVG().text('X').font({
    size: fontSize[0],
    family: fontFamily
  });
  let chrSampleSize1 = SVG.SVG().text('X').font({
    size: fontSize[1],
    family: fontFamily
  });
  let chrSampleSize2 = SVG.SVG().text('X').font({
    size: fontSize[2],
    family: fontFamily
  });

  const chrHeight = [
    chrSampleSize0.bbox().height,
    chrSampleSize1.bbox().height,
    chrSampleSize2.bbox().height
  ];

  const chrWidth = [
    chrSampleSize0.bbox().width,
    chrSampleSize1.bbox().width,
    chrSampleSize2.bbox().width
  ];

  chrSampleSize0.remove();
  chrSampleSize1.remove();
  chrSampleSize2.remove();

  let bracketSampleSize0 = SVG.SVG().text('⎛').font({
    size: fontSize[0],
    family: expr.config.userConfig.fontSet.unicode
  });
  let bracketSampleSize1 = SVG.SVG().text('⎛').font({
    size: fontSize[1],
    family: expr.config.userConfig.fontSet.unicode
  });
  let bracketSampleSize2 = SVG.SVG().text('⎛').font({
    size: fontSize[2],
    family: expr.config.userConfig.fontSet.unicode
  });

  const bracketHeight = [
    bracketSampleSize0.bbox().height,
    bracketSampleSize1.bbox().height,
    bracketSampleSize2.bbox().height
  ];

  const bracketWidth = [
    bracketSampleSize0.bbox().width,
    bracketSampleSize1.bbox().width,
    bracketSampleSize2.bbox().width
  ];

  const leftBracketMiddleOffset = [
    bracketWidth[0] / 8.3,
    bracketWidth[1] / 8.3,
    bracketWidth[2] / 8.3
  ]

  const rightBracketMiddleOffset = [
    bracketWidth[0] / 8.8,
    bracketWidth[1] / 8.3,
    bracketWidth[2] / 9
  ]

  const bracketMiddleWidth = [
    bracketWidth[0] / 4.8,
    bracketWidth[1] / 4.8,
    bracketWidth[2] / 4.9
  ]

  const bracketMiddleHeightFix = [
    0.5,
    0.5,
    0.5
  ]

  const littleBracketXFactor = 0.8

  bracketSampleSize0.remove();
  bracketSampleSize1.remove();
  bracketSampleSize2.remove();

  const lineElongation = chrHeight[0] / 3.7;

  const fractionLineHeight = [
    chrHeight[0] / 22.16,
    chrHeight[1] / 19.6,
    chrHeight[2] / 18.47
  ];

  const powVerticalOffset = [
    chrHeight[0] / 2,
    chrHeight[1] / 2,
    chrHeight[2] / 2
  ]

  const powHitAreaWidth = [
    chrHeight[1] / 3,
    chrHeight[2] / 3,
    chrHeight[2] / 3
  ];

  const powHitAreaHeight = [
    chrHeight[1] / 2,
    chrHeight[2] / 2,
    chrHeight[2] / 2.5
  ];

  const powHitAreaVerticalOffset = [
    chrHeight[1] / 4,
    chrHeight[2] / 4,
    chrHeight[2] / 8
  ];

  const logBaseVerticalOffset = [
    chrHeight[0] / 2,
    chrHeight[1] / 2,
    chrHeight[2] / 2.5
  ]

  let root = expr.tree.root;

  calculateProperties(root);
  calculateCoordinates(root);

  let leftTopAnchor = expr.svg.rect(3, 3);

  //requestAnimationFrame(() => recPrintTree(root, expr)); TODO: maybe this can be used to improve performance
  recPrintTree(root, expr);

  //leftTopAnchor.remove(); // TODO: turn it on for prod

  function interactiveText(value: string, node: ExprNode, expr: Expr) {
    let txt = expr.svg.text(value).font({
      size: fontSize[node.size],
      family: expr.config.userConfig.fontSet.expr,
      fill: expr.config.userConfig.colorSet.darkMain
    });
    txt.css({cursor: 'pointer'});
    // @ts-ignore
    //txt.css('user-select', 'none'); TODO: turn it on for prod
    txt.on('mousedown', () => onButtonDown(node, expr));
    txt.on('mouseup mouseover', () => onButtonOver(node));
    txt.on('mouseout', () => onButtonOut(node));
    return txt;
  }

  function calculateBracketWidth(node: ExprNode) {
    if (node.height > 2 * bracketHeight[node.size]) {
      return bracketWidth[node.size];
    } else {
      return chrWidth[node.size] * littleBracketXFactor;
    }
  }
  
  // bracket to-print-or-not-to-print logic
  function areBracketsNeeded(node: ExprNode) {
    if (
      node.parent?.value == 'sin' ||
      node.parent?.value == 'cos' ||
      node.parent?.value == 'tg' ||
      node.parent?.value == 'ctg' ||
      node.parent?.value == 'asin' ||
      node.parent?.value == 'acos' ||
      node.parent?.value == 'atg' ||
      node.parent?.value == 'actg'
    ) {
      return true;
    }

    if (
      node.parent?.value == 'log' &&
      node.parent?.children.indexOf(node) == 1 &&
      node.children.length > 0
    ) {
      return true;
    } else if (
      node.parent?.value == '^' &&
      node.parent?.children.indexOf(node) == 0 &&
      node.children.length > 0
    ) {
      return true;
    } else if (
      node.parent?.value == 'factorial' &&
      node.children.length > 0
    ) {
      return true;
    }

    if (node.value == '+') {
      return (
        node.parent?.value == '+' ||
        node.parent?.value == '-' ||
        //node.parent?.value == '*' && (node.children.length > 1 || node.parent.children.indexOf(node) != 0)
        node.parent?.value == '*' && (
          node.children.length > 1 ||
          node.children[0].value == '-' &&
          (
            node.parent.children.indexOf(node) != 0 ||
            node.parent.parent?.value == '-'
          )
        )
      );

    } else if (node.value == '*') {
      return node.parent?.value == '*' ||
        node.parent?.value == '^' &&
        node.children.length > 1;

    } else if (node.value == '/') {
      return node.parent?.value == '^';

    } else if (node.value == '') {
      return true;

    } else if (node.value == 'log') {
      return node.parent?.value == '^';

    }
  }

  // bracket printing logic
  function makeBrackets(node: ExprNode, expr: Expr) {
    let bigBracketFontFamily = expr.config.userConfig.fontSet.unicode;

    // left bracket
    if (node.height > 2 * bracketHeight[node.size]) {
      let bracketTop = interactiveText('⎛', node, expr);
      bracketTop.font({family: bigBracketFontFamily})
        .x(node.x)
        .y(node.y);
      node.elements.push(bracketTop);

      let bracketBottom = interactiveText('⎝', node, expr);
      bracketBottom.font({family: bigBracketFontFamily})
        .x(node.x)
        .y(node.y + node.height - bracketHeight[node.size]);
      node.elements.push(bracketBottom);

      let bracketMiddle = expr.svg.rect(
        bracketMiddleWidth[node.size],
        node.height - 2 * bracketHeight[node.size] + bracketMiddleHeightFix[node.size]
      ).fill(expr.config.userConfig.colorSet.darkMain);

      bracketMiddle
        .x(node.x + leftBracketMiddleOffset[node.size])
        .y(node.y + bracketHeight[node.size] - bracketMiddleHeightFix[node.size] / 2);
      node.elements.push(bracketMiddle);

      let bracketMiddleHitArea = expr.svg.rect(
        bracketWidth[node.size],
        node.height - 2 * bracketHeight[node.size] + bracketMiddleHeightFix[node.size]
      ).fill(expr.config.userConfig.colorSet.darkMain).opacity(0);

      bracketMiddleHitArea
        .x(node.x)
        .y(node.y + bracketHeight[node.size] - bracketMiddleHeightFix[node.size] / 2);

      bracketMiddleHitArea.css({cursor: 'pointer'});

      bracketMiddleHitArea.on('mousedown', () => onButtonDown(node, expr));
      bracketMiddleHitArea.on('mouseup mouseover', () => onButtonOver(node));
      bracketMiddleHitArea.on('mouseout', () => onButtonOut(node));

    } else {
      let leftBracket = interactiveText('(', node, expr);

      let x = node.x;
      let y = node.y;

      leftBracket.x(x).y(y);
      leftBracket.scale(littleBracketXFactor, node.height / chrHeight[node.size], x, y);
      node.elements.push(leftBracket);
    }

    // right bracket
    if (node.height > 2 * bracketHeight[node.size]) {
      let bracketTop = interactiveText('⎞', node, expr);
      bracketTop.font({family: bigBracketFontFamily})
        .x(node.x + node.width - bracketWidth[node.size])
        .y(node.y);
      node.elements.push(bracketTop);

      let bracketBottom = interactiveText('⎠', node, expr);
      bracketBottom.font({family: bigBracketFontFamily})
        .x(node.x + node.width - bracketWidth[node.size])
        .y(node.y + node.height - bracketHeight[node.size]);
      node.elements.push(bracketBottom);

      if (node.height > 2 * bracketHeight[node.size]) {
        let bracketMiddle = expr.svg.rect(
          bracketMiddleWidth[node.size],
          node.height - 2 * bracketHeight[node.size] + bracketMiddleHeightFix[node.size]
        ).fill(expr.config.userConfig.colorSet.darkMain);

        bracketMiddle
          .x(node.x + node.width - rightBracketMiddleOffset[node.size] - bracketMiddleWidth[node.size])
          .y(node.y + bracketHeight[node.size] - bracketMiddleHeightFix[node.size] / 2);
        node.elements.push(bracketMiddle);

        let bracketMiddleHitArea = expr.svg.rect(
          bracketWidth[node.size],
          node.height - 2 * bracketHeight[node.size] + bracketMiddleHeightFix[node.size]
        ).fill(expr.config.userConfig.colorSet.darkMain).opacity(0);

        bracketMiddleHitArea
          .x(node.x + node.width - bracketWidth[node.size])
          .y(node.y + bracketHeight[node.size] - bracketMiddleHeightFix[node.size] / 2);

        bracketMiddleHitArea.css({cursor: 'pointer'});

        bracketMiddleHitArea.on('mousedown', () => onButtonDown(node, expr));
        bracketMiddleHitArea.on('mouseup mouseover', () => onButtonOver(node));
        bracketMiddleHitArea.on('mouseout', () => onButtonOut(node));
      }

    } else {
      let rightBracket = interactiveText(')', node, expr);

      let x = node.x + node.width - chrWidth[node.size] * littleBracketXFactor;
      let y = node.y

      rightBracket.x(x).y(y);
      rightBracket.scale(littleBracketXFactor, node.height / chrHeight[node.size], x, y);
      node.elements.push(rightBracket);
    }
  }

  // calculates .size, .width, .height and .baseline properties
  function calculateProperties(node: ExprNode) {

    recCalculateProperties(node, 0);

    function recCalculateProperties(node: ExprNode, size: number) {
      size = Math.min(size, 2);
      node.size = size;

      if (node.value == '/') {
        recCalculateProperties(node.children[0], size + 1);
        recCalculateProperties(node.children[1], size + 1);
      } else if (node.value == '^') {
        recCalculateProperties(node.children[0], size);
        recCalculateProperties(node.children[1], size + 1);
      } else if (node.value == 'log') {
        recCalculateProperties(node.children[0], size + 1);
        recCalculateProperties(node.children[1], size);
      } else if (
        (
          node.value == "C" ||
          node.value == "A" ||
          node.value == "V" ||
          node.value == "U"
        ) && node.children.length == 2
      ) {
        recCalculateProperties(node.children[0], size + 1);
        recCalculateProperties(node.children[1], size + 1);

      } else {
        for (let child of node.children) {
          recCalculateProperties(child, size);
        }
      }

      if (node.value == '+') {
        let aboveBaseline = 0;
        let belowBaseline = 0;

        let firstChildFlag = true;

        for (let child of node.children) {
          aboveBaseline = Math.max(aboveBaseline, child.baseline);
          belowBaseline = Math.max(belowBaseline, child.height - child.baseline);
          node.width += child.width;

          if (
            firstChildFlag ||
            child.value == '-' ||
            child.value == '*' && child.children[0].value == '+' && child.children[0].children[0].value == '-'
          ) {
            firstChildFlag = false;
            continue;
          }

          node.width += chrWidth[size];
        }

        node.height = aboveBaseline + belowBaseline;
        node.baseline = aboveBaseline;

      } else if (node.value == '-') {
        node.width = node.children[0].width + chrWidth[size];
        node.height = node.children[0].height;
        node.baseline = node.children[0].baseline;

      } else if (node.value == '*') {
        let aboveBaseline = 0;
        let belowBaseline = 0;

        let firstChildFlag = true;

        for (let child of node.children) {
          aboveBaseline = Math.max(aboveBaseline, child.baseline);
          belowBaseline = Math.max(belowBaseline, child.height - child.baseline);
          node.width += child.width;

          if (firstChildFlag) {
            firstChildFlag = false;
            continue;
          }

          node.width += chrWidth[size];
        }

        node.height = aboveBaseline + belowBaseline;
        node.baseline = aboveBaseline;

      } else if (node.value == '/') {
        let topNode = node.children[0];
        let bottomNode = node.children[1];

        node.height = topNode.height + bottomNode.height +
          fractionLineHeight[size];

        node.baseline = topNode.height + fractionLineHeight[size] / 2;

        node.width = Math.max(topNode.width, bottomNode.width) +
          lineElongation;

      } else if (node.value == '^') {
        node.height = node.children[0].height + node.children[1].height - powVerticalOffset[size];
        node.baseline = node.height - (node.children[0].height - node.children[0].baseline);
        node.width = node.children[0].width + node.children[1].width;

      } else if (node.value == 'log') {
        node.height = node.children[1].baseline - chrHeight[size] / 2 + logBaseVerticalOffset[size] + node.children[0].height;
        node.baseline = node.children[1].baseline;
        node.width = 3 * chrWidth[size] + node.children[0].width + node.children[1].width;

      } else if (
        (
          node.value == 'C' ||
          node.value == 'A' ||
          node.value == 'V' ||
          node.value == 'U'
        ) && node.children.length == 2
      ) {
        node.width = chrWidth[size] + Math.max(node.children[0].width, node.children[1].width);
        node.height = node.children[0].height - powVerticalOffset[size] +
          chrHeight[size] - logBaseVerticalOffset[size] +
          node.children[1].height;
        node.baseline = node.children[0].height - powVerticalOffset[size] +
          chrHeight[size] / 2;

      } else if (node.value == 'factorial') {
        node.width = node.children[0].width + chrWidth[size];
        node.height = node.children[0].height;
        node.baseline = node.children[0].baseline;

      } else if (
        node.value == 'sin' ||
        node.value == 'cos' ||
        node.value == 'tg' ||
        node.value == 'ctg' ||
        node.value == 'asin' ||
        node.value == 'acos' ||
        node.value == 'atg' ||
        node.value == 'actg'
      ) {
        node.width = node.children[0].width + chrWidth[size] * node.value.length;
        node.height = node.children[0].height;
        node.baseline = node.children[0].baseline;

      } else if (node.value == '') {
        node.height = node.children[0].height;
        node.baseline = node.height / 2;
        node.width = node.children[0].width;

      } else {
        node.width = node.value.length * chrWidth[size];
        node.height = chrHeight[size];
        node.baseline = node.height / 2;
      }

      if (areBracketsNeeded(node)) {
        node.width += calculateBracketWidth(node) * 2;
      }
    }
  }

  // calculates .x and .y coordinates
  function calculateCoordinates(node: ExprNode) {

    iterCalculateCoordinates(node, 0, 0);

    function iterCalculateCoordinates(node: ExprNode, x: number, y: number) {
      node.x = x;
      node.y = y;

      let horizontalOffset = 0;

      if (areBracketsNeeded(node)) {
        horizontalOffset += calculateBracketWidth(node);
      }

      if (node.value == '+') {

        let firstChildFlag = true;

        for (let child of node.children) {
          if (!(
            firstChildFlag ||
            child.value == '-' ||
            child.value == '*' && child.children[0].value == '+' && child.children[0].children[0].value == '-'
          )) {
            horizontalOffset += chrWidth[child.size];
          }

          iterCalculateCoordinates(child, x + horizontalOffset,
            y + node.baseline - child.baseline);

          horizontalOffset += child.width;
          firstChildFlag = false;
        }

      } else if (node.value == '-') {
        iterCalculateCoordinates(node.children[0],
          x + chrWidth[node.size], y);

      } else if (node.value == '*') {

        let firstChildFlag = true;

        for (let child of node.children) {
          if (!firstChildFlag) {
            horizontalOffset += chrWidth[child.size];
          }

          iterCalculateCoordinates(child, x + horizontalOffset,
            y + node.baseline - child.baseline);

          horizontalOffset += child.width;
          firstChildFlag = false;
        }

      } else if (node.value == '/') {
        let topNode = node.children[0];
        let bottomNode = node.children[1];

        iterCalculateCoordinates(topNode,
          x + (node.width - topNode.width) / 2, y);

        iterCalculateCoordinates(bottomNode,
          x + (node.width - bottomNode.width) / 2,
          y + node.baseline + fractionLineHeight[node.size] / 2);

      } else if (node.value == '^') {
        iterCalculateCoordinates(node.children[0], x + horizontalOffset, y + node.children[1].height - powVerticalOffset[node.size]);
        iterCalculateCoordinates(node.children[1], x + node.children[0].width + horizontalOffset, y);

      } else if (node.value == 'log') {

        iterCalculateCoordinates(node.children[0],
          x + 3 * chrWidth[node.size] + horizontalOffset,
          y + node.baseline - chrHeight[node.size] / 2 + logBaseVerticalOffset[node.size]
        );
        iterCalculateCoordinates(node.children[1],
          x + 3 * chrWidth[node.size] + node.children[0].width + horizontalOffset,
          y
        );

      } else if (
        (
          node.value == 'C' ||
          node.value == 'A' ||
          node.value == 'V' ||
          node.value == 'U'
        ) && node.children.length == 2
      ) {
        iterCalculateCoordinates(node.children[0],
          x + chrWidth[node.size] + horizontalOffset,
          y + node.children[1].height - powVerticalOffset[node.size] +
            chrHeight[node.size] - logBaseVerticalOffset[node.size]
        );
        iterCalculateCoordinates(node.children[1],
          x + chrWidth[node.size],
          y
        );

      } else if (node.value == 'factorial') {
        iterCalculateCoordinates(node.children[0], x + horizontalOffset, y);

      } else if (
        node.value == 'sin' ||
        node.value == 'cos' ||
        node.value == 'tg' ||
        node.value == 'ctg' ||
        node.value == 'asin' ||
        node.value == 'acos' ||
        node.value == 'atg' ||
        node.value == 'actg'
      ) {
        iterCalculateCoordinates(node.children[0],
          x + chrWidth[node.size] * node.value.length + horizontalOffset,
          y
        );

      } else if (node.value == '') {
        iterCalculateCoordinates(node.children[0], x + horizontalOffset, y);

      }
    }
  }

  // prints the expression on the screen
  function recPrintTree(node: ExprNode, expr: Expr) {
    for (let child of node.children) {
      recPrintTree(child, expr);
    }

    let horizontalOffset = 0;

    if (areBracketsNeeded(node)) {
      makeBrackets(node, expr);
      horizontalOffset += calculateBracketWidth(node);
    }

    if (node.value == '+') {
      let firstChildFlag = true;

      for (let child of node.children) {
        if (
          firstChildFlag ||
          child.value == '-' ||
          child.value == '*' && child.children[0].value == '+' && child.children[0].children[0].value == '-'
        ) {
          firstChildFlag = false;
          continue;
        }

        let operationSign = interactiveText(node.value, node, expr);
        operationSign
          .x(child.x - chrWidth[child.size])
          .y(node.y + node.baseline - chrHeight[child.size] / 2);

        node.elements.push(operationSign);
      }

    } else if (node.value == '-') {
      let operationSign = interactiveText('\u2212', node, expr);
      operationSign
        .x(node.x)
        .y(node.y + node.baseline - chrHeight[node.size] / 2);

      node.elements.push(operationSign);

    } else if (node.value == '*') {
      let firstChildFlag = true;

      for (let child of node.children) {
        if (firstChildFlag) {
          firstChildFlag = false;
          continue;
        }

        let operationSign = interactiveText('\u2219', node, expr);
        operationSign
          .x(child.x - chrWidth[child.size])
          .y(node.y + node.baseline - chrHeight[child.size] / 2);

        node.elements.push(operationSign);
      }

    } else if (node.value == '/') {
      let fractionLineWidth = node.width - 2 * horizontalOffset;

      let fractionLine = expr.svg
        .rect(fractionLineWidth, fractionLineHeight[node.size])
        .fill(expr.config.userConfig.colorSet.darkMain)
        .x(node.x + horizontalOffset)
        .y(node.y + node.baseline - fractionLineHeight[node.size] / 2);

      let fractionLineHitArea = expr.svg
        .rect(fractionLineWidth, fractionLineHeight[node.size] * 5)
        .opacity(0)
        .x(node.x + horizontalOffset)
        .y(node.y + node.baseline - fractionLineHeight[node.size] * 2.5);

      fractionLineHitArea.css('cursor', 'pointer');

      fractionLineHitArea.on('mousedown', () => onButtonDown(node, expr));
      fractionLineHitArea.on('mouseup mouseover', () => onButtonOver(node));
      fractionLineHitArea.on('mouseout', () => onButtonOut(node));

      node.elements.push(fractionLine);

    } else if (node.value == '^') {
      let powHitArea = expr.svg
        .rect(powHitAreaWidth[node.size], powHitAreaHeight[node.size])
        .opacity(0)
        .x(node.x + node.children[0].width - powHitAreaWidth[node.size] / 2 + horizontalOffset)
        .y(node.y + node.children[1].height - powVerticalOffset[node.size] + powHitAreaVerticalOffset[node.size])

      powHitArea.css('cursor', 'pointer');

      powHitArea.on('mousedown', () => onButtonDown(node, expr));
      powHitArea.on('mouseup mouseover', () => onButtonOver(node));
      powHitArea.on('mouseout', () => onButtonOut(node));

    } else if (node.value == 'log') {
      let operationName = interactiveText(node.value, node, expr);
      operationName.x(node.x + horizontalOffset).y(node.y + node.baseline - chrHeight[node.size] / 2);

      node.elements.push(operationName);

    } else if (
      (
        node.value == 'C' ||
        node.value == 'A' ||
        node.value == 'V' ||
        node.value == 'U'
      ) && node.children.length == 2
    ) {
      let operationName = interactiveText(node.value, node, expr);
      operationName
        .x(node.x)
        .y(node.y + node.baseline - chrHeight[node.size] / 2);

      node.elements.push(operationName);

    } else if (node.value == 'factorial') {
      let operationSign = interactiveText('!', node, expr);
      operationSign
        .x(node.x + node.width - chrWidth[node.size])
        .y(node.y + node.baseline - chrHeight[node.size] / 2)

      node.elements.push(operationSign);

    } else if (
      node.value == 'sin' ||
      node.value == 'cos' ||
      node.value == 'tg' ||
      node.value == 'ctg' ||
      node.value == 'asin' ||
      node.value == 'acos' ||
      node.value == 'atg' ||
      node.value == 'actg'
    ) {
      let operationName = interactiveText(node.value, node, expr);
      operationName
        .x(node.x + horizontalOffset)
        .y(node.y + node.baseline - chrHeight[node.size] / 2);

      node.elements.push(operationName);

    } else if (node.value == '') {
      // Nothing should be here

    } else {
      let element = interactiveText(node.value, node, expr);
      element.x(node.x + horizontalOffset).y(node.y);
      node.elements.push(element);
    }
  }

  function onButtonDown(node: ExprNode, expr: Expr) {
    expr.click(node);
  }

  function onButtonOver(node: ExprNode) {
    for (let element of node.elements) {
      // @ts-ignore
      element.animate(300, '<>').attr({opacity: 0.5});
    }

    for (let child of node.children) {
      onButtonOver(child);
    }
  }

  function onButtonOut(node: ExprNode) {
    for (let element of node.elements) {
      // @ts-ignore
      element.animate(300, '<>').attr({opacity: 1});
    }

    for (let child of node.children) {
      onButtonOut(child);
    }
  }

  return expr.svg;
}

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
      family: config.userConfig.fontSet.expr,
      fill: config.userConfig.colorSet.darkMain
    });
    txt.css({cursor: "pointer"});
    txt.css({userSelect: "none"});
    txt.leading(0.9); // TODO: maybe there is a way around it after all
    //txt.on("mousedown", () => onButtonDown(cont, nodeId, expr));
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

    lineHitbox.css('cursor', 'pointer');
    //lineHitbox.on('mousedown', () => onButtonDown(cont, nodeId, expr));
    lineHitbox.on('mouseup mouseover', () => onButtonOver(cont));
    lineHitbox.on('mouseout', () => onButtonOut(cont));
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
      //powHitbox.on("mousedown", () => onButtonDown(curCont,
      //  v.twfNode.nodeId, expr));
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
        tmp = interactiveText('\u2219', curCont, size, v.twfNode.nodeId, expr.config);
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

    } else if (
      v.value === '' ||
      v.value === 'sin' ||
      v.value === 'cos' ||
      v.value === 'tg' ||
      v.value === 'ctg'
    ) {
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

  /*
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
  */

  function onButtonOver(con: SVG.Element) {
    // @ts-ignore
    con.animate(300, "<>").attr({opacity: 0.5});
  }

  function onButtonOut(con: SVG.Element) {
    // @ts-ignore
    con.animate(300, "<>").attr({opacity: 1});
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

function changeColor(con: SVG.Element, fromClass: string, toClass: string,
  toColor: string) {
  if (!con.hasClass(fromClass)) {
    return;
  }

  // @ts-ignore
  con.animate(300, '<>').attr({fill: toColor});
  con.removeClass(fromClass);
  con.addClass(toClass);
  for (let item of con.children()) {
    changeColor(item, fromClass, toClass, toColor);
  }
}

export { printExpr, printTree, plainPrintExpr, changeColor };