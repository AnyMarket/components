# Componente - GumgaConfirm

### Uso
```html
<button type="button" ng-click="foo()"
  gumga-confirm="Tem certeza que deseja realizar esta ação?"
  dismiss-button="Não"
  confirm-button="Sim"
  confirm-button-class="btn btn-primary"
  dismiss-button-class="btn btn-default">
</button>
```
### Descrição

O componente gumgaConfirm pode ser utilizado para interceptar um clique em algum elemento que contenha a diretiva `ng-click`, mostrar um modal de confirmação que, se o usuário clicar no botão de confirmação,
a ação que está registrada no `ng-click` será executada.

### Atributos

- **`gumga-confirm`:** Atributo **obrigatório**  que deve ser uma string que irá conter o conteúdo da mensagem que será mostrado no modal.
- **`dismiss-button`:** Atributo **opcional** que deve ser uma string que irá conter o texto que irá no botão de cancelar.
- **`confirm-button`:** Atributo **opcional** que deve ser uma string que irá conter o texto que irá no botão de confirmar.
- **`dismiss-button-class`:** Atributo **opcional** que deve ser uma string que irá conter qual classe o botão de cancelar assumirá.
- **`confirm-button-class`:** Atributo **opcional** que deve ser uma string que irá conter qual classe o botão de confirmar assumirá.
- **`icon`**: Atributo **opcional** que deve ser o nome de uma classe que represente um ícone. Ex.: Glyphicon Twitter Bootstrap ou FontAwesome, por padrão será usado *glyphicon-question-sign*.
- **`size`**: Atributo **opcional** que deve ter o tamanho da modal. Ex.: sm ou lg, por padrão será usado *md*.
