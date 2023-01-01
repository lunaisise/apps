window.addEventListener('DOMContentLoaded', () => {
    const storageKey = 'odometer';
    /**
     * @type {{d: String, o: Number}[]}
     */
    const odometers = (() => {
        const storageValue = localStorage.getItem(storageKey);
        const odometers = JSON.parse(storageValue) ?? [];
        odometers.sort((a, b) => {
            const aDate = new Date(a.d);
            const bDate = new Date(b.d);
            return aDate - bDate;
        });
        return odometers;
    })();

    /**
     * @type {HTMLDialogElement}
     */
    const newDialog = document.getElementById('new-dialog');
    /**
     * @type {HTMLInputElement}
     */
    const dateElem = document.getElementById('date');
    /**
     * @type {HTMLInputElement}
     */
    const distanceElem = document.getElementById('distance');
    /**
     * @type {HTMLDialogElement}
     */
    const editDialog = document.getElementById('edit-dialog');
    /**
     * @type {HTMLFormElement}
     */
    const editOdometer = document.getElementById('edit-odometer');
    /**
     * @type {HTMLInputElement}
     */
    const editDateElem = document.getElementById('edit-date');
    /**
     * @type {HTMLInputElement}
     */
    const editDistanceElem = document.getElementById('edit-distance');
    /**
     * @type {HTMLTemplateElement}
     */
    const odometerTemplate = document.getElementById('odometer-template');

    /**
     * セパレーターで区切った日付を返却
     * @param {Date} targetDate Dateオブジェクト
     * @param {String} separator セパレーター
     * @returns セパレーターで区切った日付
     */
    function toSeparatedDate(targetDate, separator = '-') {
        const year = targetDate.getFullYear();
        const month = `${targetDate.getMonth() + 1}`.padStart(2, '0');
        const date = `${targetDate.getDate()}`.padStart(2, '0');
        return `${year}${separator}${month}${separator}${date}`;
    }

    /**
     * localStorageへ入れ込み
     */
    function setStorage() {
        odometers.sort((a, b) => {
            const aDate = new Date(a.d);
            const bDate = new Date(b.d);
            return aDate - bDate;
        });
        const storageValue = JSON.stringify(odometers);
        localStorage.setItem(storageKey, storageValue);
    }

    /**
     * 走行距離履歴を表示
     */
    function showOdometers() {
        const odometersElem = document.getElementById('odometers');
        odometersElem.textContent = '';

        let diff = 0;
        odometers.forEach(odometer => {
            /**
             * @type {HTMLLIElement}
             */
            const clone = odometerTemplate.content.cloneNode(true);
            const date = odometer.d;
            const distance = odometer.o;
            clone.querySelector('li').id = date;
            clone.querySelector('[data-id="odometer"]').addEventListener('click', () => {
                editOdometer.dataset.date = date;
                editDateElem.value = date;
                editDistanceElem.value = distance;
                editDialog.showModal();
            });
            clone.querySelector('[data-id="date"]').textContent = toSeparatedDate((new Date(date)), '/');
            clone.querySelector('[data-id="difference"]').textContent = distance - diff;
            clone.querySelector('[data-id="distance"]').textContent = distance;

            odometersElem.appendChild(clone);

            diff = distance;
        });
    }

    /**
     * 対象日付のデータを削除
     * @param {String} date 対象日付
     */
    function deleteOdometer(date) {
        const odometersTemp = odometers.filter(odometer => odometer.d !== date);
        odometers.length = 0;
        odometersTemp.forEach(odometer => odometers.push(odometer));

        setStorage();

        showOdometers();
    }

    (() => {
        showOdometers();
        const now = new Date();
        const today = toSeparatedDate(now);
        dateElem.value = today;

        if (odometers.length === 0) {
            newDialog.showModal();
        }
    })();

    document.getElementById('csv-download').addEventListener('click', () => {
        const rows = [];
        rows.push(['date', 'odometer'].join(','));
        odometers.forEach(odometer => rows.push([odometer.d, odometer.o].join(',')));
        const csv = rows.join('\n');

        const blob = new Blob([csv], {type: 'text/csv'});
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.download = 'odometer.csv';
        link.click();
    });

    document.getElementById('add-button').addEventListener('click', () => {
        newDialog.showModal();
    });

    document.getElementById('new-odometer').addEventListener('submit', e => {
        e.preventDefault();

        const date = dateElem.value;
        if (odometers.some(odometer => odometer.d === date)) {
            alert('同じ日付の走行距離記録が存在します。');
            return false;
        }

        const distance = Number(distanceElem.value);
        if (distance < 0) {
            alert('総走行距離には0以上の数字を入力してください。');
            return;
        }

        odometers.push({
            d: date,
            o: distance
        });
        setStorage();

        showOdometers();

        newDialog.close();
    });

    document.getElementById('cancel').addEventListener('click', () => {
        newDialog.close();
    });

    editOdometer.addEventListener('submit', e => {
        e.preventDefault();

        const recentDate = editOdometer.dataset.date;
        const date = editDateElem.value;
        if (odometers.some(odometer => odometer.d === date && odometer.d !== recentDate)) {
            alert('同じ日付の走行距離記録が存在します。');
            return false;
        }

        const distance = Number(editDistanceElem.value);
        if (distance < 0) {
            alert('総走行距離には0以上の数字を入力してください。');
            return;
        }

        deleteOdometer(recentDate);

        odometers.push({
            d: date,
            o: distance
        });
        setStorage();

        showOdometers();

        editDialog.close();
    });

    document.getElementById('delete').addEventListener('click', () => {
        const date = editOdometer.dataset.date;

        if (!confirm(`${toSeparatedDate((new Date(date)), '/')} の記録を削除します。`)) {
            editDialog.close();
            return false;
        }

        deleteOdometer(date);

        editDialog.close();
    });

    document.getElementById('edit-cancel').addEventListener('click', () => {
        editDialog.close();
    });
});