function dexEntries() {
  $.ajax({
    method: "GET",
    url: "http://127.0.0.1:6969/pokedex",
  }).done(function (dex) {
    var tableBody = document.querySelector("#pokedex");

    //sort by dex number
    var dexArray = dex.sort((a, b) => {
      var numberA = a.pokedex_id;
      var numberB = b.pokedex_id;
      return numberA - numberB;
    });
    console.log(dexArray);
    //loop through dex and output data
    dexArray.forEach(function (item) {
      var row = document.createElement("tr");

      var dexIDCell = document.createElement("td");
      dexIDCell.textContent = item.pokedex_id; //dex number

      var imgCell = document.createElement("td");
      var pkmImg = document.createElement("img");
      imgCell.appendChild(pkmImg);
      var cleanedPokemonName = item.name
        .replaceAll("'", "")
        .replaceAll("♀", "_F")
        .replaceAll("♂", "_M");
      pkmImg.src = "./sprites/pokemon/" + cleanedPokemonName + ".png";
      pkmImg.width = "50";

      var nameCell = document.createElement("td");
      nameCell.textContent = item.name; //pokemon name

      var locationCell = document.createElement("td");
      if (item.encounters.length > 0) {
        var groupedEncounters = {};

        item.encounters.forEach((encounter) => {
          if (groupedEncounters[encounter.location]) {
            // If encounter location exists in groupedEncounters, append encounter details
            groupedEncounters[encounter.location].push(encounter);
          } else {
            // Otherwise, create a new entry in groupedEncounters
            groupedEncounters[encounter.location] = [encounter];
          }
        });

        // Iterate over grouped encounters and create elements
        Object.keys(groupedEncounters).forEach((location) => {
          var encounters = groupedEncounters[location];
          console.log(encounters);
          // Create pillbadge for each location it can be found on
          var div = document.createElement("div");
          var pill = document.createElement("span");
          pill.classList.add("badge");
          pill.classList.add("badge-pill");
          pill.style.margin = "0.5em";
          pill.textContent = location;
          pill.setAttribute("data-toggle", "dropdown");

          // dropdown solution
          div.classList.add("dropdown");
          div.classList.add("with-arrow");
          div.classList.add("toggle-on-hover");
          var dropdown = document.createElement("div");
          dropdown.classList.add("dropdown-menu");
          dropdown.style.padding = "0";

          // Create a table for the dropdown
          const table = document.createElement("table");
          const headerRow = document.createElement("tr");
          const methodHeader = document.createElement("th");
          methodHeader.textContent = "Method";
          headerRow.appendChild(methodHeader);
          const levelsHeader = document.createElement("th");
          levelsHeader.textContent = "Levels";
          headerRow.appendChild(levelsHeader);
          const rateHeader = document.createElement("th");
          rateHeader.textContent = "Rate";
          headerRow.appendChild(rateHeader);
          table.appendChild(headerRow);
          table.style.marginLeft = "1em";
          table.style.marginRight = "1em";
          table.style.tableLayout = "auto";

          // Set values for each encounter
          encounters.forEach((encounter) => {
            const valuesRow = document.createElement("tr");
            const methodCell = document.createElement("td");
            methodCell.style.whiteSpace = "nowrap";
            methodCell.textContent = getMethod(encounter.encounter_type);
            const levelsCell = document.createElement("td");
            levelsCell.style.whiteSpace = "nowrap";
            levelsCell.textContent = encounter.levels;
            const rateCell = document.createElement("td");
            rateCell.style.whiteSpace = "nowrap";
            rateCell.textContent = encounter.rate;
            valuesRow.appendChild(methodCell);
            valuesRow.appendChild(levelsCell);
            valuesRow.appendChild(rateCell);
            table.appendChild(valuesRow);
          });

          dropdown.appendChild(table);
          div.appendChild(pill);
          div.appendChild(dropdown);
          locationCell.appendChild(div);
        });
      } else {
        locationCell.textContent = "";
      }

      // append the cells to the row
      row.appendChild(dexIDCell);
      row.appendChild(imgCell);
      row.appendChild(nameCell);
      row.appendChild(locationCell);

      //add the row to the table #pokedex
      tableBody.appendChild(row);
    });
  });
}

dexEntries();

//mess tbh, but it formats the encounter type nicer
function getMethod(method) {
  switch (method) {
    case "walking":
      return "Walking";
    case "walk":
      return "Walking";
    case "fishing_old":
      return "Old Rod";
    case "fishing_good":
      return "Good Rod";
    case "fishing_super":
      return "Super Rod";
    case "special":
      return "Special Encounter";
    case "deepsand":
      return "Deep Sand";
    case "rocksmash":
      return "Rock Smash";
    case "surfing":
      return "Surfing";
    case "surf":
      return "Surfing";
    case "grass":
      return "Grass";
    case "swarm":
      return "Swarm";
    case "trade":
      return "Trade";
    case "gift":
      return "Gift";
    case "roam":
      return "Roaming";
    case "underwater":
      return "Dive Underwater";
    case "wailmerpail":
      return "Wailmer Pail";
    case "hidden":
      return "Hidden";
    case "starter":
      return "Starter";
  }
}

// todo - get game / fps / encounter rate / encounter phase # / ttl encounter / # shiny caught
// get info from stats
function stats_info() {
  $.ajax({
    method: "GET",
    url: "http://127.0.0.1:6969/stats",
    crossDomain: true,
    dataType: "json",
    format: "json",
    timeout: 50,
  }).done(function (stats) {
    $("#nav_stat_phase").text(
      stats["totals"]["phase_encounters"].toLocaleString()
    );
    $("#nav_stat_total").text(stats["totals"]["encounters"].toLocaleString());
    $("#nav_stat_shiny").text(
      stats["totals"]["shiny_encounters"].toLocaleString()
    );
  });
}

// get info from emulator for game / fps
function emu_info() {
  $.ajax({
    method: "GET",
    url: "http://127.0.0.1:6969/emu_info",
    crossDomain: true,
    dataType: "json",
    format: "json",
    timeout: 50,
  }).done(function (emu_info) {
    $("#nav_emu_info").text(
      emu_info["detectedGame"] + " | " + emu_info["emuFPS"] + "fps"
    );
  });
}

// encounter log for encounters/hr
function encounter_log() {
  $.ajax({
    method: "GET",
    url: "http://127.0.0.1:6969/encounter_log",
    crossDomain: true,
    dataType: "json",
    format: "json",
    timeout: 50,
  }).done(function (encounter_log) {
    reverse_encounter_log = encounter_log["encounter_log"].reverse();
    if (encounter_log["encounter_log"][50]) {
      var range = moment(reverse_encounter_log[0]["time_encountered"])
        .subtract(moment(reverse_encounter_log[10]["time_encountered"]))
        .format("x");
      $("#encounters_hour").text(
        Math.round((60 / (range / 1000 / 60)) * 10).toLocaleString() + "/h"
      );
    } else {
      $("#encounters_hour").text("-");
    }
  });
}
// needed for encounters/hr calculation,
// phase encounters/total encounters/shinys
window.setInterval(function () {
  encounter_log();
  stats_info();
  emu_info();
}, 1000);
