(function(){
    'use strict';

    Filter.$inject = ['HQLFactory','$compile','$timeout'];
    function Filter(HQLFactory,$compile, $timeout) {
        let template = `
        <div>
            <button class="btn btn-default" ng-click="filterToggle()">
                <span class="glyphicon glyphicon-filter"></span>
            </button>
        </div>
        <div class="gumga-filter panel panel-default" ng-show="isOpen">
            <header class="panel-heading" style="padding: 8px 15px">
                <div class="row">
                    <div class="col-md-6">
                        <h4 style="margin: 8px 0">Busca avançada</h4>
                    </div>
                    <div class="col-md-6">

                        <div class="input-group" ng-init="saveFilterOpen = false">
                            <input type="text" class="form-control" aria-label="..." ng-show="saveFilterOpen">
                            <div class="input-group-btn">
                                <button class="btn btn-default" ng-show="saveFilterOpen" ng-click="saveFilterOpen = !saveFilterOpen">
                                    <i class="glyphicon glyphicon-floppy-saved"></i>
                                </button>
                                <button class="btn btn-default" ng-show="saveFilterOpen" ng-click="saveFilterOpen = !saveFilterOpen">
                                    <i class="glyphicon glyphicon-floppy-remove"></i>
                                </button>
                                <button class="btn btn-default pull-right" type="button" ng-show="!saveFilterOpen" ng-click="saveFilterOpen = !saveFilterOpen">
                                    <i class="glyphicon glyphicon-floppy-disk"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div class="form-inline panel-body">

                <div class="input-group" ng-repeat="($key, $value) in controlMap">

                    <div class="input-group-btn">

                        <div class="btn-group" uib-dropdown >
                            <button type="button" class="btn btn-default" uib-dropdown-toggle >
                                <span id="_btn{{$key}}"> {{ $value.query.attribute.label || 'Atributo' }} </span>
                                
                            </button>
                            <ul uib-dropdown-menu role="menu" aria-labelledby="single-button">
                                <li role="menuitem" ng-repeat="attribute in attributes track by $index">
                                    <a ng-click="addAttribute($key, attribute)">{{attribute.label}}</a>
                                </li>
                            </ul>
                        </div>

                        <div class="btn-group hidden" uib-dropdown  id="_btnCondition{{$key}}">
                            <button type="button" class="btn btn-default" uib-dropdown-toggle>
                                <span id="_conditionLabel{{$key}}">{{ $value.query.condition.label || 'Condição' }}</span>
                                
                            </button>

                            <ul uib-dropdown-menu role="menu" aria-labelledby="single-button">
                                <li role="menuitem" ng-repeat="condition in conditions">
                                    <a ng-click="addCondition($key, condition)">{{condition.label}}</a>
                                </li>
                            </ul>
                        </div>

                        <div class="btn-group hidden" uib-dropdown id="_btnValue{{$key}}">
                            <button type="button" class="btn btn-default" uib-dropdown-toggle>
                                <span> {{ $value.query.value || 'Valor' }} </span>
                            </button>
                            <div uib-dropdown-menu role="panel" class="panel panel-default" ng-click="$event.stopPropagation()" style="width: auto">
                                <div class="panel-body" id="_panel">

                                </div>
                            </div>
                        </div>

                        <button type="button" class="btn btn-default" ng-click="clearQuery(query)">
                            <span class="glyphicon glyphicon-remove"></span>
                        </button>

                    </div>

                </div>

                <button id="single-button" type="button" class="btn btn-default" ng-click="addQuery()" ng-disabled="disabled">
                    <span class="glyphicon glyphicon-plus"></span>
                </button>
            </div>
        </div>`;

        return {
            restrict: 'E',
            template: template,
            transclude: true,
            scope : {
                isOpen: '@'
            },
            link: ($scope, $element, $attrs, $ctrl, $transclude) => {
              const FIELD_ERR = `É necessário atribuir um valor ao atributo FIELD da tag ADVANCED-SEARCH-FIELD.`,
                    TYPE_ERR  = `O tipo "{1}" passado como parâmetro para o ADVANCED-SEARCH-FIELD não é suportado.`

              $scope.attributes   = []
              $scope.conditions   = []
              $scope.controlMap   = {}
              $scope.control      = {}
              $scope.addAttribute = addAttribute
              $scope.addCondition = addCondition

              $transclude((transcludeElement) => {
                  [].slice.call(transcludeElement).forEach((value, $index) => {
                    if(value.nodeName !== 'ADVANCED-SEARCH-FIELD') return

                    let field = value.getAttribute('field'),
                        type  = value.getAttribute('type'),
                        label = value.getAttribute('label')

                    if(!field) {
                      console.error(FIELD_ERR)
                      return
                    }

                    type  = type.toLowerCase().trim() || ''
                    label = label                     || field.charAt(0).toUpperCase() + field.slice(1) 

                    if(!HQLFactory.useType(type)){
                      console.error(TYPE_ERR.replace('{1}', type))
                      return
                    }

                    $scope.attributes.push({ field, type, label })
                  })
              });

              let defaultAttribute  = angular.copy($scope.attributes[0]),
                  defaultCondition  = angular.copy(HQLFactory.useType($scope.attributes[0].type).conditions)[0]

              $scope.controlMap['0'] = {
                query: { attribute: defaultAttribute, condition: defaultCondition, value: '' },
                active: true
              }

              const getElm            = (key) => (angular.element(document.getElementById(key)));

              const openCondition     = (index) => (getElm(`_btnCondition${index}`).addClass('open'));
              const showCondition     = (index) => (getElm(`_btnCondition${index}`).removeClass('hidden'));
              const hasClassCondition = (index) => (getElm(`_btnCondition${index}`).hasClass('hidden'));
              const openValue         = (index) => (getElm(`_btnValue${index}`).addClass('open'));
              const showValue         = (index) => (getElm(`_btnValue${index}`).removeClass('hidden'));               
             
              $timeout(() => {
                showCondition(0);
                showValue(0);
                openValue(0);
                $scope.conditions = HQLFactory.useType($scope.controlMap['0'].query.attribute.type).conditions
              })
              
              function addAttribute(index, selectedAttribute){
                if(!$scope.controlMap[index].attribute)
                  $scope.controlMap[index].attribute = {}

                $scope.controlMap[index].attribute = selectedAttribute;

                getElm(`_btn${index}`).html(selectedAttribute.label)

                if(hasClassCondition(index, 'hidden')){
                  showCondition(0);
                  openCondition(0);
                } 

                $scope.conditions = HQLFactory.useType(selectedAttribute.type).conditions

              }

              function addCondition(index, selectedCondition){
                if(!$scope.controlMap[index].condition) $scope.controlMap[index].condition = {}

                $scope.controlMap[index].condition = selectedCondition

                getElm(`_conditionLabel${index}`).html(selectedCondition.label)
                getElm(`_btnCondition${index}`).removeClass('open')

              }



            }
        }
    }
    angular.module('gumga.filter.directive', ['gumga.query.factory'])
    .directive('gumgaFilter', Filter);
})();