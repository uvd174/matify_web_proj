import './css/index.css'
import learn_levels from './learn_levels.json';
import { Config } from './Config/ConfigClass';
import { MainMenu } from './SceneClasses/MainMenuClass';
// @ts-ignore
import { TWF_lib } from './libs/TWF_lib';

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
let main_menu = new MainMenu(config);

export { compiledConfiguration };