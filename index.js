let db;

        document.addEventListener("DOMContentLoaded", () => {
            let request = indexedDB.open("tasksDB", 1);
            request.onupgradeneeded = (event) => {
                let db = event.target.result;
                let objectStore = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
            };
            request.onsuccess = (event) => {
                db = event.target.result;
                loadTasks();
            };
            document.getElementById("create-task-form").addEventListener("submit", addTask);
        });

        function addTask(event) {
            event.preventDefault();
            let input = document.getElementById("new-task-description");
            let taskText = input.value.trim();
            if (taskText === "") return;
            
            let transaction = db.transaction(["tasks"], "readwrite");
            let store = transaction.objectStore("tasks");
            let task = { text: taskText, completed: false };
            store.add(task);
            
            transaction.oncomplete = () => {
                input.value = "";
                loadTasks();
            };
        }

        function loadTasks() {
            let taskList = document.getElementById("tasks");
            taskList.innerHTML = "";
            let transaction = db.transaction(["tasks"], "readonly");
            let store = transaction.objectStore("tasks");
            let request = store.openCursor();

            request.onsuccess = (event) => {
                let cursor = event.target.result;
                if (cursor) {
                    let li = document.createElement("li");
                    li.innerHTML = `<input type='checkbox' ${cursor.value.completed ? "checked" : ""} onchange='toggleTask(${cursor.key}, this)'> ${cursor.value.text} <button onclick='deleteTask(${cursor.key})'>X</button>`;
                    taskList.appendChild(li);
                    cursor.continue();
                }
            };
        }

        function toggleTask(id, checkbox) {
            let transaction = db.transaction(["tasks"], "readwrite");
            let store = transaction.objectStore("tasks");
            let request = store.get(id);

            request.onsuccess = () => {
                let task = request.result;
                task.completed = checkbox.checked;
                store.put(task);
            };
        }

        function deleteTask(id) {
            let transaction = db.transaction(["tasks"], "readwrite");
            let store = transaction.objectStore("tasks");
            store.delete(id);
            transaction.oncomplete = () => loadTasks();
        }