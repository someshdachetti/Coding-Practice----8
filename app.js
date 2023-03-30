let express = require("express");
let { open } = require("sqlite");

let sqlite3 = require("sqlite3");
let path = require("path");

let databasePath = path.join(__dirname, "todoApplication.db");

let app = express();
app.use(express.json());

let DATABASE = null;
let start = async () => {
  try {
    DATABASE = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DATA base ERROR ${e.message}`);
    process.exit(1);
  }
};
start();

const propertityAndStatus = (requestQuary) => {
  return (
    requestQuary.priority !== undefined && requestQuary.status !== undefined
  );
};

const PriorityProperty = (requestQuary) => {
  return requestQuary.priority !== undefined;
};

const STatusProperty = (requestQuary) => {
  return requestQuary.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getting = "";
  const { search_q = "", priority, status } = request.query;

  try {
    switch (true) {
      case propertityAndStatus(request.query):
        getting = `
            SELECT *
            FROM todo
            WHERE
   
            todo LIKE '%${search_q}%'
            AND status = ${status}
            AND priority = ${priority};`;
        break;

      case PriorityProperty(request.query):
        getting = `
            SELECT *
            FROM todo 
            WHERE
            todo like '%${search_q}%'
            AND priority = '${priority}';`;
        break;

      case STatusProperty(request.query):
        getting = `
            SELECT *
            FROM todo
            WHERE
            todo like '%${search_q}%'
            AND status = '${status}';`;
        break;
      default:
        geting = `
            SELECT * FROM todo
            WHERE todo like '%${search_q}%';`;
    }
    data = await DATABASE.all(getting);
    response.send(data);
  } catch (e) {
    console.log(`database error ${e.message}`);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const x = `
    SELECT * FROM todo
    WHERE id = ${todoId};`;

  const xx = await DATABASE.get(x);
  response.send(xx);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  try {
    const inserting = `
    INSERT INTO todo
    (id,todo,priority,status)
    VALUES(

        '${id}',
        '${todo}',
        '${priority}',
        '${status}'
    );`;
    await DATABASE.run(inserting);
    response.send("Todo Successfully Added");
  } catch (e) {
    console.log(`database ERROR ${e.message}`);
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let update = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      update = "Status";
      break;
    case requestBody.priority !== undefined:
      update = "Priority";
      break;
    case requestBody.todo !== undefined:
      update = "Todo";
      break;
  }
  const perviuosTodo = `
    SELECT * FROM todo
    WHERE id = ${todoId};`;

  const updating = await DATABASE.get(perviuosTodo);

  const {
    todo = updating.todo,
    priority = updating.priority,
    status = updating.status,
  } = request.body;

  const xxx = `
    UPDATE todo
    SET
     todo ='${todo}',
    priority = '${priority}',
    status = '${status}'
    
    WHERE 
    id = ${todoId};`;

  await DATABASE.run(xxx);
  response.send(`${update} updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const zz = `
    DELETE FROM todo
    WHERE id = ${todoId};`;

  await DATABASE.run(zz);
  response.send("Todo Deleted");
});
