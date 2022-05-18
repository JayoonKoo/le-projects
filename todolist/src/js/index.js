import "@fortawesome/fontawesome-free/js/all.min.js";
import "../scss/style.scss";

class Router {
  routes = [];
  notFondCallback = () => {};
  addRoute(url, callback) {
    this.routes.push({
      url,
      callback,
    });

    return this;
  }

  checkRoute() {
    const currentRoute = this.routes.find(
      (route) => route.url === window.location.hash
    );

    if (!currentRoute) {
      this.notFondCallback();
      return;
    }

    currentRoute.callback();
  }

  init() {
    window.addEventListener("hashchange", this.checkRoute.bind(this));
    if (!window.location.hash) {
      window.location.hash = "#/";
    }
    this.checkRoute();
  }

  setNotFound(callback) {
    this.notFondCallback = callback;
    return this;
  }
}

class Storage {
  saveTodo(id, todoContent) {
    const todosData = this.getTodos();
    todosData.push({ id, content: todoContent, status: "TODO" });
    localStorage.setItem("todos", JSON.stringify(todosData));
  }

  editTodo(id, todoContent, status = "TODO") {
    const todosData = this.getTodos();
    const todoIndex = todosData.findIndex((todo) => todo.id == id);
    const targetTodo = todosData[todoIndex];
    const editTodo =
      todoContent === ""
        ? { ...targetTodo, status }
        : { ...targetTodo, content: todoContent };
    todosData.splice(todoIndex, 1, editTodo);
    localStorage.setItem("todos", JSON.stringify(todosData));
  }

  deleteTodo(id) {
    const todosData = this.getTodos();
    todosData.splice(
      todosData.findIndex((todo) => todo.id == id),
      1
    );
    localStorage.setItem("todos", JSON.stringify(todosData));
  }

  getTodos() {
    return localStorage.getItem("todos") === null
      ? []
      : JSON.parse(localStorage.getItem("todos"));
  }
}

class TodoList {
  constructor(storage) {
    this.initStorage(storage);
    this.assignElement();
    this.addEvent();
    this.loadSaveData();
  }

  initStorage(storage) {
    this.storage = storage;
  }

  assignElement() {
    this.inputContainerEl = document.getElementById("input-container");
    this.inputAreaEl = this.inputContainerEl.querySelector("#input-area");
    this.todoInputEl = this.inputAreaEl.querySelector("#todo-input");
    this.addBtnEl = this.inputAreaEl.querySelector("#add-btn");
    this.todoContainerEl = document.getElementById("todo-container");
    this.todoListEl = this.todoContainerEl.querySelector("#todo-list");
    this.radioAreaEl = this.inputContainerEl.querySelector("#radio-area");
    this.filterRadioEls = this.radioAreaEl.querySelectorAll(
      'input[name="filter"]'
    );
  }

  addEvent() {
    this.addBtnEl.addEventListener("click", this.onClickAddBtn.bind(this));
    this.todoListEl.addEventListener("click", this.onClickTodoList.bind(this));
    this.todoInputEl.addEventListener("keyup", this.onKeyUpTodo.bind(this));
    this.addRadioBtnEvent();
  }

  onKeyUpTodo(event) {
    if (event.code === "Enter") {
      this.onClickAddBtn();
    }
  }

  loadSaveData() {
    const todosData = this.storage.getTodos();
    for (const todoData of todosData) {
      const { id, content, status } = todoData;
      this.createTodoElement(id, content, status);
    }
  }

  addRadioBtnEvent() {
    for (const filterRadioBtnEl of this.filterRadioEls) {
      filterRadioBtnEl.addEventListener(
        "click",
        this.onClickRadioBtn.bind(this)
      );
    }
  }

  onClickRadioBtn(event) {
    const { value } = event.target;
    window.location.hash = `#/${value.toLowerCase()}`;
  }

