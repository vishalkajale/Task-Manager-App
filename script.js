const deleteButton = document.querySelector(".task-delete");
const taskWrapper = document.querySelectorAll(".task-list");
const saveDescription = document.querySelector(".save-btn");
const inputModal = document.querySelector(".descr-input");
const descriptionPopup = document.querySelector(".popup");
const closePopup = document.querySelector(".cancel-btn");
const addButton = document.querySelector("#add-btn");
const dustbin = document.querySelector(".dustbin");
const inputBox = document.querySelector("input");
const descrHeader = document.querySelector(".descr-header");

let currTask;
inputBox.focus();
const localStorageKey = "state";

// Get data from local strorge
const initializeTasks = () => {
    const state = localStorage.getItem(localStorageKey);
    if (!state) {
        return [];
    }
    return JSON.parse(state);
};
const tasks = initializeTasks();

// Save data in Local Storage
const saveState = () => {
    const state = JSON.stringify(tasks);
    localStorage.setItem(localStorageKey, state);
};

// Render Tasks
const renderTasks = () => {
    for (const element of taskWrapper) {
        element.innerText = "";
    }
    tasks.forEach((task) => {
        const taskNode = createTaskNode(task);
        if (task.currentState === "open-tasks") {
            taskWrapper[0].appendChild(taskNode);
        } else if (task.currentState === "inprogress-tasks") {
            taskWrapper[1].appendChild(taskNode);
        } else if (task.currentState === "inreview-tasks") {
            taskWrapper[2].appendChild(taskNode);
        } else {
            taskWrapper[3].appendChild(taskNode);
        }
    });
};
//Delete Task
const deleteTask = (ev) => {
    ev.preventDefault();
    let taskId = ev.dataTransfer.getData("text");
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (taskId == task.id && task.currentState === "open-tasks") {
            tasks.splice(i, 1);
            saveState();
            renderTasks();
            return;
        }
    }
};
//change state of task
const changeState = (target, taskId) => {
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (taskId == task.id) {
            if (
                (task.currentState === "open-tasks" && target === "inprogress-tasks") ||
                (task.currentState === "inprogress-tasks" &&
                    target === "inreview-tasks") ||
                (task.currentState === "inreview-tasks" && target === "done-tasks")
            ) {
                tasks.unshift(task);
                tasks.splice(i + 1, 1);
                task.currentState = target;
                saveState();
                break;
            }
        }
    }
};
//find task on which task is dropped
const findTargetTask = (id) => {
    let firstTaskIdx = -1;
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (id == task.id) {
            firstTaskIdx = i;
        }
    }
    return firstTaskIdx;
};
//find dropped task
const droppedTask = (data) => {
    let secondTaskIdx = -1;
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (data == task.id) {
            secondTaskIdx = i;
        }
    }
    return secondTaskIdx;
};
// if task is dragged and dropped in the task 
const dragAndSort = (id, data, target) => {
    let firstTaskIdx = findTargetTask(id);
    let secondTaskIdx = droppedTask(data);
    const task = tasks[secondTaskIdx];
    if(task.currentState !== tasks[firstTaskIdx].currentState) {
        changeState(target, data);
        return;
    }
    if ((task.currentState === target &&
            (task.currentState === "open-tasks" ||
                task.currentState === "inprogress-tasks")) ||
        (task.currentState === "open-tasks" && target === "inprogress-tasks") ||
        (task.currentState === "inprogress-tasks" &&
            target === "inreview-tasks") ||
        (task.currentState === "inreview-tasks" && target === "done-tasks")
    ) {
        task.currentState = target;
        if (firstTaskIdx !== -1) {
            tasks.splice(firstTaskIdx < secondTaskIdx ? firstTaskIdx : firstTaskIdx + 1, 0, task);
            tasks.splice(secondTaskIdx > firstTaskIdx ? secondTaskIdx + 1 : secondTaskIdx, 1);
            saveState();
        }
    }
};

//Create new TaskNode
const createTaskNode = (task) => {
    //task name
    const taskNode = document.createElement("div");
    taskNode.classList.add("task");
    taskNode.setAttribute("id", `${task.id}`);
    taskNode.setAttribute("draggable", "true");
    taskNode.setAttribute("ondragstart", "drag(event),true");
    taskNode.setAttribute("id", task.id);
    taskNode.onclick = () => {
        currTask = task;
        if (!currTask.description && currTask.currentState == "open-tasks") {
            descrHeader.innerHTML = task.text;
            descriptionPopup.classList.toggle("open-popup");
            inputModal.focus();
        }
    };

    const taskWrapper = document.createElement("div");
    taskWrapper.classList.add("task-wrapper");

    const statusBar = document.createElement("div");
    statusBar.classList.add("status-bar");

    const taskText = document.createElement("p");
    taskText.classList.add("task-name");
    taskText.innerText = task.text;

    const descriptionWrapper = document.createElement("div");
    descriptionWrapper.classList.add("description-wrapper");

    //description text
    const descriptionText = document.createElement("p");
    descriptionText.classList.add("description-text");
    descriptionText.innerText = task.description;

    //Append all elements
    taskNode.appendChild(taskWrapper);
    taskWrapper.appendChild(statusBar);
    taskWrapper.appendChild(taskText);
    taskWrapper.appendChild(descriptionWrapper);
    descriptionWrapper.appendChild(descriptionText);
    return taskNode;
};
//Drag and Drop Functionality
function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    const data = ev.target.id;
    ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
     const dropLocation = ev.target.appendChild(document.getElementById(data));

    const dropedOnTask = dropLocation.closest(".task");
    const target = dropLocation.closest(".task-list");
    if (dropedOnTask) {
        dragAndSort(dropedOnTask.id, data, target.classList[0]);
    } else {
        changeState(target.classList[0], data);
    }
    renderTasks();
}
//Create Task Object
const createTaskObject = (taskText) => {
    return {
        id: Math.random(),
        text: taskText,
        currentState: "open-tasks",
        description: "",
    };
};
//Add new Task
const addTask = () => {
    const task = inputBox.value.trim(" ");
    if (task) {
        const taskObject = createTaskObject(task);
        tasks.unshift(taskObject);
        saveState();
        renderTasks();
        inputBox.value = "";
    }
};
//Add Description
const addDescription = () => {
    const taskDescription = inputModal.value.trim(" ");
    if (taskDescription) {
        currTask.description = taskDescription;
        saveState();
        renderTasks();
        inputModal.value = "";
    }
    descriptionPopup.classList.remove("open-popup");
};

//Hide Modal
const hideModal = () => {
    inputModal.value = "";
    descriptionPopup.classList.remove("open-popup");
};

//Event Listeners
inputBox.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        addTask();
        renderTasks();
    }
});
addButton.addEventListener("click", addTask);
saveDescription.addEventListener("click", addDescription);
closePopup.addEventListener("click", hideModal);
renderTasks();
