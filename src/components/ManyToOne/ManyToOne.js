(function(){
    'use strict';

    ManyToOne.$inject = ['$templateCache','$uibModal', '$compile'];

    function ManyToOne($templateCache, $uibModal, $compile){
        controller.$inject = ['$scope', '$element', '$attrs'];

        function controller($scope, $element, $attrs){
          let manyToOneCtrl = this, ngModelCtrl;

          const ERR_MSGS = {
            noValue: 'É necessário um atributo value no componente gumgaManyToOne',
            noField: 'É necessário um atributo field no componente gumgaManyToOne',
            noSearch: 'É necessário uma função de busca no componente gumgaManyToOne'
          }

          const possibleAttributes  = ['value', 'list', 'searchMethod', 'field', 'onNewValueAdded', 'onValueVisualizationOpened', 'onValueVisualizationClosed']

          if(!$attrs.value)        console.error(ERR_MSGS.noValue)
          if(!$attrs.field)        console.error(ERR_MSGS.noField)
          if(!$attrs.searchMethod) console.error(ERR_MSGS.noSearch)

          manyToOneCtrl.ev                            = {}
          manyToOneCtrl.list                          = manyToOneCtrl.list                                                    || []
          manyToOneCtrl.ev.onNewValueAdded            = $attrs.onNewValueAdded ? manyToOneCtrl.onNewValueAdded                : angular.noop
          manyToOneCtrl.ev.onValueVisualizationOpened = $attrs.onValueVisualizationOpened ? $attrs.onValueVisualizationOpened : angular.noop
          manyToOneCtrl.ev.onValueVisualizationClosed = $attrs.onValueVisualizationClosed ? $attrs.onValueVisualizationClosed : angular.noop
          manyToOneCtrl.field                         = $attrs.field                                               || ''
          manyToOneCtrl.modalTitle                    = $attrs.modalTitle                                          || 'Visualizador de Registro'
          manyToOneCtrl.modalFields                   = $attrs.modalFields  ? $attrs.modalFields.splice(',')        : [manyToOneCtrl.field]
          manyToOneCtrl.postFields                    = $attrs.postFields   ? $attrs.postFields.split(',')          : [manyToOneCtrl.field]

          function mirrorAttributes(){
            const isOneOfPossibles = attribute => possibleAttributes.filter(value => attribute == value).length > 0
            return Object.keys($attrs.$attr).filter((value) => !isOneOfPossibles(value)).reduce((prev, next) => prev += `${next}="${$attrs[next]}"`, '')
          }

          manyToOneCtrl.displayInfoButton = displayInfoButton
          manyToOneCtrl.displayPlusButton = displayPlusButton
          manyToOneCtrl.openInfo          = openInfo
          manyToOneCtrl.valueToAdd        = ''
          manyToOneCtrl.afterSelect       = afterSelect
          manyToOneCtrl.proxySearch       = (param) =>{
            return  manyToOneCtrl.searchMethod({ param }).then(data => {
              if(data.filter(dataItem => dataItem[manyToOneCtrl.field] == param).length > 0 || !manyToOneCtrl.authorizeAdd){
                return data
              }
              let objToAppend = {}
              objToAppend[manyToOneCtrl.field] = manyToOneCtrl.valueToAdd
              return data.concat(objToAppend)
            })
          }
          manyToOneCtrl.proxySave  = (val, abc) => {
            if(!abc) return
            manyToOneCtrl.isTypeaheadOpen = true;
            const controllerAs = 'ctrl'
            const resolve = { value: () => val }
            controller.$inject = ['$scope','$uibModalInstance', 'value']
            function controller($scope, $uibModalInstance, value){
              let ctrl = this;
              ctrl.object = value
              ctrl.cancel = obj => $uibModalInstance.dismiss('cancel');
              ctrl.save   = obj => $uibModalInstance.close(obj);
            }

            function mountModalBody(){
              let fields = manyToOneCtrl.postFields
              return fields.reduce((prev, next) => {
                return prev += `
                <div class="form-group">
                  <label>${next}</label>
                  <input type="text" class="form-control" ng-model="ctrl.object.${next}" />
                </div>`
              }, ' ')
            }

            let template = `
            <div class="modal-header">
              <h3 class="modal-title">${manyToOneCtrl.modalTitle}</h3>
            </div>
            <div class="modal-body">
              ${mountModalBody()}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" ng-click="ctrl.cancel(ctrl.object)">Retornar</button>
              <button type="button" class="btn btn-primary" ng-click="ctrl.save(ctrl.object)">Salvar</button>
            </div>`


            $uibModal
              .open({ controller, template, controllerAs, resolve })
              .result
              .then(
                    value => {
                      manyToOneCtrl.postMethod({ value }).then(dataFromPostMethod => manyToOneCtrl.value =  dataFromPostMethod.data.data)
                    },
                    reject => manyToOneCtrl.value = ''
                  )
          }

          function displayInfoButton(){
            if(!ngModelCtrl.$$rawModelValue) return false
            return !(typeof ngModelCtrl.$$rawModelValue === 'string' || ngModelCtrl.$$rawModelValue instanceof String)
          }

          function displayPlusButton(){
            return manyToOneCtrl.postMethod
                && (typeof ngModelCtrl.$$rawModelValue === 'string' || ngModelCtrl.$$rawModelValue instanceof String)
                && ngModelCtrl.$$rawModelValue.length > 0
          }

          function afterSelect($item, $model, $label, $event, isBtn){
            if(!$model.id) manyToOneCtrl.proxySave($model, isBtn)
          }
          function openInfo(object = {}, $event) {

            manyToOneCtrl.isTypeaheadOpen = true;
            $event.stopImmediatePropagation()
            $event.preventDefault()
            controller.$inject = ['$scope','$uibModalInstance']

            function controller($scope, $uibModalInstance){
              $scope.close = () => $uibModalInstance.close()
            }

            function mountModalBody(){
              let fields = manyToOneCtrl.modalFields
              return fields.reduce((prev, next) => {
                return prev += `
                <div class="form-group">
                  ${ (typeof object[next] === 'string' || object[next] instanceof String) ? `<label>${next}</label>` : ' '}
                  ${ (typeof object[next] === 'string' || object[next] instanceof String) ? `<input type="text" class="form-control" value="${object[next]}" disabled />` : ' '}
                </div>`
              }, ' ')
            }

            let template = `
            <div class="modal-header">
              <h3 class="modal-title">${manyToOneCtrl.modalTitle}</h3>
            </div>
            <div class="modal-body">
              ${mountModalBody()}
            </div>
            `
            $uibModal.open({ controller, template })

          }

          let baseTemplate = `
          <div class="full-width-without-padding">
            <div  ng-class="manyToOneCtrl.displayInfoButton()  ? 'input-group' : 'form-group'">
              <input type="text"class="form-control" ng-model="manyToOneCtrl.value" uib-typeahead="$value as $value[manyToOneCtrl.field] for $value in manyToOneCtrl.proxySearch($viewValue)" ${mirrorAttributes()}
                     typeahead-template-url="manyToOneTemplate.html" typeahead-is-open="manyToOneCtrl.isTypeaheadOpen" typeahead-on-select="manyToOneCtrl.afterSelect($item, $model, $label, $event, 'isNotButton')"/>
               <div class="input-group-btn">
                <button type="button" class="btn btn-default" ng-show="manyToOneCtrl.displayInfoButton()" ng-click="manyToOneCtrl.openInfo(manyToOneCtrl.value, $event)">
                  <span class="glyphicon glyphicon-info-sign"></span>
                </button>
              </div>
            </div>
          </div>`

          let templateForMatch = `
          <a class="col-md-12" >
            <span class="col-md-10">
              <span ng-bind-html="match.label | uibTypeaheadHighlight:query" >
              </span>
            </span>
            <span class="col-md-2">
              <span class="label label-info text-right" style="float: right;display: inline-block;" ng-click="$parent.$parent.$parent.$parent.manyToOneCtrl.openInfo(match.model, $event)" ng-hide="$parent.$parent.$parent.$parent.manyToOneCtrl.valueToAdd == match.label && !match.label.id">
                <span class="glyphicon glyphicon-info-sign"></span>
              </span>
              <span class="label label-success text-right" style="float: right;display: inline-block;" ng-click="$parent.$parent.$parent.$parent.manyToOneCtrl.proxySave(match.model)" ng-show="$parent.$parent.$parent.$parent.manyToOneCtrl.valueToAdd == match.label && !match.model.id && !!$parent.$parent.$parent.$parent.manyToOneCtrl.authorizeAdd">
                <span class="glyphicon glyphicon-plus"></span>
              </span>
            </span>
            <div class="clearfix"></div>
          </a>
          `

          $templateCache.put('manyToOneTemplate.html', templateForMatch)

          let element = angular.element(baseTemplate),
              input   = element.find('input'),
              form    = $element.parent()
          while(form[0].nodeName != 'FORM') form = form.parent();
          let formController = $scope.$parent[form.attr('name')]

          $element.append($compile(element)($scope))

          ngModelCtrl = input.controller('ngModel')

          formController.$addControl(ngModelCtrl)

          ngModelCtrl.$validators['manyToOne'] = modelValue => modelValue ? !(typeof modelValue === 'string' || modelValue instanceof String) : true

          $scope.$watch(() => ngModelCtrl.$$rawModelValue, () => (manyToOneCtrl.valueToAdd = ngModelCtrl.$$rawModelValue))
        }

        return {
            restrict : 'E',
            scope : {
              value: '=',
              searchMethod: '&',
              postMethod: '&?',
              list: '=?',
              authorizeAdd: '=?'
            },
            controllerAs: 'manyToOneCtrl',
            bindToController: true,
            controller
        }
    }
        angular.module('gumga.manytoone',['ui.bootstrap'])
        .directive('gumgaManyToOne',ManyToOne);
    })();
