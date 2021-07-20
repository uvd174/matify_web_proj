// @ts-ignore
import { TWF_lib } from './libs/TWF_lib';
import * as SVG from '@svgdotjs/svg.js';
import { ExprNode } from './ExpressionClasses/ExprNode';
import { ExprTree } from './ExpressionClasses/ExprTree';
import { Expr } from './ExpressionClasses/Expr';
import { Config } from './Config/ConfigClass';
import defaults from './defaults.json';
import { Timer } from './TimerClass/TimerClass';

/*

PrintExpr(TWF_v, init_font_size, app);

TWF_v - корень дерева из библиотеки TWF, которое надо отобразить
init_font_size - желаемый размер шрифта
app - SVG контейнер, в который надо поместить отрисованное дерево

Возвращает SVG контейнер, содержащий отрисованное интерактивное дерево
P.S. не надо добавлять возвращенный контейнер в app: это делается
автоматически в PrintTree


PlainPrintExpr(TWF_v, init_font_size, app);

Делает то же самое, но дерево будет лишено интерактивности


initTestingGround(test_expr, font_size);

test_expr - structure_string строка, описывающая дерево для отрисовки
font_size - желаемый размер шрифта

Создает небольшую сцену, на которую отрисовывает дерево из test_expr

*/

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