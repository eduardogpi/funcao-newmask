/**
 * myMask - Função de máscara para inputs sem dependência de jQuery
 *
 * @param {HTMLInputElement} input - Elemento input alvo
 * @param {Object} options
 * @param {string}   options.mask       - Padrão da máscara (ex: '99/99/9999', '[0-9]', '[A-Z]')
 * @param {boolean}  options.reverse    - Insere caracteres da direita para esquerda (padrão: false)
 * @param {boolean}  options.caps       - Força letras maiúsculas (padrão: false)
 * @param {number}   options.maxlength  - Máximo de caracteres permitidos (padrão: 255)
 * @param {Function} options.fcomplete  - Callback chamado ao completar o preenchimento
 */
function myMask(input, options = {}) {
    if (!(input instanceof HTMLInputElement)) {
        throw new Error('myMask: o primeiro argumento deve ser um HTMLInputElement.');
    }

    // Defaults
    const reverse   = options.reverse   ?? false;
    const caps      = options.caps      ?? false;
    const fcomplete = options.fcomplete ?? null;
    const mask      = options.mask      ?? '';
    const maskChars = mask.split('');
    const tamMask   = maskChars.length;
    const signals   = [',', '.', '*', '|', '\\', '/', '-', '_'];

    // maxlength: se há máscara formatada, usa o tamanho dela; caso contrário, usa o informado
    let maxlength = (mask && mask !== '[0-9]' && mask !== '[A-Z]')
        ? tamMask
        : (options.maxlength ?? 255);

    let txtArray    = [];
    let controlMask = 0;

    /**
     * Retorna o valor sem os separadores da máscara (útil para enviar ao backend)
     */
    input.getRawValue = () => {
        return txtArray.filter(c => !signals.includes(c)).join('');
    };

    // ── Evento keydown ────────────────────────────────────────────────────────
    input.addEventListener('keydown', function (e) {
        // Permite teclas de navegação e atalhos sem interferência
        const navKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
        if (navKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;

        e.preventDefault();
        e.stopPropagation();

        let k = e.key;

        if (caps) k = k.toUpperCase();

        // Backspace
        if (e.code === 'Backspace') {
            if (txtArray.length === 0) return;

            // Remove o último caractere; se era separador automático, remove mais um
            txtArray.pop();
            controlMask--;

            if (controlMask >= 0 && signals.includes(maskChars[controlMask])) {
                txtArray.pop();
                controlMask--;
            }

            input.value = txtArray.join('');
            return;
        }

        // Ignora se já atingiu o máximo
        if (txtArray.length >= maxlength) return;

        // Sem máscara definida: aceita qualquer caractere
        if (!mask) {
            txtArray.push(k);
            input.value = txtArray.join('');
            return;
        }

        // Máscara especial: apenas números
        if (mask === '[0-9]') {
            if (/[0-9]/.test(k)) txtArray.push(k);
            input.value = txtArray.join('');
            _checkComplete();
            return;
        }

        // Máscara especial: apenas letras
        if (mask === '[A-Z]') {
            if (/[^0-9]/.test(k)) txtArray.push(k);
            input.value = txtArray.join('');
            _checkComplete();
            return;
        }

        // Máscara formatada (ex: '99/99/9999', 'AA-999')
        if (reverse) {
            txtArray.unshift(k);
        } else {
            // Insere separadores automaticamente
            while (controlMask < tamMask && signals.includes(maskChars[controlMask])) {
                txtArray.push(maskChars[controlMask]);
                controlMask++;
            }

            if (controlMask >= tamMask) {
                input.value = txtArray.join('');
                return;
            }

            const maskChar = maskChars[controlMask];

            if (isNaN(maskChar)) {
                // Posição da máscara espera uma letra
                if (/[^0-9]/.test(k)) {
                    txtArray.push(k);
                    controlMask++;
                }
            } else {
                // Posição da máscara espera um número (0 a maskChar)
                const numRegex = new RegExp('[0-' + maskChar + ']');
                if (numRegex.test(k)) {
                    txtArray.push(k);
                    controlMask++;
                }
            }
        }

        input.value = txtArray.join('');
        _checkComplete();
    });

    // ── Evento paste ──────────────────────────────────────────────────────────
    input.addEventListener('paste', function (e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text');

        // Reaplica a máscara caractere a caractere sobre o valor colado
        txtArray    = [];
        controlMask = 0;
        input.value = '';

        for (const char of pasted) {
            const fakeEvent = { key: char, code: '', preventDefault: () => {}, stopPropagation: () => {} };
            // Simula keydown sinteticamente
            _applyChar(char);
            if (txtArray.length >= maxlength) break;
        }

        input.value = txtArray.join('');
        _checkComplete();
    });

    // ── Helpers ───────────────────────────────────────────────────────────────
    function _applyChar(k) {
        if (caps) k = k.toUpperCase();
        if (txtArray.length >= maxlength) return;
        if (!mask) { txtArray.push(k); return; }
        if (mask === '[0-9]') { if (/[0-9]/.test(k)) txtArray.push(k); return; }
        if (mask === '[A-Z]') { if (/[^0-9]/.test(k)) txtArray.push(k); return; }

        while (controlMask < tamMask && signals.includes(maskChars[controlMask])) {
            txtArray.push(maskChars[controlMask]);
            controlMask++;
        }
        if (controlMask >= tamMask) return;

        const maskChar = maskChars[controlMask];
        if (isNaN(maskChar)) {
            if (/[^0-9]/.test(k)) { txtArray.push(k); controlMask++; }
        } else {
            if (new RegExp('[0-' + maskChar + ']').test(k)) { txtArray.push(k); controlMask++; }
        }
    }

    function _checkComplete() {
        if (fcomplete instanceof Function && txtArray.length === maxlength) {
            fcomplete();
        }
    }
}

/**
 * Aplica myMask a todos os elementos que correspondem ao seletor CSS
 *
 * @param {string} selector - Seletor CSS (ex: '.mask-cpf')
 * @param {Object} options  - Mesmas opções de myMask
 */
function myMaskAll(selector, options = {}) {
    document.querySelectorAll(selector).forEach(el => myMask(el, options));
}
