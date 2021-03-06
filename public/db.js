let database;
const request = indexeddatabase.open("budget", 1);

request.onupgradeneeded = function (event) {
  const database = event.target.result;
  database.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  database = event.target.result;

 
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  store.add(record);
}

function checkDatabase() {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          // delete records if successful
          const transaction = database.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}
function deletePending() {
  const transaction = database.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.clear();
}


window.addEventListener("online", checkDatabase);