  filterTodo(status) {
    const todoDivEls = this.todoListEl.querySelectorAll("div.todo");
    for (const todoDivEl of todoDivEls) {
      switch (status) {
        case "ALL":
          todoDivEl.style.display = "flex";
          break;
        case "DONE":
          todoDivEl.style.display = todoDivEl.classList.contains("done")
            ? "flex"
            : "none";
          break;
        case "TODO":
          todoDivEl.style.display = todoDivEl.classList.contains("done")
            ? "none"
            : "flex";
          break;
        default:
      }
    }
  }

  onClickTodoList(event) {
    const { target } = event;
    const btn = target.closest("button");
    if (!btn) return;
    if (btn.matches("#delete-btn")) {
      this.deleteTodo(target);
    } else if (btn.matches("#edit-btn")) {
      this.editTodo(target);
    } else if (btn.matches("#save-btn")) {
      this.saveTodo(target);
    } else if (btn.matches("#complete-btn")) {
      this.completeTodo(target);
    }
  }

  completeTodo(target) {
    const todoDiv = target.closest(".todo");
    todoDiv.classList.toggle("done");
    const { id } = todoDiv.dataset;
    this.storage.editTodo(
      id,
      "",
      todoDiv.classList.contains("done") ? "DONE" : "TODO"
    );
  }

  saveTodo(target) {
    const todoDiv = target.closest(".todo");
    todoDiv.classList.remove("edit");
    const todoInputEl = todoDiv.querySelector("input");
    todoInputEl.readOnly = true;
    const { id } = todoDiv.dataset;
    this.storage.editTodo(id, todoInputEl.value);
  }

  editTodo(target) {
    const todoDiv = target.closest(".todo");
    const todoInputEl = todoDiv.querySelector("input");
    todoInputEl.readOnly = false;
    todoInputEl.focus();
    todoDiv.classList.add("edit");
  }

  deleteTodo(target) {
    const todoDiv = target.closest(".todo");
    // 트랜지션이 끝났을때 이벤트
    todoDiv.addEventListener("transitionend", () => {
      todoDiv.remove();
    });
    todoDiv.classList.add("delete");
    this.storage.deleteTodo(todoDiv.dataset.id);
  }

  onClickAddBtn() {
    const { value } = this.todoInputEl;
    if (value === 0) {
      alert("이름을 입력해주세요. ");
      return;
    }

    const id = Date.now();
    this.storage.saveTodo(id, value);
    this.createTodoElement(id, value);
  }

  createTodoElement(id, value, status = null) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    if (status === "DONE") {
      todoDiv.classList.add("done");
    }

    todoDiv.dataset.id = id;
    const todoContent = document.createElement("input");
    todoContent.value = value;
    todoContent.readOnly = true;
    todoContent.classList.add("todo-item");
    const fragment = new DocumentFragment();
    fragment.appendChild(todoContent);
    fragment.appendChild(
      this.createButton("complete-btn", "complete-btn", ["fas", "fa-check"])
    );
    fragment.appendChild(
      this.createButton("edit-btn", "edit-btn", ["fas", "fa-edit"])
    );
    fragment.appendChild(
      this.createButton("delete-btn", "delete-btn", ["fas", "fa-trash"])
    );
    fragment.appendChild(
      this.createButton("save-btn", "save-btn", ["fas", "fa-save"])
    );
    todoDiv.appendChild(fragment);
    this.todoListEl.appendChild(todoDiv);
    this.todoInputEl.value = "";
  }

  createButton(btnId, btnClassName, iconClassName) {
    const btn = document.createElement("button");
    const icon = document.createElement("i");
    icon.classList.add(...iconClassName);
    btn.appendChild(icon);
    btn.id = btnId;
    btn.classList.add(btnClassName);
    return btn;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const router = new Router();
  const todoList = new TodoList(new Storage());
  const routeCallback = (status) => () => {
    todoList.filterTodo(status);
    document.querySelector(
      `input[type='radio'][value='${status}']`
    ).checked = true;
  };
  router
    .addRoute("#/all", routeCallback("ALL"))
    .addRoute("#/todo", routeCallback("TODO"))
    .addRoute("#/done", routeCallback("DONE"))
    .setNotFound(routeCallback("ALL"))
    .init();
});
