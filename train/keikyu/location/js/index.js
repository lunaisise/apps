import TrainTypes from "./TrainTypes.js";

window.addEventListener('DOMContentLoaded', async () => {
    const jsonUrl = 'https://tid.keikyu.co.jp/data/local/zaisen.json';

    // 列車種別クラス初期化
    const trainTypes = await (async () => {
        const trainTypes = new TrainTypes();
        await trainTypes.setTrainTypes();
        return trainTypes;
    })();

    async function getZaisen() {
        const response = await fetch(jsonUrl);
        const json = await response.json();
        return json;
    }

    async function showDatetime(dt) {
        const reloadTimeText = `${dt['yy']}-${dt['mt']}-${dt['dy']} ${dt['hh']}:${dt['mm']}:${dt['ss']}`;
        document.querySelector('#up-time').textContent = reloadTimeText;
        console.log(reloadTimeText);
    }

    async function showKNTrain(stations) {
        stations.forEach(station => {
            const id = station['id'];
            const stationNumber = Number(id.substr(-2));
            const stationElem = document.querySelector(`[data-station="${stationNumber}"] > .station > .tracks`);
            station['tr'].forEach(tr => {
                const {bs, sy, hk} = tr;
                let trackElem = stationElem.querySelector(`[data-track="${bs}"]`);
                if (id === 'E8050') {
                    trackElem = document.querySelector('[data-station="51"] > .gap > .tracks .up-1')
                }
                if (trackElem === null) {
                    console.log(station);
                    return;
                }
                const span = document.createElement('span');
                span.dataset.type = sy;
                span.dataset.direction = hk;
                span.textContent = trainTypes.getTrainType(sy).abbreviation;
                trackElem.appendChild(span);
            });
        });
    }

    function getStationTrack(id) {
        let stationNumber = Number(id.substr(-2));
        let trackNumber = null;
        const type = id.substr(0, 1);
        switch (type) {
            case 'B':
                if (stationNumber === 33 || stationNumber === 49) {
                    stationNumber++;
                    trackNumber = 'up-2';
                }
                break;
            case 'D':
                trackNumber = 'down-1';
                break;
            case 'U':
                stationNumber++;
                if (stationNumber === 12) {
                    stationNumber = 18;
                }
                if (stationNumber === 21) {
                    stationNumber = 27;
                }
                if (stationNumber === 51) {
                    stationNumber = 54;
                }
                if (stationNumber === 65) {
                    stationNumber = 62;
                }
                trackNumber = 'up-1';
                break;
            case 'S':
                stationNumber++;
                trackNumber = 'up-1';
                break;
            case 'N':
                trackNumber = 'down-1';
                if (stationNumber === 50) {
                    trackNumber = 'down-2';
                }
                break;
        }
        return {stationNumber, trackNumber};
    }

    async function showEKTrain(stations) {
        stations.forEach(station => {
            let id = station['id'];
            const {stationNumber, trackNumber} = getStationTrack(id);
            const gapElem = document.querySelector(`[data-station="${stationNumber}"] > .gap > .tracks`);
            const trs = trackNumber.match(/^down/) ? station['tr'].reverse() : station['tr'];
            trs.forEach(tr => {
                const {bs, sy, hk} = tr;
                if (Number(bs) !== 0) {
                    console.log(station);
                    return;
                }
                const trackElem = gapElem.querySelector(`.${trackNumber}`);
                const span = document.createElement('span');
                span.dataset.type = sy;
                span.dataset.direction = hk;
                span.textContent = trainTypes.getTrainType(sy).abbreviation;
                trackElem.appendChild(span);
            });
        });
    }

    async function reloadZaisen() {
        const json = await getZaisen();
        document.querySelectorAll('.tracks > ul > li').forEach(li => {
            li.textContent = '';
        });
        showDatetime(json['UP'][0]['dt'][0]);
        if (Object.keys(json).includes('KN')) {
            showKNTrain(json['KN']);
        }
        if (Object.keys(json).includes('EK')) {
            showEKTrain(json['EK']);
        }
    }

    function init() {
        document.querySelectorAll('details').forEach(elem => {
            elem.open = true;
        });
        reloadZaisen();
    }
    init();

    setInterval(() => {
        reloadZaisen();
    }, 20 * 1000);
});