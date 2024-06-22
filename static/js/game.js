console.log("Running Game")

// Make get request for base case

const request = new Request("/api/map_generation", {
    method: "GET",
  });

fetch(request)
  .then((response) => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error("Something went wrong on API server!");
    }
  })
  .then((response) => {
    // console.log(response);
    const map = document.getElementById("map");

    response.cells.forEach(row => {
        let xrow = document.createElement("div");
        xrow.className = "tilerow";

        row.forEach(cell => {
            let ycol = document.createElement("div");
            ycol.className = "tile";

            if (cell == "blank") {
                ycol.innerHTML = ""
                ycol.style.background = "#8a5f36";
            } else if (cell == "rock") {
                // ycol.innerHTML = "R"
                ycol.style.background = "grey";
            } else if (cell == "tree") {
                // ycol.innerHTML = "T"
                ycol.style.background = "green";
            } else if (cell == "water") {
                // ycol.innerHTML = "T"
                ycol.style.background = "blue";
            } else {
                ycol.innerHTML = ""
                ycol.style.background = "white";
            }

            xrow.appendChild(ycol);
        })

        map.appendChild(xrow);
    });

  })
  .catch((error) => {
    console.error(error);
  });