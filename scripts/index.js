// глобавльное состояние
let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    title: document.querySelector("h1"),
    progressContainer: document.querySelector(".progress-container"),
  },
  content: {
    habbitList: document.querySelector(".habbitList"),
    dayForm: document.querySelector(".habbit__form-container"),
    nextDay: document.querySelector(".habbit__day"),
  },
  popup: {
    cover: document.querySelector(".cover"),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  },
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

function getValidateFormData(form, inputs) {
  // передаем форму и поля инпутов
  const dataForm = new FormData(form);
  const res = {}; // в этот объект потом сложим результаты
  for (const input of inputs) {
    const inputValue = dataForm.get(input); // получаем значение инпута с указанным именем
    form[input].classList.remove("error"); // для очистки ошибки, если сначала не ввели в инпут и получили класс ошибки, а потом исправились и заполнили поле
    if (!inputValue) {
      form[input].classList.add("error"); // если поле не заполнено, добавляем класс ошибки для инпута именно в этой форме с именем 'comment' (так искать удобнее, чем по квериселектору, т к в противном случае поиск будет глоюальным и может найти не то)
    }
    res[input] = inputValue;
  }
  let isValid = true;
  for (const input of inputs) {
    if (!res[input]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}

function resetForm(form, inputs) {
  for (const input of inputs) {
    form[input].value = "";
  }
}

// render
function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      // если такого нет, то создаем разметку
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
  page.header.progressContainer.innerHTML = '';
  const progressData =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;

  const progressElement = document.createElement("div");
  progressElement.classList.add("progress");
  progressElement.innerHTML = `<div class="progress__text">
                    <div class="progress__name">Прогресс</div>
                    <div class="progress__percent">${progressData.toFixed(0) + "%"}</div>
                  </div>
                  <div class="progress__bar">
                    <div class="progress__cover-bar"></div>
                  </div>`;

  page.header.progressContainer.appendChild(progressElement);
  document.querySelector('.progress__cover-bar').setAttribute("style", `width: ${progressData}%`);
}

function rerenderContent(activeHabbit) {
  renderDaysForm(activeHabbit);
  page.content.habbitList.innerHTML = "";
  // page.header.progressContainer.innerHTML = "";

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
}

function renderDaysForm(activeHabbit) {
  page.content.dayForm.innerHTML = "";

  const formElement = document.createElement("div");
  formElement.classList.add("habbit");
  formElement.innerHTML = `<div class="habbit__day">${
    activeHabbit.days.length ? `День ${activeHabbit?.days.length + 1}` : "Начнем!"
  }</div>
            <form class="habbit__form" onsubmit="addDays(event)">
              <input
                class="habbit__input"
                type="text"
                name="comment"
                id=""
                placeholder="Комментарий"
              />
              <img
                class="icon"
                src="/assets/svg/comment.svg"
                alt="иконка комментария"
              />
              <button class="habbit__done" type="submit">Готово</button>
            </form>`;
  page.content.dayForm.appendChild(formElement);
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId; // запоминаем id активной привычки глобально, чтобы потом использовать данные привычек из нее
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId); //среди глобального массива находим привычку с совпадающим id
  if (!activeHabbit) {
    return;
  }
  document.location.replace(document.location.pathname + "#" + activeHabbitId); // изменение url при переходе на другоую привычку
  rerenderMenu(activeHabbit); // рендерим
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

// Работа с днями
function addDays(event) {
  event.preventDefault();
  const form = event.target;
  const field = ["comment"];
  const data = getValidateFormData(form, field);
  if (!data) {
    return;
  }
  // модифицируем массив привычек
  habbits = habbits.map((habbit) => {
    // если находимся на активной привычке, добавляем новый коммент в массив комментариев дней
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      };
    }
    return habbit;
  });

  resetForm(form, field); // очищаем инпут после сабмита
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

function togglePopup() {
  if (page.popup.cover.classList.contains("cover_hidden")) {
    page.popup.cover.classList.remove("cover_hidden");
  } else {
    page.popup.cover.classList.add("cover_hidden");
  }
}

// работа с привычками
function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector(".popup__icon.popup__icon_active");
  activeIcon.classList.remove("popup__icon_active");
  context.classList.add("popup__icon_active");
}

function addHabbit(event) {
  event.preventDefault();
  const form = event.target;
  const fields = ["name", "icon", "target"];
  const data = getValidateFormData(form, fields);
  if (!data) {
    return;
  }

  const maxID = habbits.reduce((acc, habbit) => (acc > habbit.id ? acc : habbit.id), 0);

  habbits.push({
    id: maxID + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  });
  resetForm(form, fields);
  togglePopup();
  saveData();
  rerender(maxID + 1);
}

(() => {
  loadData(); // при загрузке приложения один раз вызываем функцию загрузки с помощью анонимной функции

  const hashId = Number(document.location.hash.replace("#", ""));
  const urlHabbit = habbits.find((habbit) => habbit.id == hashId);
  if (urlHabbit) {
    rerender(urlHabbit.id);
  } else {
    rerender(habbits[0].id); // по умолчанию пока делаем активной первую привычку
  }
})();
