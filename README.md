# funcao-newmask

Função JavaScript pura de **máscara para inputs** sem dependência de jQuery ou qualquer outra biblioteca.

## Uso

```html
<script src="input.js"></script>
```

### `myMask(input, options)`

Aplica uma máscara a um único elemento `<input>`.

```js
myMask(document.getElementById('cpf'), { mask: '999.999.999-99' });
```

### `myMaskAll(selector, options)`

Aplica a mesma máscara a todos os inputs que correspondem a um seletor CSS.

```js
myMaskAll('.mask-cpf', { mask: '999.999.999-99' });
```

## Opções

| Opção | Tipo | Padrão | Descrição |
|---|---|---|---|
| `mask` | `string` | `''` | Padrão da máscara (ver abaixo) |
| `reverse` | `boolean` | `false` | Insere da direita para esquerda |
| `caps` | `boolean` | `false` | Força letras maiúsculas |
| `maxlength` | `number` | `255` | Máximo de caracteres |
| `fcomplete` | `function` | `null` | Callback ao completar o campo |

## Formatos de máscara

| Padrão | Aceita |
|---|---|
| `9` | Dígito numérico |
| `A` | Letra (não numérico) |
| `[0-9]` | Apenas números (sem formato fixo) |
| `[A-Z]` | Apenas letras (sem formato fixo) |
| `, . - / _ \| *` | Separadores inseridos automaticamente |

## Exemplos

```js
// CPF
myMask(el, { mask: '999.999.999-99' });

// Data
myMask(el, { mask: '99/99/9999' });

// Placa de carro com callback
myMask(el, {
    mask: 'AAA-9999',
    caps: true,
    fcomplete: () => proximoCampo.focus()
});

// Somente números
myMask(el, { mask: '[0-9]', maxlength: 10 });
```

## Métodos no elemento

Após aplicar a máscara, o input recebe o método `getRawValue()` que retorna o valor sem separadores:

```js
myMask(cpfInput, { mask: '999.999.999-99' });
cpfInput.getRawValue(); // '12345678900' (sem pontos e hífen)
```

## Suporte a colar (Ctrl+V)

O campo aceita valores colados e reaaplica a máscara automaticamente.
