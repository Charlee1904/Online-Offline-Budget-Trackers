let db;
const request = indexedDB.open('budget',1);

  request.onupgradeneeded = (event) => { 
      db = event.target.result;
      db.createObjectStore("pending", { keyPath: "_id", autoIncrement:true});
    };

  request.onsuccess = (event) => {
      db = event.target.result;
      if(navigator.onLine) {
        checkDatabase();
      }
      else saveRecord();
    };

    request.onerror = function(event) {
      console.log("There was an error");
    };

    function saveRecord(offline) {
      const transaction = db.transaction(["pending"],"readwrite");
      const store = transaction.objectStore("pending");
      store.add(offline);
    }

    function checkDatabase(){
      const transaction = db.transaction(["pending"],"readwrite");
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
            },
          })
            .then((response) => response.json())
            .then(() => {
              const transaction = db.transaction(["pending"], "readwrite");
              const store = transaction.objectStore("pending");
              store.clear();
            });
        }
      };
    }

    window.addEventListener("online", checkDatabase);
