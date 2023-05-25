const express = require("express");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000/cricketTeam/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initialize();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 1  For Getting list of all player

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team
    ORDER BY player_id;`;

  const dbResponse = await db.all(getPlayerQuery);
  response.send(
    dbResponse.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API 2 For Post Method Creat new player in the team

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
    INSERT INTO 
    cricket_team (player_id,jersey_number,role)
    VALUE
    (
        ${playerName},
        ${jerseyNumber},
        ${role}
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to team");
});

// API 3 Get Player Based On ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerIdQuery = `
    SELECT 
    *
    FROM cricket_team 
    WHERE player_id = ${playerId};`;

  const player = await db.run(getPlayerIdQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// API 4 Update the detail of player
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerQuery = `
    UPDATE 
    cricket_team
    SET 
    player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    WHERE 
    player_id = ${playerId};`;
  const updateResponse = await updateResponse(updatePlayerQuery);
  response.send(updateResponse);
});

// API 5 Delete the player From table
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQueryForPlayer = `
    DELETE FROM
    cricket_team
    WHERE player_id = ${playerId};`;
  const deleteResponse = await db.run(deleteQueryForPlayer);
  response.send("Player Removed");
});

module.exports = app;
