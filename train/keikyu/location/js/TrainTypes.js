class TrainTypes {
    #trainTypes = [];

    #trainTypeIdMap = {};

    async setTrainTypes() {
        const response = await fetch('./json/train_types.json');
        const json = await response.json();
        // console.log(json);
        json.forEach(trainType => {
            this.#trainTypes.push(new TrainType(trainType));
        });
        Object.keys(this.#trainTypes).forEach(key => {
            const i = Number(key);
            this.#trainTypeIdMap[this.#trainTypes[i].id] = i;
        });

        return this;
    }

    getTrainType(id) {
        id = `${id}`;
        if (!Object.keys(this.#trainTypeIdMap).includes(id)) {
            return null;
        }
        return this.#trainTypes[this.#trainTypeIdMap[id]];
    }
}
export default TrainTypes;

class TrainType {
    #id = null;
    #isOutOfService = false;
    #typeName = null;
    #abbreviation = null;
    #color = null;

    constructor(trainType) {
        // console.log(trainType);
        this.#id = trainType['id'];
        this.#isOutOfService = trainType['is_out_of_service'];
        this.#typeName = trainType['type_name'];
        this.#abbreviation = trainType['abbreviation'];
        this.#color = trainType['color'];
    }

    get id() {
        return this.#id;
    }

    get typeName() {
        return this.#typeName;
    }

    get abbreviation() {
        return this.#abbreviation;
    }
}