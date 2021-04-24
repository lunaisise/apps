window.addEventListener('DOMContentLoaded', () => {
    alert('start');
    const customRadioSelector = '[type="radio"][data-type][data-custom]';

    const heats = new Heats();
    const sizes = new Sizes();
    const customTypes = new CustomTypes();

    let shareTexts = [];

    /**
     * 選択中のheatIdを返却
     * @returns heatId
     */
    function selectedHeatId() {
        return document.querySelector('[name="heats"]:checked').dataset.heat;
    }

    /**
     * 選択中のsizeIdを返却
     * @returns sizeId
     */
    function selectedSizeId() {
        return document.querySelector('[name="sizes"]:checked').dataset.size;
    }

    /**
     * 温度-カスタムを設定
     */
    function heatChangeCustoms() {
        // 不所持カスタムを非表示
        heats.getHeat(selectedHeatId()).hasNotCustomTypeIds.forEach(customTypeId => {
            const liSelector = `li[data-type="${customTypeId}"]`;
            if (document.querySelector(liSelector) !== null) {
                document.querySelector(liSelector).classList.add(dnone);
            }
        });
        // 所持カスタムを表示
        heats.getHeat(selectedHeatId()).hasCustomTypeIds.forEach(customTypeId => {
            const liSelector = `li[data-type="${customTypeId}"]`;
            if (document.querySelector(liSelector) !== null) {
                document.querySelector(liSelector).classList.remove(dnone);
            }
        });
        alert('heatChangeCustoms Success');
    }

    /**
     * カスタム-親カスタムを設定
     */
    function customChangeFriends() {
        // 不仲カスタムを非表示
        customTypes.discords.forEach(discordId => {
            const combination = customTypes.getCombination(discordId);
            const liSelector = `li[data-type="${combination['customTypeId']}"] li[data-custom="${combination['customId']}"]`;
            if (document.querySelector(liSelector) !== null) {
                document.querySelector(liSelector).classList.add(dnone);
            }
        });
        // 親カスタムを表示
        document.querySelectorAll(`${customRadioSelector}:checked`).forEach(radio => {
            const customTypeId = radio.dataset.type;
            const customId = radio.dataset.custom;
            customTypes.getCustomType(customTypeId).getCustom(customId).friends.forEach(friendId => {
                const friend = customTypes.getCombination(friendId);
                const liSelector = `li[data-type="${friend['customTypeId']}"] li[data-custom="${friend['customId']}"]`;
                if (document.querySelector(liSelector) !== null) {
                    document.querySelector(liSelector).classList.remove(dnone);
                }
            });
        });
        // 設定していたカスタムが非表示の場合標準カスタムを選択
        document.querySelectorAll(`.${dnone} > ${customRadioSelector}:checked`).forEach(radio => {
            const customTypeId = radio.dataset.type;
            const customType = customTypes.getCustomType(customTypeId);
            if (customType === undefined) {
                return;
            }
            const defaultCustom = customType.getDetaultCustom();
            if (defaultCustom === null) {
                return;
            }
            const radioSelector = `[type="radio"][data-type="${customType.customTypeId}"][data-custom="${defaultCustom.customId}"]`;
            if (document.querySelector(radioSelector) !== null) {
                document.querySelector(radioSelector)['checked'] = true;
            }
        });
        alert('customChangeFriends Success');
    }

    /**
     * カスタム内容をテキストに変換
     * @param {object} custom カスタム
     */
    function createCustomText(custom) {
        let customName = custom.customName;
        if (custom.isDefault) {
            return customName;
        }
        customName = `'${customName}'`;
        customName += custom.isChange ? ' に変更' : ' を追加';
        customName += custom.isFree ? ' +￥0' : ` +￥${custom.price}`;
        return customName;
    }

    /**
     * カスタムタイプラベルにカスタム内容を設定
     */
    function customChangeLabel() {
        document.querySelectorAll(`${customRadioSelector}:checked`).forEach(radio => {
            const customTypeId = radio.dataset.type;
            const customId = radio.dataset.custom;
            const custom = customTypes.getCustomType(customTypeId).getCustom(customId);
            document.querySelector(`li[data-type="${customTypeId}"] .my-custom`).textContent = createCustomText(custom);
        });
        alert('customChangeLabel Success');
    }

    /**
     * URLを書き換え
     */
    function customChangeUrl() {
        const params = [];
        params.push(`heat=${selectedHeatId()}`);
        params.push(`size=${selectedSizeId()}`);
        const customParams = {};
        document.querySelectorAll(`#customs > li:not(.${dnone}) ${customRadioSelector}:checked`).forEach(radio => {
            const customTypeId = radio.dataset.type;
            const customId = radio.dataset.custom;
            if (customTypes.getCustomType(customTypeId).getCustom(customId).isDefault) {
                return;
            }
            customParams[customTypeId] = customId;
        });
        if (Object.keys(customParams).length !== 0) {
            params.push('customs=' + encodeURIComponent(JSON.stringify(customParams)));
        }
        const condimentParams = [];
        document.querySelectorAll('#condiment-bar [type="checkbox"]:checked').forEach(checkbox => {
            condimentParams.push(checkbox.dataset.condiment);
        });
        if (condimentParams.length !== 0) {
            params.push('condiments=' + encodeURIComponent(JSON.stringify(condimentParams)));
        }
        const param = params.join('&');
        const url = `${location.origin}${location.pathname}?${param}`;
        // console.log(url);
        history.replaceState(null, '', url);
        alert('customChangeUrl Success');
    }

    /**
     * オーダーシートを作成
     */
    function setOrderSheet() {
        // 温度
        const heatNameJa = heats.getHeat(selectedHeatId()).heatNameJa;
        document.querySelector('#custom-heat > b').textContent = heatNameJa;

        // サイズ
        const sizeNameJa = sizes.getSize(selectedSizeId()).sizeNameJa;
        document.querySelector('#custom-size > b').textContent = sizeNameJa;

        // カスタム
        document.querySelector('#custom-customs > ul').textContent = '';
        document.querySelectorAll(`#customs > li:not(.${dnone}) ${customRadioSelector}:checked`).forEach(radio => {
            const customTypeId = radio.dataset.type;
            const customId = radio.dataset.custom;
            const customType = customTypes.getCustomType(customTypeId);
            const custom = customType.getCustom(customId);
            if (custom.isDefault) {
                return;
            }
            if (custom.isChange) {
                const li = createClone('#custom-change-template', 'li');
                li.querySelector('.custom-custom-type-name').textContent = customType.customTypeName;
                li.querySelector('.custom-custom-name').textContent = custom.customName;
                document.querySelector('#custom-customs > ul').appendChild(li);
            } else {
                const li = createClone('#custom-add-template', 'li');
                li.querySelector('.custom-custom-type-name').textContent = customType.customTypeName;
                document.querySelector('#custom-customs > ul').appendChild(li);
            }
        });
        if (document.querySelector('#custom-customs li') === null) {
            const li = document.createElement('li');
            li.textContent = 'なし';
            document.querySelector('#custom-customs > ul').appendChild(li);
        }
        alert('setOrderSheet Success');
    }

    /**
     * 共有テキストを設定
     */
    function setShareTexts() {
        shareTexts = [];
        shareTexts.push(heats.getHeat(selectedHeatId()).heatNameJa);
        shareTexts.push(sizes.getSize(selectedSizeId()).sizeNameJa);
        shareTexts.push(drinkName);
        document.querySelectorAll(`#customs > li:not(.${dnone}) ${customRadioSelector}:checked`).forEach(radio => {
            const customTypeId = radio.dataset.type;
            const customId = radio.dataset.custom;
            const customType = customTypes.getCustomType(customTypeId);
            const custom = customType.getCustom(customId);
            if (custom.isDefault) {
                return;
            }
            shareTexts.push(custom.customSpel + customType.customTypeSpel);
        });
        alert('setShareTexts Success');
    }

    /**
     * ドリンク情報を設定
     */
    function checkCustom() {
        heatChangeCustoms();
        customChangeFriends();
        customChangeLabel();
        customChangeUrl();
        setOrderSheet();
        setShareTexts();
        alert('checkCustom Success');
    }

    /**
     * 1対1の設定を読み込み
     * @param {string} type パラメータータイプ
     */
    function simpleAdaptUserSelection(type) {
        const param = GetParams[type];
        if (param !== undefined) {
            const radioSelector = `[name="${type}s"][data-${type}="${param}"]`;
            if (document.querySelector(radioSelector) !== null) {
                document.querySelector(radioSelector)['checked'] = true;
            }
        }
    }

    /**
     * URLから設定を読み込み
     */
    function adaptUserSelection() {
        // 温度
        simpleAdaptUserSelection('heat');
        // サイズ
        simpleAdaptUserSelection('size');
        // カスタム
        const customsParam = GetParams['customs'];
        if (customsParam !== undefined) {
            const customs = JSON.parse(decodeURIComponent(customsParam));
            Object.keys(customs).forEach(customTypeId => {
                const customId = customs[customTypeId];
                const radioSelector = `[data-type="${customTypeId}"][data-custom="${customId}"]`;
                if (document.querySelector(radioSelector) !== null) {
                    document.querySelector(radioSelector)['checked'] = true;
                }
            });
        }
        // コンディメントバー
        const condimentsParam = GetParams['condiments'];
        if (condimentsParam !== undefined) {
            const condiments = JSON.parse(decodeURIComponent(condimentsParam));
            condiments.forEach(condimentId => {
                const checkboxSelector = `[data-condiment="${condimentId}"]`;
                if (document.querySelector(checkboxSelector) !== null) {
                    document.querySelector(checkboxSelector)['checked'] = true;
                }
            });
        }
        alert('adaptUserSelection Success');
        checkCustom();
    }

    /**
     * ドリンク-カスタム情報を取得
     */
    function getDrinkHasCustoms() {
        fetchGet('../data/drink_has_customs.json', json => {
            if (Object.keys(json).includes(`${drinkId}`)) {
                customTypes.setDrinkHasCustoms(json[`${drinkId}`]);
            }
            alert('getDrinkHasCustoms Success');
            adaptUserSelection();
        }, error => {
            alert('getDrinkHasCustoms');
        });
    }

    /**
     * カスタム情報を取得
     */
    function getCustomFriends() {
        fetchGet('../data/custom_types.json', json => {
            customTypes.setCustomTypes(json);
            alert('getCustomFriends Success');
            getDrinkHasCustoms();
        }, error => {
            alert('getCustomFriends');
        });
    }

    /**
     * サイズ情報を取得
     */
    function getSizes() {
        fetchGet('../data/sizes.json', json => {
            sizes.setSizes(json);
            alert('getSizes Success');
            getCustomFriends();
        }, error => {
            alert('getSizes');
        });
    }

    /**
     * 温度情報を取得
     */
    function getHeats() {
        fetchGet('../data/heats.json', json => {
            heats.setHeats(json);
            alert('getHeats Success');
            getSizes();
        }, error => {
            alert('getHeats');
        });
    }
    getHeats();

    /**
     * OrderとCustomを切り替え
     * @param {string} enableType 有効にするタイプ
     * @param {string} disableType 無効にするタイプ
     */
    function changeOrderCustomButton(enableType, disableType) {
        document.querySelector(`#${disableType}`).classList.add(dnone);
        document.querySelector(`#${enableType}-button`).closest('li').classList.add(dnone);
        document.querySelector(`#${enableType}`).classList.remove(dnone);
        document.querySelector(`#${disableType}-button`).closest('li').classList.remove(dnone);
        window.scroll(0, 0);
        alert('changeOrderCustomButton Success');
    }

    /**
     * 戻るボタンクリック
     */
    document.querySelector('#history-back').addEventListener('click', e => {
        e.preventDefault();
        alert('#history-back Success');
        history.back();
    });

    /**
     * 温度切り替え
     */
    document.querySelectorAll('[name="heats"]').forEach(radio => {
        radio.addEventListener('change', e => {
            alert('[name="heats"] Success');
            checkCustom();
        });
    });

    /**
     * サイズ切り替え
     */
    document.querySelectorAll('[name="sizes"]').forEach(radio => {
        radio.addEventListener('change', e => {
            alert('[name="sizes"] Success');
            checkCustom();
        });
    });

    /**
     * カスタム切り替え
     */
    document.querySelectorAll(customRadioSelector).forEach(radio => {
        radio.addEventListener('change', e => {
            alert(customRadioSelector + ' Success');
            checkCustom();
        });
    });

    /**
     * コンディメントバー切り替え
     */
    document.querySelectorAll('#condiment-bar [type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', e => {
            alert('#condiment-bar [type="checkbox"] Success');
            checkCustom();
        });
    });

    /**
     * Orderボタンクリック
     */
    document.querySelector('#order-button').addEventListener('click', e => {
        // e.preventDefault();
            alert('#order-button Success');
        changeOrderCustomButton('order', 'custom');
    });

    /**
     * Customボタンクリック
     */
    document.querySelector('#custom-button').addEventListener('click', e => {
        // e.preventDefault();
            alert('#custom-button Success');
        changeOrderCustomButton('custom', 'order');
    });

    /**
     * Shareボタンクリック
     */
    document.querySelector('#share-button').addEventListener('click', () => {
        const shareText = shareTexts.join(' ');
        const shareData = {
            title: `${drinkName} | Starbucks Customizer | lunaisise Apps`,
            text: `${drinkName}のマイカスタム\n${shareText}`,
            url: location.href
        };
        alert(location.href);
        shareApi(shareData);
    });
});