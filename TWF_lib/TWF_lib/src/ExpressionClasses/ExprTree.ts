import { ExprNode } from './ExprNode';
// @ts-ignore
import { TWF_lib } from '../libs/TWF_lib';

function makeTree(node: any): ExprNode {
  let exprNode = new ExprNode(node);
  for (let i = 0; i < node.children.size; i++) {
    exprNode.add(makeTree(node.children.toArray()[i]));
  }
  return exprNode;
}

class ExprTree {
  root: ExprNode;

  constructor(exprString: string) {
    let TWFTree = TWF_lib.structureStringToExpression(exprString);
    this.root = makeTree(TWFTree.children.toArray()[0]);
  }
}

export { ExprTree };