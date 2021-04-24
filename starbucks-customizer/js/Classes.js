class Heats {
    #heats = [];

    #heatsMap = {};

    setHeats(json) {
        // console.log(json);
        Object.keys(json).forEach(key => {
            this.#heats.push(new Heat(json[key]));
        });
        Object.keys(this.#heats).forEach(i => {
            this.#heatsMap[this.#heats[i].heatId] = i;
        });
        return this;
    }

    getHeat(heatId) {
        return this.#heats[this.#heatsMap[`${heatId}`]];
    }
}

class Heat {
    #heatId;
    #heatName;
    #heatNameJa;
    #hasCustomTypeIds = [];
    #hasNotCustomTypeIds = [];

    constructor(heat) {
        this.#heatId = heat['heat_id'];
        this.#heatName = heat['heat_name'];
        this.#heatNameJa = heat['heat_name_ja'];
        this.#hasCustomTypeIds = heat['has_custom_type_ids'];
        this.#hasNotCustomTypeIds = heat['has_not_custom_type_ids'];
        return this;
    }

    get heatId() {
        return this.#heatId;
    }

    get heatName() {
        return this.#heatName;
    }

    get heatNameJa() {
        return this.#heatNameJa;
    }

    get hasCustomTypeIds() {
        return this.#hasCustomTypeIds;
    }

    get hasNotCustomTypeIds() {
        return this.#hasNotCustomTypeIds;
    }
}

class Sizes {
    #sizes = [];

    #sizesMap = {};

    setSizes(json) {
        // console.log(json);
        Object.keys(json).forEach(key => {
            this.#sizes.push(new Size(json[key]));
        });
        Object.keys(this.#sizes).forEach(i => {
            this.#sizesMap[this.#sizes[i].sizeId] = i;
        });
        return this;
    }

    getSize(sizeId) {
        return this.#sizes[this.#sizesMap[`${sizeId}`]];
    }
}

class Size {
    #sizeId;
    #sizeName;
    #sizeNameJa;

    constructor(size) {
        // console.log(size);
        this.#sizeId = size['size_id'];
        this.#sizeName = size['size_name'];
        this.#sizeNameJa = size['size_name_ja'];
        return this;
    }

    get sizeId() {
        return this.#sizeId;
    }

    get sizeName() {
        return this.#sizeName;
    }

    get sizeNameJa() {
        return this.#sizeNameJa;
    }
}

class CustomTypes {
    #customTypes = [];
    #discords = [];

    #customTypesMap = {};

    setCustomTypes(json) {
        // console.log(json);
        Object.keys(json).forEach(key => {
            this.#customTypes.push(new CustomType(json[key]));
        });
        const discords = [];
        Object.keys(this.#customTypes).forEach(i => {
            this.#customTypesMap[this.#customTypes[i].customTypeId] = i;
            this.#customTypes[i].customs.forEach(custom => {
                custom.discords.forEach(discordId => {
                    discords.push(discordId);
                });
            });
        });
        this.#discords = discords.filter((x, i, self) => {
            return self.indexOf(x) === i;
        });
        return this;
    }

    setDrinkHasCustoms(drinkHasCustom) {
        Object.keys(drinkHasCustom).forEach(customCombinationId => {
            const combination = this.getCombination(drinkHasCustom[customCombinationId]['custom_combination_id']);
            const custom = this.getCustomType(combination.customTypeId).getCustom(combination.customId);
            custom.setDrinkHasCustoms(drinkHasCustom[customCombinationId]);
        });
    }

    getCustomType(customTypeId) {
        return this.#customTypes[this.#customTypesMap[`${customTypeId}`]];
    }

    getCombination(customCombinationId) {
        for (let i in this.#customTypes) {
            const customType = this.#customTypes[i];
            for (let j in customType['customs']) {
                const custom = customType['customs'][j];
                if (`${custom.customCombinationId}` === `${customCombinationId}`) {
                    return {
                        customTypeId: customType.customTypeId,
                        customId: custom.customId
                    };
                }
            }
        }
    }

    get customTypes() {
        return this.#customTypes;
    }

    get discords() {
        return this.#discords;
    }
}

class CustomType {
    #customTypeId;
    #customTypeKey;
    #customTypeName;
    #customTypeSpel;
    #customs = [];

    #defaultCustomNum = -1;

    #customsMap = {};
    #customCombinationMap = {};

    constructor(customType) {
        // console.log(customType);
        this.#customTypeId = customType['custom_type_id'];
        this.#customTypeKey = customType['custom_type_key'];
        this.#customTypeName = customType['custom_type_name'];
        this.#customTypeSpel = customType['custom_type_spel'];
        Object.keys(customType['customs']).forEach(key => {
            this.#customs.push(new Custom(customType['customs'][key]));
        });
        Object.keys(this.#customs).forEach(i => {
            const custom = this.#customs[i];
            this.#customsMap[custom.customId] = i;
            this.#customCombinationMap[custom.customCombinationId] = i;
            if (custom.isDefault) {
                this.#defaultCustomNum = i;
            }
        });
        return this;
    }

    getCustom(customId) {
        return this.#customs[this.#customsMap[`${customId}`]];
    }

    getCombination(customCombinationId) {
        return this.#customs[this.#customCombinationMap[`${customCombinationId}`]];
    }

    getDetaultCustom() {
        if (this.#defaultCustomNum === -1) {
            return null;
        }
        return this.#customs[this.#defaultCustomNum];
    }

    get customTypeId() {
        return this.#customTypeId;
    }

    get customTypeKey() {
        return this.#customTypeKey;
    }

    get customTypeName() {
        return this.#customTypeName;
    }

    get customTypeSpel() {
        return this.#customTypeSpel;
    }

    get customs() {
        return this.#customs;
    }
}

class Custom {
    #customId;
    #customCombinationId;
    #customKey;
    #customName;
    #customSpel;
    #isDefault;
    #price;
    #friends;
    #discords;

    #isChange = false;
    #isFree = false;

    constructor(custom) {
        // console.log(custom);
        this.#customId = custom['custom_id'];
        this.#customCombinationId = custom['custom_combination_id'];
        this.#customKey = custom['custom_key'];
        this.#customName = custom['custom_name'];
        this.#customSpel = custom['custom_spel'];
        this.#isDefault = custom['is_default'];
        this.#price = custom['price'];
        this.#friends = custom['friends'];
        this.#discords = custom['discords'];
        return this;
    }

    setDrinkHasCustoms(drinkHasCustom) {
        this.#isChange = drinkHasCustom['is_change'];
        this.#isFree = drinkHasCustom['is_free'];
    }

    get customId() {
        return this.#customId;
    }

    get customCombinationId() {
        return this.#customCombinationId;
    }

    get customKey() {
        return this.#customKey;
    }

    get customName() {
        return this.#customName;
    }

    get customSpel() {
        return this.#customSpel;
    }

    get isDefault() {
        return this.#isDefault;
    }

    get price() {
        return this.#price;
    }

    get friends() {
        return this.#friends;
    }

    get discords() {
        return this.#discords;
    }

    get isChange() {
        return this.#isChange;
    }

    get isFree() {
        return this.#isFree;
    }
}