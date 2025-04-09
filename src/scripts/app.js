"use strict"

const searchBar = document.getElementById("searchBar");
const suggestionsBox = document.getElementById("suggestions");
const resultBox = document.getElementById("result");

const API_BASE = "https://web.mayfly.ovh/proxy/movie.php?endpoint=";

searchBar.addEventListener("input", async () => {
  const query = searchBar.value.trim();

  if (query.length < 3) {
    suggestionsBox.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}search/movie?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    suggestionsBox.innerHTML = "";

    if (data.results && data.results.length > 0) {
    data.results.slice(0, 5).forEach(film => {
        const div = document.createElement("div");
        div.className = "suggestion";
        div.textContent = film.title;
        div.addEventListener("click", () => {
        searchBar.value = film.title;
        suggestionsBox.innerHTML = "";
        afficherFilm(film.id);
        });
        suggestionsBox.appendChild(div);
    });
} else {
  // Aucune suggestion trouvée, on vide la zone
  suggestionsBox.innerHTML = "";
}
  } catch (err) {
    console.error("Erreur lors de la recherche :", err);
  }
});

searchBar.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    rechercherFilmParTitre(searchBar.value);
    suggestionsBox.innerHTML = "";
  }
});

async function rechercherFilmParTitre(titre) {
  try {
    const res = await fetch(`${API_BASE}search/movie?query=${encodeURIComponent(titre)}`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      afficherFilm(data.results[0].id);
    } else {
      resultBox.innerHTML = "<p>Film non trouvé.</p>";
    }
  } catch (err) {
    console.error("Erreur de recherche par titre :", err);
    resultBox.innerHTML = "<p>Erreur lors de la recherche.</p>";
  }
}

async function afficherFilm(id) {
  try {
    const res = await fetch(`${API_BASE}movie/${id}`);
    const film = await res.json();

    resultBox.innerHTML = `
      <h2>${film.title} (${film.release_date?.split("-")[0] ?? "Année inconnue"})</h2>
      <p><strong>Langue originale :</strong> ${film.original_language}</p>
      <p><strong>Résumé :</strong> ${film.overview}</p>
      ${film.poster_path ? `<img src="https://image.tmdb.org/t/p/w300${film.poster_path}" alt="${film.title}">` : ""}
      <pre>${JSON.stringify(film, null, 2)}</pre>
    `;
  } catch (err) {
    console.error("Erreur d'affichage du film :", err);
    resultBox.innerHTML = "<p>Impossible de récupérer les détails du film.</p>";
  }
}
