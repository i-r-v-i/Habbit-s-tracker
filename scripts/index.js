let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";

const page = {
    menu: document.querySelector('.menu__list'),
    header: {
      title: document.querySelector('h1'),
      progressPercent: document.querySelector('.progress__percent'),
      progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    content: {
      habbitList: document.querySelector('.habbitList'),
      nextDay: document.querySelector('.habbit__day')
    },
}

function loadData() {
  const habbitString = localStorage.getItem("HABBIT_KEY");
  const habbitArray = JSON.parse(habbitString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

// render
function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
        const element = document.createElement('button');
        element.setAttribute('menu-habbit-id', habbit.id);
        element.classList.add('menu__item');
        element.addEventListener('click', ()=> rerender(habbit.id))
        element.innerHTML = `<image src="./assets/svg/${habbit.icon}.svg" alt="${habbit.name}" />`;
        if(activeHabbit.id === habbit.id) {
          element.classList.add('menu__item_active');
        }    
        page.menu.appendChild(element);
        continue;
    }
    if(activeHabbit.id === habbit.id) {
        existed.classList.add('menu__item_active');
    } else {
        existed.classList.remove('menu__item_active');
    }
  }
}

function rerenderHead (activeHabbit) {
  page.header.title.innerText = activeHabbit.name;
  const progress = activeHabbit.days.length / activeHabbit.target > 1
  ? 100
  :  activeHabbit.days.length / activeHabbit.target * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + '%';;
  page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent (activeHabbit) {
  if(activeHabbit.days.length) {
    page.content.habbitList.innerHTML = '';
    
    for(const index in activeHabbit.days) {
      const element = document.createElement('div');
      element.classList.add('habbit');
      element.innerHTML = `<div class="habbit__day">День ${+index + 1}</div>
              <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
              <button class="habbit__bin">
                <img src="./assets/svg/delete.svg" alt="удалить день ${+index + 1}" />
              </button>`;
      page.content.habbitList.appendChild(element);
    }
    page.content.nextDay.innerText = `День ${activeHabbit.days.length + 1}`;
  }

}

function rerender(activeHabbitId) {

  const activeHabbit = habbits.find((habbit) => (habbit.id === activeHabbitId));
  if (!activeHabbit) {
    return;
  }
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

(() => {
  loadData();
  rerender(habbits[0].id)
})();
