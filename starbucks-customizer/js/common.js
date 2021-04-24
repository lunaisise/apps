alert('start common');
const dnone = 'dnone';
const clickEventName = 'ontouchstart' in window ? 'touchstart' : 'click';

const GetParams = (() => {
    const searchText = location.search.substring(1);
    const searchTexts = searchText.split('&');
    const searchParams = {};
    searchTexts.forEach(param => {
        const params = param.split('=');
        searchParams[params[0]] = params[1];
    });
    return searchParams;
})();

function fetchGet(url, successFunc = null, errorFunc = null) {
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw response.status;
        }).then(json => {
            if (typeof successFunc === 'function') {
                successFunc(json);
            } else {
                console.log(json);
            }
        }).catch(error => {
            if (typeof errorFunc === 'function') {
                errorFunc(error);
            } else {
                console.log(error);
            }
        });
}

function createClone(id, targetElem) {
    const template = document.querySelector(id);
    const clone = template.content.cloneNode(true);
    return clone.querySelector(targetElem);
}

const shareApi = async (shareData) => {
    try {
        await navigator.share(shareData);
    } catch (error) {
        console.error(error);
    }
}

document.querySelector('#more-button').addEventListener('click', e => {
    e.preventDefault();
    const menu = document.querySelector('#footer-menu');
    if (menu.classList.contains(dnone)) {
        menu.classList.remove(dnone);
    } else {
        menu.classList.add(dnone);
    }
});