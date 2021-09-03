import './sass/index.sass';
import { Config } from './Config/ConfigClass';
import { MainMenu } from './SceneClasses/MainMenuClass';
// @ts-ignore
import { TWF_lib } from './libs/TWF_lib';
import * as SVG from '@svgdotjs/svg.js';
import { Expr } from "./ExpressionClasses/Expr";
import { ExprNode } from "./ExpressionClasses/ExprNode";

var compiledConfiguration = TWF_lib.createCompiledConfigurationFromExpressionSubstitutionsAndParams([
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

let config = new Config();
//new MainMenu(config);

setTimeout(() => {
  let app = SVG.SVG().addTo('body').size(window.innerWidth, window.innerHeight);
  let rect = app.rect(window.innerWidth, window.innerHeight).fill(config.userConfig.colorSet.lightBackground);
  let testString = '(+(^(sin(x);6);^(cos(x);6);*(3;^(sin(x);2);^(cos(x);2))))';
  let expr = new Expr(testString, app, true, 50, config);
  expr.svg.center(rect.cx(), rect.cy());
}, 100);



export { compiledConfiguration };