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
};

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
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.addEventListener("click", () => rerender(habbit.id));
      element.innerHTML = `<image src="./assets/svg/${habbit.icon}.svg" alt="${habbit.name}" />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item_active");
      }
      page.menu.appendChild(element);
      continue;
    }
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

(() => {
  loadData();
  rerender(habbits[0].id);
})();
