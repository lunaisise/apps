function Heats() {
    const heats = [];
    const heatsMap = {};

    this.setHeats = json => {
        Object.keys(json).forEach(key => {
            heats.push(new Heat(json[key]));
        });
        Object.keys(heats).forEach(i => {
            heatsMap[heats[i].heatId] = i;
        });
    }

    this.getHeat = heatId => {
        return heats[heatsMap[`${heatId}`]];
    }
}

function Heat(heat) {
    const heatId = heat['heat_id'];
    const heatName = heat['heat_name'];
    const heatNameJa = heat['heat_name_ja'];
    const hasCustomTypeIds = heat['has_custom_type_ids'];
    const hasNotCustomTypeIds = heat['has_not_custom_type_ids'];

    Object.defineProperty(this, 'heatId', {
        get: () => {
            return heatId;
        }
    });

    Object.defineProperty(this, 'heatName', {
        get: () => {
            return heatName;
        }
    });

    Object.defineProperty(this, 'heatNameJa', {
        get: () => {
            return heatNameJa;
        }
    });

    Object.defineProperty(this, 'hasCustomTypeIds', {
        get: () => {
            return hasCustomTypeIds;
        }
    });

    Object.defineProperty(this, 'hasNotCustomTypeIds', {
        get: () => {
            return hasNotCustomTypeIds;
        }
    });
}

function Sizes() {
    const sizes = [];
    const sizesMap = {};

    this.setSizes = json => {
        Object.keys(json).forEach(key => {
            sizes.push(new Size(json[key]));
        });
        Object.keys(sizes).forEach(i => {
            sizesMap[sizes[i].sizeId] = i;
        });
    }

    this.getSize = sizeId => {
        return sizes[sizesMap[`${sizeId}`]];
    }
}

function Size(size) {
    const sizeId = size['size_id'];
    const sizeName = size['size_name'];
    const sizeNameJa = size['size_name_ja'];

    Object.defineProperty(this, 'sizeId', {
        get: () => {
            return sizeId;
        }
    });

    Object.defineProperty(this, 'sizeName', {
        get: () => {
            return sizeName;
        }
    });

    Object.defineProperty(this, 'sizeNameJa', {
        get: () => {
            return sizeNameJa;
        }
    });
}

function CustomTypes() {
    const customTypes = [];
    const customTypesMap = {};
    let discords = {};

    this.setCustomTypes = json => {
        Object.keys(json).forEach(key => {
            customTypes.push(new CustomType(json[key]));
        });
        const discordsTmp = [];
        Object.keys(customTypes).forEach(i => {
            customTypesMap[customTypes[i].customTypeId] = i;
            customTypes[i].customs.forEach(custom => {
                custom.discords.forEach(discordId => {
                    discordsTmp.push(discordId);
                });
            });
        });
        discords = discordsTmp.filter((x, i, self) => {
            return self.indexOf(x) === i;
        });
    }

    this.setDrinkHasCustoms = drinkHasCustom => {
        Object.keys(drinkHasCustom).forEach(customCombinationId => {
            const combination = this.getCombination(drinkHasCustom[customCombinationId]['custom_combination_id']);
            const custom = this.getCustomType(combination.customTypeId).getCustom(combination.customId);
            custom.setDrinkHasCustoms(drinkHasCustom[customCombinationId]);
        });
    }

    this.getCustomType = customTypeId => {
        return customTypes[customTypesMap[`${customTypeId}`]];
    }

    this.getCombination = customCombinationId => {
        for (let i in this.customTypes) {
            const customType = customTypes[i];
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

    Object.defineProperty(this, 'customTypes', {
        get: () => {
            return customTypes;
        }
    });

    Object.defineProperty(this, 'discords', {
        get: () => {
            return discords;
        }
    });
}

function CustomType(customType) {
    const customTypeId = customType['custom_type_id'];
    const customTypeKey = customType['custom_type_key'];
    const customTypeName = customType['custom_type_name'];
    const customTypeSpel = customType['custom_type_spel'];

    const customs = [];
    const customsMap = {};
    const customCombinationMap = {};
    let defaultCustomNum = -1;

    Object.keys(customType['customs']).forEach(key => {
        customs.push(new Custom(customType['customs'][key]));
    });
    Object.keys(customs).forEach(i => {
        const custom = customs[i];
        customsMap[custom.customId] = i;
        customCombinationMap[custom.customCombinationId] = i;
        if (custom.isDefault) {
            defaultCustomNum = i;
        }
    });

    this.getCustom = customId => {
        return customs[customsMap[`${customId}`]];
    }

    this.getCombination = customCombinationId => {
        return customs[customCombinationMap[`${customCombinationId}`]];
    }

    this.getDetaultCustom = () => {
        if (defaultCustomNum === -1) {
            return null;
        }
        return customs[defaultCustomNum];
    }

    Object.defineProperty(this, 'customTypeId', {
        get: () => {
            return customTypeId;
        }
    });

    Object.defineProperty(this, 'customTypeKey', {
        get: () => {
            return customTypeKey;
        }
    });

    Object.defineProperty(this, 'customTypeName', {
        get: () => {
            return customTypeName;
        }
    });

    Object.defineProperty(this, 'customTypeSpel', {
        get: () => {
            return customTypeSpel;
        }
    });

    Object.defineProperty(this, 'customs', {
        get: () => {
            return customs;
        }
    });
}

function Custom(custom) {
    const customId = custom['custom_id'];
    const customCombinationId = custom['custom_combination_id'];
    const customKey = custom['custom_key'];
    const customName = custom['custom_name'];
    const customSpel = custom['custom_spel'];
    const isDefault = custom['is_default'];
    const price = custom['price'];
    const friends = custom['friends'];
    const discords = custom['discords'];
    let isChange = false;
    let isFree = false;

    this.setDrinkHasCustoms = drinkHasCustom => {
        isChange = drinkHasCustom['is_change'];
        isFree = drinkHasCustom['is_free'];
    }

    Object.defineProperty(this, 'customId', {
        get: () => {
            return customId;
        }
    });

    Object.defineProperty(this, 'customCombinationId', {
        get: () => {
            return customCombinationId;
        }
    });

    Object.defineProperty(this, 'customKey', {
        get: () => {
            return customKey;
        }
    });

    Object.defineProperty(this, 'customName', {
        get: () => {
            return customName;
        }
    });

    Object.defineProperty(this, 'customSpel', {
        get: () => {
            return customSpel;
        }
    });

    Object.defineProperty(this, 'isDefault', {
        get: () => {
            return isDefault;
        }
    });

    Object.defineProperty(this, 'price', {
        get: () => {
            return price;
        }
    });

    Object.defineProperty(this, 'friends', {
        get: () => {
            return friends;
        }
    });

    Object.defineProperty(this, 'discords', {
        get: () => {
            return discords;
        }
    });

    Object.defineProperty(this, 'isChange', {
        get: () => {
            return isChange;
        }
    });

    Object.defineProperty(this, 'isFree', {
        get: () => {
            return isFree;
        }
    });
}