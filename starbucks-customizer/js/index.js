window.addEventListener('DOMContentLoaded', () => {
    fetchGet('./data/drinks.json', json => {
        // console.log(json);
        Object.keys(json).forEach(drinkTypeKey => {
            const li = createClone('#drink-type-template', 'li');
            li.id = drinkTypeKey;
            li.querySelector('h2').textContent = json[drinkTypeKey]['drink_type_name'];
            document.querySelector('#categories').appendChild(li);

            json[drinkTypeKey]['drinks'].forEach(drink => {
                const li = createClone('#drink-template', 'li');
                li.querySelector('h3').textContent = drink['drink_name'];
                if (drink['special_items'] !== undefined) {
                    drink['special_items'].forEach(item => {
                        const itemLi = document.createElement('li');
                        itemLi.textContent = item;
                        li.querySelector('.special-items').appendChild(itemLi);
                    });
                }
                if (drink['heats'] !== undefined) {
                    Object.keys(drink['heats']).forEach(heatId => {
                        const heatLi = document.createElement('li');
                        heatLi.style.backgroundColor = drink['heats'][heatId]['color'];
                        heatLi.textContent = drink['heats'][heatId]['heat_name'];
                        li.querySelector('.heats').appendChild(heatLi);
                    });
                }
                if (drink['sizes'] !== undefined) {
                    Object.keys(drink['sizes']).forEach(price => {
                        const sizeLi = createClone('#size-template', 'li');
                        sizeLi.querySelector('.size').textContent = drink['sizes'][price]['size_name'];
                        sizeLi.querySelector('.price').textContent = price;
                        li.querySelector('.sizes').appendChild(sizeLi);
                    });
                }
                li.querySelector('a').href = `./drinks/${drink['drink_id']}.html`;
                document.querySelector(`#${drinkTypeKey} > ul`).appendChild(li);
            });
        });
    });

    const shareData = {
        title: 'Starbucks Customizer | ',
        text: 'Starbucksのドリンクをカスタマイズして楽しもう！',
        url: 'https://lunaisise.github.io/apps/starbucks-customizer/'
    };
    document.querySelector('#share-button').addEventListener('click', () => {
        shareApi(shareData);
    });
});