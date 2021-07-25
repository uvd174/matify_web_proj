import { ExprNode } from './ExprNode';
import * as SVG from '@svgdotjs/svg.js';
// @ts-ignore
import { TWF_lib } from '../libs/TWF_lib';

function makeTree(node: any, app: SVG.Container): ExprNode {
  let exprNode: ExprNode = new ExprNode(node, app);
  for (let i = 0; i < node.children.size; i++) {
    exprNode.add(makeTree(node.children.toArray()[i], app));
  }
  return exprNode;
}

class ExprTree {
  root: ExprNode;

  constructor(exprString: string, app: SVG.Container) {
    this.root = makeTree(TWF_lib.structureStringToExpression(exprString).children.toArray()[0], app);
  }
}

export { ExprTree };