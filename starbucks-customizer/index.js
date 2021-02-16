window.addEventListener('DOMContentLoaded', () => {
    const japanese = {
        hot: "ホット",
        iced: "アイス",
        Short: "ショート",
        Tall: "トール",
        Grande: "グランデ",
        'Venti®': "ベンティ"
    };
    const getParam = (() => {
        const search = window.location.search.substring(1);
        if (search.length === 0) {
            return {};
        }
        const searchs = search.split('&');
        let returns = {};
        searchs.forEach(param => {
            const params = param.split('=');
            const key = decodeURIComponent(params[0]);
            const value = decodeURIComponent(params[1]);
            returns[key] = value;
        });
        return returns;
    })();

    let beverages;
    let customs;
    let beverageHasCustoms;
    let category;
    let beverageId;
    let heat;
    let size;
    let change = {};
    let add = [];
    let condiment = [];

    /**
     * 
     * @param {*} url 
     * @param {*} successFunc 
     * @param {*} errorFunc 
     */
    function fetchGet(url, successFunc = null, errorFunc = null) {
        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw response.status;
            }).then(json => {
                if (successFunc !== null) {
                    successFunc(json);
                } else {
                    console.log(json);
                }
            }).catch(error => {
                if (errorFunc !== null) {
                    errorFunc(error);
                } else {
                    console.error(error);
                }
            });
    }

    /**
     * 
     */
    function afterGetBeverage() {
        const json = beverages;
        Object.keys(beverages).forEach(category => {
            const categoryName = json[category]['name'];

            const template = document.querySelector('#category-template');
            const clone = template.content.cloneNode(true);
            clone.querySelector('.category').id = category;
            clone.querySelector('h2').textContent = categoryName;
            document.querySelector('#categories').appendChild(clone.querySelector('.category'));

            const beverages = json[category]['menu'];
            Object.keys(beverages).forEach(id => {
                const beverage = beverages[id];
                const name = beverage['name'];

                const template = document.querySelector('#beverage-template');
                const clone = template.content.cloneNode(true);
                clone.querySelector('button').dataset.id = id;
                clone.querySelector('button').addEventListener('click', e => {
                    e.preventDefault();
                    getBeverageInfo(e.target);
                });
                clone.querySelector('h3').textContent = name;
                if (!beverage['isLimitation']) {
                    clone.querySelector('.limited').classList.add('dnone');
                }
                beverage['heat'].sort();
                beverage['heat'].forEach(heat => {
                    const span = document.createElement('span');
                    span.classList.add(heat);
                    span.textContent = heat.toUpperCase();
                    clone.querySelector('.heats').appendChild(span);
                });
                document.querySelector(`#${category} > .beverages`).appendChild(clone.querySelector('.beverage'));

                Object.keys(beverage['size']).forEach(sizeName => {
                    const template = document.querySelector('#size-template');
                    const clone = template.content.cloneNode(true);
                    clone.querySelector('.size-name').textContent = sizeName;
                    clone.querySelector('.price').textContent = beverage['size'][sizeName];
                    document.querySelector(`[data-id="${id}"] > .sizes`).appendChild(clone.querySelector('.size'));
                });
            });
        });
    }

    /**
     * 
     */
    function afterGetCustom() {
        Object.keys(customs['change']).forEach(customName => {
            const custom = customs['change'][customName];
            const id = `change-${customName}`;

            const template = document.querySelector('#change-template');
            const clone = template.content.cloneNode(true);
            clone.querySelector('li').dataset.custom = customName;
            clone.querySelector('[type="checkbox"]').id = id;
            clone.querySelector('label').setAttribute('for', id);
            clone.querySelector('.custom-name').textContent = custom['ja'];
            document.querySelector('[data-type="change"]').appendChild(clone.querySelector('li'));

            Object.keys(custom['custom']).forEach(customTypeName => {
                const customType = custom['custom'][customTypeName];

                const template = document.querySelector('#change-custom-template');
                const clone = template.content.cloneNode(true);
                clone.querySelector('[type="radio"]').setAttribute('name', id);
                clone.querySelector('[type="radio"]').id = `${id}-${customTypeName}`;
                clone.querySelector('[type="radio"]').addEventListener('change', e => {
                    changeChange(e.target);
                    changeSpelling();
                });
                clone.querySelector('label').setAttribute('for', `${id}-${customTypeName}`);
                clone.querySelector('label').textContent = customType['ja'];
                document.querySelector(`[data-type="change"] > [data-custom="${customName}"] > ul`).appendChild(clone.querySelector('li'));
            });
        });

        Object.keys(customs['add']).forEach(customName => {
            const custom = customs['add'][customName];
            const id = `add-${customName}`;

            const template = document.querySelector('#add-template');
            const clone = template.content.cloneNode(true);
            clone.querySelector('li').dataset.custom = customName;
            clone.querySelector('[type="checkbox"]').id = id;
            clone.querySelector('[type="checkbox"]').addEventListener('change', () => {
                changeSpelling();
            });
            clone.querySelector('label').setAttribute('for', id);
            clone.querySelector('.custom-name').textContent = custom['ja'];
            if (custom['type'] !== undefined && custom['type'] === 'change') {
                clone.querySelector('.add-type').textContent = '変更';
            }
            clone.querySelector('.price').textContent = custom['price'];
            document.querySelector('[data-type="add"]').appendChild(clone.querySelector('li'));
        });

        Object.keys(customs['condiment']).forEach(customName => {
            const custom = customs['condiment'][customName];
            const id = `condiment-${customName}`;

            const template = document.querySelector('#condiment-template');
            const clone = template.content.cloneNode(true);
            clone.querySelector('li').dataset.custom = customName;
            clone.querySelector('[type="checkbox"]').id = id;
            clone.querySelector('[type="checkbox"]').addEventListener('change', () => {
                changeSpelling();
            });
            clone.querySelector('label').setAttribute('for', id);
            clone.querySelector('.custom-name').textContent = custom['ja'];
            document.querySelector('[data-type="condiment"]').appendChild(clone.querySelector('li'));
        });
        resetCustom();
    }

    //
    fetchGet('./data/beverage.json', json => {
        // console.log(json);
        beverages = json;

        fetchGet('./data/custom.json', json => {
            // console.log(json);
            customs = json;

            fetchGet('./data/beverage_has_custom.json', json => {
                // console.log(json);
                beverageHasCustoms = json;

                afterGetBeverage();
                afterGetCustom();
                setDirect();
            }, error => {
                console.error(error);
            });
        }, error => {
            console.error(error);
        });
    }, error => {
        console.error(error);
    });

    /**
     * 
     * @param {*} elem 
     */
    function getBeverageInfo(elem) {
        if (elem.dataset.id === undefined) {
            elem = elem.closest('button');
        }
        const id = elem.dataset.id;
        // console.log(id);
        const category = elem.closest('.category').id;
        const customInterval = setInterval(() => {
            if (customs !== undefined) {
                clearInterval(customInterval);
                const beverageHasCustomsInterval = setInterval(() => {
                    if (beverageHasCustoms !== undefined) {
                        clearInterval(beverageHasCustomsInterval);
                        showBeverageInfo(category, id);
                    }
                }, 1);
            }
        }, 1);
    }

    /**
     * 
     * @param {*} category 
     * @param {*} id 
     */
    function showBeverageInfo(category, id) {
        beverageId = id;
        resetCustom();
        const beverage = beverages[category]['menu'][id];
        const customizes = beverageHasCustoms[id];

        document.querySelector('#detail > h2').textContent = beverage['name'];
        if (beverage['isLimination']) {
            document.querySelector('#detail > .limited').classList.remove('dnone');
        } else {
            document.querySelector('#detail > .limited').classList.add('dnone');
        }

        const heats = document.querySelector('#detail > .heats');
        heats.textContent = null;
        beverage['heat'].sort();
        beverage['heat'].forEach(heat => {
            const template = document.querySelector('#detail-heat-template');
            const clone = template.content.cloneNode(true);
            clone.querySelector('li').classList.add(heat);
            clone.querySelector('[type="radio"]').id = heat;
            clone.querySelector('[type="radio"]').addEventListener('change', () => {
                changeHeat();
                changeSpelling();
            });
            clone.querySelector('label').setAttribute('for', heat);
            clone.querySelector('label').textContent = heat.toUpperCase();
            heats.appendChild(clone.querySelector('li'));
        });
        document.querySelector('#detail [name="heats"]')['checked'] = true;

        const sizes = document.querySelector('#detail > .sizes');
        sizes.textContent = null;
        Object.keys(beverage['size']).forEach(sizeName => {
            const template = document.querySelector('#detail-size-template');
            const clone = template.content.cloneNode(true);
            clone.querySelector('[name="sizes"]').id = sizeName;
            clone.querySelector('[name="sizes"]').addEventListener('change', () => {
                changeSpelling();
            });
            clone.querySelector('label').setAttribute('for', sizeName);
            clone.querySelector('.size-name').textContent = sizeName;
            clone.querySelector('.price').textContent = beverage['size'][sizeName];
            sizes.appendChild(clone.querySelector('li'));
        });
        if (document.querySelector('#detail #Tall') !== null) {
            document.querySelector('#detail #Tall')["checked"] = true;
        } else if (document.querySelector('#detail [name="sizes"]') !== null) {
            document.querySelector('#detail [name="sizes"]')['checked'] = true;
        }

        document.querySelectorAll('[data-type="change"] [data-custom], [data-type="add"] [data-custom]').forEach(elem => {
            elem.classList.add('dnone');
        });
        if (customizes === undefined) {
            alert('可能なカスタマイズ項目が設定されていません。');
            return;
        }
        Object.keys(customizes).forEach(typeName => {
            customizes[typeName].forEach(customName => {
                document.querySelector(`[data-type="${typeName}"] > [data-custom="${customName}"]`).classList.remove('dnone');
            });
        });

        changeHeat();

        document.querySelector('#detail-check')['checked'] = true;
    }

    /**
     * 
     */
    function changeHeat() {
        const id = document.querySelector('#detail [name="heats"]:checked').id;

        document.querySelectorAll('[data-type="change"] [data-custom]').forEach(elem => {
            elem.classList.add('dnone');
        });
        const customizes = beverageHasCustoms[beverageId]['change'];
        if (customizes !== null) {
            customizes.forEach(customName => {
                document.querySelector(`[data-type="change"] > [data-custom="${customName}"]`).classList.remove('dnone');
            });
        }
        if (id === 'hot') {
            document.querySelector('[data-type="change"] > [data-custom="ice"]').classList.add('dnone');
            document.querySelector('[data-type="change"] > [data-custom="ice_milk"]').classList.add('dnone');
            document.querySelector('#change-ice_milk-full')['checked'] = true;
        } else {
            document.querySelector('[data-type="change"] > [data-custom="heat"]').classList.add('dnone');
            document.querySelector('[data-type="change"] > [data-custom="ice_milk"]').classList.add('dnone');
        }
    }

    /**
     * 
     */
    function resetCustom() {
        document.querySelector('#detail > .limited').classList.remove('dnone');
        document.querySelectorAll('[data-type="change"] ul > li > [type="radio"][id$="full"]').forEach(elem => {
            elem['checked'] = true;
            changeChange(elem);
        });
        document.querySelectorAll('[data-type="add"] [type="checkbox"], [data-type="condiment"] [type="checkbox"]').forEach(elem => {
            elem['checked'] = false;
        });
    }

    /**
     * 
     * @param {*} elem 
     */
    function changeChange(elem) {
        const id = elem.id;
        const text = document.querySelector(`[for="${id}"]`).textContent;
        elem.closest('[data-custom]').querySelector('.selected').textContent = text;

        if (document.querySelector('#change-ice-light:checked') !== null) {
            document.querySelector('[data-type="change"] > [data-custom="ice_milk"]').classList.remove('dnone');
        } else {
            document.querySelector('[data-type="change"] > [data-custom="ice_milk"]').classList.add('dnone');
            document.querySelector('#change-ice_milk-full')['checked'] = true;
        }
    }

    //
    document.querySelector('#spelling-knob').addEventListener('change', () => {
        const spellingHeight = document.querySelector('#spelling').offsetHeight;
        document.querySelector('#detail').style.paddingBottom = `${spellingHeight}px`;
    });

    /**
     * 
     * @param {*} id 
     */
    function getCategory(paramId) {
        let category = null;
        Object.keys(beverages).forEach(categoryName => {
            Object.keys(beverages[categoryName]['menu']).forEach(id => {
                if (id !== paramId) {
                    return;
                }
                category = categoryName;
            });
        });
        return category;
    }

    /**
     * 
     */
    function setDirect() {
        // console.log(getParam);
        const paramId = getParam['id'];
        if (paramId === undefined) {
            return;
        }
        let category = getCategory(paramId);
        if (category === null) {
            return;
        }
        showBeverageInfo(category, paramId);

        // HOT/ICED
        const paramHeat = getParam['heat'];
        if (paramHeat !== undefined) {
            const radio = document.querySelector(`#${paramHeat}`);
            if (radio !== null) {
                radio['checked'] = true;
            }
            changeHeat();
        }

        // サイズ
        const paramSize = getParam['size'];
        if (paramSize !== undefined) {
            const radio = document.querySelector(`#${paramSize}`);
            if (radio !== null) {
                radio['checked'] = true;
            }
        }

        // 無料カスタム
        const paramChange = getParam['change'];
        if (paramChange !== undefined) {
            const changes = JSON.parse(paramChange);
            // console.log(changes);
            Object.keys(changes).forEach(customName => {
                const li = document.querySelector(`[data-type="change"] > [data-custom="${customName}"]`);
                if (li === null) {
                    return;
                }
                const radio = document.querySelector(`:not(.dnone) #change-${customName}-${changes[customName]}`);
                if (radio !== null) {
                    radio['checked'] = true;
                    changeChange(radio);
                }
            });
        }

        // 有料カスタム
        const paramAdd = getParam['add'];
        if (paramAdd !== undefined) {
            const adds = JSON.parse(paramAdd);
            adds.forEach(customName => {
                const li = document.querySelector(`[data-type="add"] > [data-custom="${customName}"]`);
                if (li === null) {
                    return;
                }
                const chackbox = document.querySelector(`:not(.dnone) #add-${customName}`);
                if (chackbox !== null) {
                    chackbox['checked'] = true;
                }
            });
        }

        // コンディメントバー
        const paramCondiment = getParam['condiment'];
        if (paramCondiment !== undefined) {
            const condiments = JSON.parse(paramCondiment);
            condiments.forEach(customName => {
                const li = document.querySelector(`[data-type="condiment"] > [data-custom="${customName}"]`);
                if (li === null) {
                    return;
                }
                const chackbox = document.querySelector(`:not(.dnone) #condiment-${customName}`);
                if (chackbox !== null) {
                    chackbox['checked'] = true;
                }
            });
        }

        changeSpelling();
    }

    /**
     * 
     */
    function changeSpelling() {
        category = '';
        size = '';
        heat = '';
        change = {};
        add = [];
        condiment = [];

        category = getCategory(beverageId);
        size = document.querySelector('[name="sizes"]:checked').id;
        heat = document.querySelector('[name="heats"]:checked').id;

        // 注文内容
        const sizeJa = japanese[size];
        const heatJa = japanese[heat];
        const beverageName = beverages[category]['menu'][beverageId]['name'].replace(' ', '');
        const orderBase = `${sizeJa} ${heatJa} ${beverageName}`;
        // console.log(orderBase);

        let orderJa = orderBase;
        let orderSpel = orderBase;
        document.querySelectorAll('[data-type="change"] > li:not(.dnone) [type="radio"]:not([id$="full"]):checked').forEach(elem => {
            const elemIds = elem.id.split('-');
            // console.log(elemIds);
            change[elemIds[1]] = elemIds[2];
            const changeSelection = customs['change'][elemIds[1]];
            const changeJa = `${changeSelection['ja']}を${changeSelection['custom'][elemIds[2]]['ja']}に変更`;
            orderJa += ` ${changeJa}`;
            const changeSpel = `${changeSelection['custom'][elemIds[2]]['spel']}${changeSelection['spel']}`;
            orderSpel += ` ${changeSpel}`;
        });

        document.querySelectorAll('[data-type="add"] > li:not(.dnone) [type="checkbox"]:checked').forEach(elem => {
            const elemId = elem.id.split('-')[1];
            // console.log(elemId);
            add.push(elemId);
            const addSelection = customs['add'][elemId];
            const addType = addSelection['type'] === 'change' ? 'に変更' : 'を追加';
            const addJa = `${addSelection['ja']}${addType}`;
            orderJa += ` ${addJa}`;
            const addSpel = `アド${addSelection['spel']}`;
            orderSpel += ` ${addSpel}`;
        });

        document.querySelector('#ja').textContent = orderJa;
        document.querySelector('#spel').textContent = orderSpel;

        let condimentJas = [];
        document.querySelectorAll('[data-type="condiment"] > li:not(.dnone) [type="checkbox"]:checked').forEach(elem => {
            const elemId = elem.id.split('-')[1];
            condiment.push(elemId);
            const condimentSelection = customs['condiment'][elemId];
            condimentJas.push(`${condimentSelection['ja']}追加`);
        });
        document.querySelector('#condiment').textContent = condimentJas.join(' ');

        // 金額
        const sizePrice = beverages[category]['menu'][beverageId]['size'][size];

        let customPrice = 0;
        document.querySelectorAll('[data-type="add"] > li:not(.dnone) > [type="checkbox"]:checked').forEach(elem => {
            const customName = elem.id.match(/^add-(\S+)$/)[1];
            customPrice += customs['add'][customName]['price'];
        });

        document.querySelector('#spelling .price').textContent = sizePrice + customPrice;

        // パディング変更
        const spellingHeight = document.querySelector('#spelling').offsetHeight;
        document.querySelector('#detail').style.paddingBottom = `${spellingHeight}px`;

        changeUrl();
    }

    function changeUrl() {
        if (location.search.length === 0) {
            history.pushState(null, null, '/apps/starbucks-customizer/');
        }
        let searches = [];
        searches.push(`id=${beverageId}`);
        searches.push(`heat=${heat}`);
        searches.push(`size=${size}`);
        const changeParam = JSON.stringify(change);
        searches.push(`change=${changeParam}`);
        const addParam = JSON.stringify(add);
        searches.push(`add=${addParam}`);
        const condimentParam = JSON.stringify(condiment);
        searches.push(`condiment=${condimentParam}`);
        const search = searches.join('&');
        history.replaceState(null, null, `/apps/starbucks-customizer/?${search}`);
    }
});