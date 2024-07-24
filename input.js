var complete = document.getElementById('complete');

function myMask(input, options = { reverse: false, mask: '', fcomplete: undefined, caps: false, maxlength: 255 }) {

    /* Testa se o elemento passado a funcao e um elemento do tipo input */
    if (!input instanceof HTMLInputElement) {
        console.log("Este elemento não é um Input!");
    }

    /* Criando os objetos que nao foram criados na inicializacao da funcao */
    options?.reverse == undefined ? options.reverse = false : false;
    options?.mask == undefined ? options.mask = '' : '';
    options?.caps == undefined ? options.caps = false : false;

    /* Definicao da variavel do texto */
    let txt_encadeado = input.value.split('');
    let mask = options.mask.split('');
    let tam_mask = mask.length;
    let control_mask = 0;
    let signals_mask = [',', '.', '*', '|', '\\', '/', '-', '_'];
    input.addEventListener("keydown", function (e) {
        /* Cancela o retorno do valor e borbulhamento */
        e.cancelBubble = true;
        e.returnValue = false;

        /* Definindo a variavel da tecla pressionada */
        let k = e.key;

        /* Se o caps esta ativado obriga as letras em maiusculo */
        if (options.caps) {
            k = k.toUpperCase();
        }

        /*Caso o usuario aperte backspace para apagar*/
        if (e.code == 'Backspace' && txt_encadeado.length > 0) {
            txt_encadeado.pop();
            control_mask--;
        }
        console.log(txt_encadeado.length, options.maxlength);
        if (options.mask.split('').length > 0) {

            if (options.reverse) {
                if (e.code != 'Backspace' && txt_encadeado.length < options.maxlength) {
                    txt_encadeado.unshift(k)
                }
            } else {
                if (e.code != 'Backspace' && txt_encadeado.length < options.maxlength) {
                    if (options.mask == '[0-9]') {
                        let num = new RegExp(options.mask, "g")
                        if (num.test(k)) {
                            txt_encadeado.push(k)
                        }
                    }
                    else if (options.mask == '[A-Z]') {
                        let abc = new RegExp("[^0-9]", "g")
                        if (abc.test(k)) {
                            txt_encadeado.push(k);
                        }
                    } else {
                        /* Definicao do tamanho do maxlegth*/
                        options.maxlength = tam_mask;
                        /* Uso das variaveis mask e tam_mask */
                        if (signals_mask.includes(mask[control_mask])) {
                            txt_encadeado.push(mask[control_mask]);
                            control_mask++;
                        } else {

                            if (Number.isNaN(mask[control_mask])) {
                                let abc = new RegExp("[^0-9]", "g")
                                if (abc.test(k)) {
                                    txt_encadeado.push(k);
                                    control_mask++;
                                }
                                
                            } else {
                                let num = new RegExp("[0-"+mask[control_mask]+"]", "g")
                                if (num.test(k)) {
                                    txt_encadeado.push(k);
                                    control_mask++;
                                }
                                
                            }
                        }


                    }
                }
            }


        }


        input.value = txt_encadeado.join('');

        if (options?.fcomplete) {
            if (!(options.fcomplete instanceof Function)) {
                console.log("O objeto precisa ser uma funcão!")
            }
            if (options?.maxlength) {
                if (options.maxlength == txt_encadeado.length) {
                    options.fcomplete();
                }
            }
        }
    }
    )


}
myMask(complete, { caps: true, mask: 'A99-999', fcomplete: function () { console.log("chegou no final!", this.element) }, maxlength: 5 });