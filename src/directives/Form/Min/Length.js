(function(){
	'use strict';
  /**
   * @ngdoc directive
   * @name gumga.core:gumgaMinLength
   * @element input
   * @restrict A
   * @description O componente GumgaMinLength serve para validar quantidades mínimas de caracteres em entradas de formulários.
   *
   * ## Nota
   * O valor do atributo/diretiva é **obrigatório** e deve ser um **número**.
   *
   * @example
   *  Um exemplo da directive GumgaMinLength funcionando pode ser encontrado [aqui](http://embed.plnkr.co/ENXymH2Drgw3MDPJ9dli).
   *  <pre>
   *    <form name="myForm">
   *      <input type="date" name="minLength" ng-model="minLength" gumga-min-length="20" id="minLength">
   *      <p ng-show="myForm.minLength.$error.minlength" class="text-danger">Tamanho inferior ao esperado</p>
   *    </form>
   *  </pre>
  */
	MinLength.$inject = [];
	function MinLength() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {
        if (!attrs.gumgaMinLength) {
          throw "O valor da diretiva gumga-min-length não foi informado.";
        }
        var validateMinLength = function (inputValue) {
					var error = 'minlength';
          var input = (inputValue == undefined) ? -1 : inputValue.length;
          var min = attrs.gumgaMinLength;
          var isValid = input >= min;
          ctrl.$setValidity(error, isValid);
					scope.$broadcast('$error', {
						name: attrs.name,
						valid: isValid,
						error: error,
						value: attrs.gumgaMinLength
					});
          return inputValue;
        };
	 			ctrl.$parsers.unshift(validateMinLength);
	 			ctrl.$formatters.push(validateMinLength);
	 			attrs.$observe('gumgaMinLength', function () {
	 				validateMinLength(ctrl.$viewValue);
	 			});
	 		}
	 	}
	 }
	 angular.module('gumga.directives.form.min.length',[])
	 .directive('gumgaMinLength',MinLength);
	})();
