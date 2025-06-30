// глобавльное состояние
let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    title: document.querySelector("h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  content: {
    habbitList: document.querySelector(".habbitList"),
    nextDay: document.querySelector(".habbit__day"),
  },
  popup: {
    cover: document.querySelector(".cover"),
    addButton: document.querySelector(".menu__add"),
    closeButton: document.querySelector(".popup__close"),
  
  }
};

// utils
function loadData() {
  const habbitString = localStorage.getItem(HABBIT_KEY); // получаем строку с данными из хранилища
  const habbitArray = JSON.parse(habbitString); // парсим данные - превращаем строку в массив
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  } // проверяем, если пришел массив, то сохраняем его в состояние нашего приложения
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
} // сохраняем в локалсторидж с ключем "HABBIT_KEY" в виде строки массив привычек.

// render
function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) { // если такого нет, то создаем разметку
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.addEventListener("click", () => rerender(habbit.id));
      element.innerHTML = `<img src="./assets/svg/${habbit.icon}.svg" alt="${habbit.name}" />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item_active");
      }
      page.menu.appendChild(element);
      continue;
    }
    // делаем присвоение класса активного айтема меню
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__item_active");
    } else {
      existed.classList.remove("menu__item_active");
    }
  }
}

function rerenderHead(activeHabbit) {
  page.header.title.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
  if (activeHabbit.days.length) {
    page.content.habbitList.innerHTML = "";

    for (const index in activeHabbit.days) {
      const element = document.createElement("div");
      element.classList.add("habbit");
      element.innerHTML = `<div class="habbit__day">День ${+index + 1}</div>
              <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
              <button class="habbit__bin" onClick="deleteDay(${index})">
                <img src="./assets/svg/delete.svg" alt="удалить день ${+index + 1}" />
              </button>`;
      page.content.habbitList.appendChild(element);
    }
    page.content.nextDay.innerText = `День ${activeHabbit.days.length + 1}`;
  }
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId; // запоминаем id активной привычки глобально, чтобы потом использовать данные привычек из нее
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId); //среди глобального массива находим привычку с совпадающим id
  if (!activeHabbit) {
    return;
  }
  rerenderMenu(activeHabbit); // рендерим
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

// Работа с днями
function addDays(event) {
  event.preventDefault();
  const form = event.target;
  form["comment"].classList.remove("error"); // для очистки ошибки, если сначала не ввели в инпут и получили класс ошибки, а потом исправились и заполнили поле
  const dataForm = new FormData(form);
  const comment = dataForm.get("comment"); // получаем значение инпута с указанным именем
  if (!comment) {
    form["comment"].classList.add("error"); // если поле не заполнено, добавляем класс ошибки для инпута именно в этой форме с именем 'comment' (так искать удобнее, чем по квериселектору, т к в противном случае поиск будет глоюальным и может найти не то)
  }

  // модифицируем массив привычек
  habbits = habbits.map((habbit) => {
    // если ???????????????????????????????????? добавляем в массив комментариев по дням новый
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment }]),
      };
    }
    return habbit;
  });

  form["comment"].value = ""; // очищаем инпут после сабмита
  rerender(globalActiveHabbitId); // делаем новый рендер (так как мы на ваниле)
  saveData(); // сохраняем в "стейт" то, что ввели в инпут
}

function deleteDay(index) {
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1);
      return {
        ...habbit,
        days: habbit.days,
      };
    }
    console.log(habbit);
    return habbit;
  });
  rerender(globalActiveHabbitId); // делаем новый рендер (так как мы на ваниле)
  saveData(); // сохраняем в "стейт" то, что ввели в инпут
}

function togglePopup () {
   if( page.popup.cover.classList.contains('cover_hidden')) {
    page.popup.cover.classList.remove('cover_hidden');
} else {
    page.popup.cover.classList.add('cover_hidden');
}
}

// function addHabbit () {
//    page.popup.addButton.addEventListener("click", togglePopup);
//    page.popup.closeButton.removeEventListener("click", togglePopup);
// }
// function closePopup () {
//   page.popup.closeButton.addEventListener("click", togglePopup);
//   page.popup.addButton.removeEventListener("click", togglePopup);
// }


(() => {
  loadData(); // при загрузке приложения один раз вызываем функцию загрузки с помощью анонимной функции
  rerender(habbits[0].id); // 
})();
