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
    //   const transaction = db.transaction(['transactionList'],'readwrite');
    //   const pendingObjectStore = transaction.objectStore('transactionList');
    //   const statusIndex = pendingObjectStore.index('statusIndex');

    // };


// function checkForIndexedDb() {
//     if (!window.indexedDB) {
//       console.log("Browser not supported!");
//       return false;
//     }
//     return true;
//   }
  


// function useIndexedDb(databaseName,storeName,method, object) {
//     return new Promise((resolve, reject) => {
//       const request = window.indexedDB.open(databaseName, 1);
//       let db,
//         tx,
//         store;
  
//       request.onupgradeneeded = function(e) {
//         const db = request.result;
//         db.createObjectStore(storeName, { keyPath: "_id" });
//       };
  
//       request.onerror = function(e) {
//         console.log("There was an error");
//       };
    
//       request.onsuccess = function(e) {
//         db = request.result;
//         tx = db.transaction(storeName, "readwrite");
//         store = tx.objectStore(storeName);
  
//         db.onerror = function(e) {

//           console.log("error");
//         };
//         if (method === "put") {
//           store.put(object);
//         } else if (method === "get") {
//           const all = store.getAll();
//           all.onsuccess = function() {
//             resolve(all.result);
//           };
//         } else if (method === "delete") {
//           store.delete(object._id);
//         }
//         tx.oncomplete = function() {
//           db.close();
//         };
//       };
//     });
//   }





  
