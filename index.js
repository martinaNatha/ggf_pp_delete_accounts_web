const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const exphbs = require("express-handlebars");
const http = require("http");
const https = require("https");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const querystring = require('querystring');
const moment = require('moment');
const sql = require('mssql');

require("dotenv").config();

const app = express();

const server = http.createServer(app);

app.set("views", path.join(__dirname, "views"));

const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: path.join(app.get("views"), "layouts"),
  partialsDir: path.join(app.get("views"), "partials"),
  extname: ".hbs",
  helpers: {
    ifeq: function (a, b, options) {
      if (a == b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    ifnoteq: function (a, b, options) {
      if (a != b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    firstL: function (options) {
      return options.charAt(0);
    },
  },
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

// Middleware
app.use(morgan("tiny")); //Morgan
app.use(cors()); // cors
app.use(express.json()); // JSON
app.use(express.urlencoded({ extended: false })); //urlencoded
app.use(bodyParser.json());

app.post("/send_data_to_uipath", async (req, res) => {
  const { data, user_name, amount } = req.body;
  console.log(data.length);
  var type_r = "Delete Account"
  const requestAccessToken = () => {
    return new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open("POST", "https://cloud.uipath.com/identity_/connect/token?=", true);
      request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      request.setRequestHeader("X-UIPATH-TenantName", "Fatum");
      var post_data = querystring.stringify({
        grant_type: "client_credentials",
        client_id: "da1cdf02-14b1-465d-9144-8f70393d9ac3",
        client_secret: "W!dts!Wj)Ud~86Ws",
      });
      request.onload = () => {
        if (request.status === 200) {
          const obj = JSON.parse(request.responseText);
          resolve(obj.access_token);
        } else {
          reject(new Error("Failed to get access token"));
        }
      };
      request.send(post_data);
    });
  };

  const requestQueueItems = (accessToken) => {
    const promises = data.map((anumber) => {
      return new Promise((resolve, reject) => {
        var obj2 = {
          itemData: {
            Reference: "wn-" + anumber,
            Priority: "Normal",
            Name: "pp_delete_account",
            DeferDate: null,
            DueDate: null,
            SpecificContent: {
              task:"delete",
              Anummer: anumber,
            },
          },
        };
        var request2 = new XMLHttpRequest();
        request2.open(
          "POST",
          "https://cloud.uipath.com/guardkakhock/fatum/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem",
          true
        );
        request2.setRequestHeader("Content-Type", "application/json");
        request2.setRequestHeader("X-UIPATH-OrganizationUnitId", "197485");
        request2.setRequestHeader("Authorization", "Bearer " + accessToken);
        request2.onload = () => {
          if (request2.status === 202) {
            resolve();
          } else {
            reject(new Error("Failed to add queue item"));
          }
        };
        var post_data2 = JSON.stringify(obj2);
        request2.send(post_data2);
      });
    });

    return Promise.all(promises);
  };

  requestAccessToken()
    .then((accessToken) => requestQueueItems(accessToken))
    .then(() => {
      res.json({ status: "202" });
      store_data(data, user_name, type_r, amount)
    })
    .catch((error) => {
      console.error("Error:", error.message);
      res.status(500).json({ error: error.message });
      store_data(data, user_name);
    });
});

app.post("/send_reseted_info", (req, res) => {
  const { jsonData, user_name } = req.body;
  var type_r = "Reset Account"
  var amount = jsonData.length
  store_data(jsonData, user_name, type_r, amount);

  // const requestAccessToken = () => {
  //   return new Promise((resolve, reject) => {
  //     var request = new XMLHttpRequest();
  //     request.open("POST", "https://cloud.uipath.com/identity_/connect/token?=", true);
  //     request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  //     request.setRequestHeader("X-UIPATH-TenantName", "Fatum");
  //     var post_data = querystring.stringify({
  //       grant_type: "client_credentials",
  //       client_id: "da1cdf02-14b1-465d-9144-8f70393d9ac3",
  //       client_secret: "W!dts!Wj)Ud~86Ws",
  //     });
  //     request.onload = () => {
  //       if (request.status === 200) {
  //         const obj = JSON.parse(request.responseText);
  //         resolve(obj.access_token);
  //       } else {
  //         reject(new Error("Failed to get access token"));
  //       }
  //     };
  //     request.send(post_data);
  //   });
  // };

  // const requestQueueItems = (accessToken) => {
  //   const promises = body.map((items) => {
  //     return new Promise((resolve, reject) => {
  //       if (items["First Name"] != null) {
  //         var obj2 = {
  //           itemData: {
  //             Reference: "wn-" + items["Mbr No"],
  //             Priority: "Normal",
  //             Name: "send_pension_portal_reset_credentials",
  //             DeferDate: null,
  //             DueDate: null,
  //             SpecificContent: {
  //               "Contract Name": items["Contract Name"],
  //               "Branch": items.Branch,
  //               "Mbr No": items["Mbr No"],
  //               "First Name": items["First Name"],
  //               "Last Name": items["Last Name"],
  //               "Email": items.Email,
  //             },
  //           },
  //         };
  //         var request2 = new XMLHttpRequest();
  //         request2.open(
  //           "POST",
  //           "https://cloud.uipath.com/guardkakhock/fatum/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem",
  //           true
  //         );
  //         request2.setRequestHeader("Content-Type", "application/json");
  //         request2.setRequestHeader("X-UIPATH-OrganizationUnitId", "197485");
  //         request2.setRequestHeader("Authorization", "Bearer " + accessToken);
  //         request2.onload = () => {
  //           if (request2.status === 202) {
  //             resolve();
  //           } else {
  //             reject(new Error("Failed to add queue item"));
  //           }
  //         };
  //         var post_data2 = JSON.stringify(obj2);
  //         request2.send(post_data2);
  //       }
  //       else {
  //         var obj2 = {
  //           itemData: {
  //             Reference: "wg-" + items["Cont No"],
  //             Priority: "Normal",
  //             Name: "send_pension_portal_reset_credentials",
  //             DeferDate: null,
  //             DueDate: null,
  //             SpecificContent: {
  //               "Nameid Emp": items["Nameid Emp"],
  //               "Scheme Name": items["Scheme Name"],
  //               Branch: items.Branch,
  //               Emaildata: items.Emaildata,
  //             },
  //           },
  //         };
  //         var request2 = new XMLHttpRequest();
  //         request2.open(
  //           "POST",
  //           "https://cloud.uipath.com/guardkakhock/fatum/orchestrator_/odata/Queues/UiPathODataSvc.AddQueueItem",
  //           true
  //         );
  //         request2.setRequestHeader("Content-Type", "application/json");
  //         request2.setRequestHeader("X-UIPATH-OrganizationUnitId", "197485");
  //         request2.setRequestHeader("Authorization", "Bearer " + accessToken);
  //         request2.onload = () => {
  //           if (request2.status === 202) {
  //             resolve();
  //           } else {
  //             reject(new Error("Failed to add queue item"));
  //           }
  //         };
  //         var post_data2 = JSON.stringify(obj2);
  //         request2.send(post_data2);
  //       }
  //     });
  //   });

  //   return Promise.all(promises);
  // };

  // requestAccessToken()
  //   .then((accessToken) => requestQueueItems(accessToken))
  //   .then(() => {
  //     res.json({ status: "202" });
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error.message);
  //     res.status(500).json({ error: error.message });
  //   });
});

function store_data(info, name_u, type, Aamount) {

  const config = {
    user: 'uipath_sql',
    password: 'TheGu@rd1an',
    server: 'CWCURDCDBP01',
    database: 'Hulptabellen',
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  };

  // Connect to the database
  sql.connect(config)
    .then(pool => {
      console.log('Connected to database');

      // Sample data to be inserted
      const userData = { name: name_u, amountA: Aamount, type_: type, anumbers: JSON.stringify(info) };

      // Create a new request object
      const request = pool.request();

      // Insert data into a table
      request.query`INSERT INTO dbo.tbl__PP_logs_tst (Users, Amount_Anumber,Type,Anumber_json) VALUES (${userData.name}, ${userData.amountA},${userData.type_}, ${userData.anumbers})`
        .then(result => {
          console.log('Data inserted successfully.');
        })
        .catch(err => {
          console.error('Error inserting data: ', err);
        });
    })
    .catch(err => {
      console.error('Error connecting to database: ', err);
    });
}

app.post("/login_cred", async (req, res) => {
  const { username, password } = req.body;
  fs.readFile('./public/json/users.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    // Parse JSON data
    const users = JSON.parse(data);

    // Function to find user by username and password
    function findUser(username, password) {
      return users.find(user => user.username === username && user.password === password);
    }

    const user = findUser(username, password);

    if (user) {
      res.json({ status: "202", data: user });
    } else {
      res.json({ status: "404", msg: "User not found or incorrect password." });
    }
  });
});

// Routes
app.use(require("./routes"));
app.use(express.static(path.join(__dirname, "public")));

// const server = http.createServer(app);

app.set("port", process.env.PORT || 5002);

server.listen(app.get("port"), () => {
  console.log("server on port", app.get("port"));
});