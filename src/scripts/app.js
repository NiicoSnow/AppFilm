const searchBar = document.getElementById("searchBar");
const suggestionsBox = document.getElementById("suggestions");
const resultBox = document.getElementById("result");
const pagination = document.getElementById("pagination");
const pageInfo = document.getElementById("pageInfo");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");

const API_BASE = "https://web.mayfly.ovh/proxy/movie.php?endpoint=";

let currentPage = 1;
let currentQuery = "";
let totalPages = 1;

document.getElementById("sortSelect").addEventListener("change", () => {
    chercherFilms(currentQuery, currentPage); // Recharge la page actuelle avec le nouveau tri
  });

// Gérer l’input de recherche
searchBar.addEventListener("input", () => {
  const query = searchBar.value.trim();
  if (query.length < 3) {
    suggestionsBox.innerHTML = "";
    pagination.style.display = "none";
    return;
  }
  chercherFilms(query, 1);
});

// Rechercher films avec pagination
async function chercherFilms(query, page = 1) {
    try {
      const endpoint = `search/movie?query=${encodeURIComponent(query)}&page=${page}`;
      const res = await fetch(`${API_BASE}${encodeURIComponent(endpoint)}`);
      const data = await res.json();
  
      currentQuery = query;
      currentPage = data.page;
      totalPages = data.total_pages;
  
      afficherSuggestions(data.results);
  
      // Gestion pagination
      pagination.style.display = totalPages > 1 ? "block" : "none";
      pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
      prevPageBtn.disabled = currentPage === 1;
      nextPageBtn.disabled = currentPage === totalPages;
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
    }
  }

// Afficher suggestions (avec titre + année)
function afficherSuggestions(results) {
    suggestionsBox.innerHTML = "";
  
    if (!results || results.length === 0) return;
  
    const sortValue = document.getElementById("sortSelect").value;
  
    // 🔀 Appliquer le tri choisi
    if (sortValue === "alpha") {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === "date") {
      results.sort((a, b) => {
        const dateA = new Date(a.release_date || "1900-01-01");
        const dateB = new Date(b.release_date || "1900-01-01");
        return dateB - dateA;
      });
    } else if (sortValue === "note") {
      results.sort((a, b) => b.vote_average - a.vote_average);
    }
  
    results.forEach(film => {
      const div = document.createElement("div");
      const releaseYear = film.release_date ? film.release_date.split("-")[0] : "Année inconnue";
      div.className = "suggestion";
      div.textContent = `${film.title} (${releaseYear})`;
      div.addEventListener("click", () => {
        searchBar.value = film.title;
        suggestionsBox.innerHTML = "";
        pagination.style.display = "none";
        afficherFilm(film.id);
      });
      suggestionsBox.appendChild(div);
    });
  }

// Clic sur touche Entrée : on lance la recherche page 1
searchBar.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const query = searchBar.value.trim();
    if (query.length >= 3) {
      chercherFilms(query, 1);
    }
  }
});

// Boutons pagination
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    chercherFilms(currentQuery, currentPage - 1);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    chercherFilms(currentQuery, currentPage + 1);
  }
});

// Afficher les infos détaillées d’un film
async function afficherFilm(id) {
    try {
      const res = await fetch(`${API_BASE}movie/${id}`);
      const film = await res.json();
  
      const releaseYear = film.release_date ? film.release_date.split("-")[0] : "Année inconnue";
      const genres = film.genres?.map(g => g.name).join(", ") || "Non spécifié";
      const langue = film.original_language || "N/A";
      const note = film.vote_average ? `${film.vote_average} / 10 (${film.vote_count} votes)` : "Non noté";
      const duree = film.runtime ? `${film.runtime} minutes` : "Durée inconnue";
  
      resultBox.innerHTML = `
        <h2>${film.title} (${releaseYear})</h2>
        <p><strong>Langue originale :</strong> ${langue}</p>
        <p><strong>Genres :</strong> ${genres}</p>
        <p><strong>Durée :</strong> ${duree}</p>
        <p><strong>Note :</strong> ${note}</p>
        <p><strong>Résumé :</strong> ${film.overview || "Pas de synopsis disponible."}</p>
        ${film.backdrop_path ? `<img src="https://image.tmdb.org/t/p/w780${film.backdrop_path}" alt="Backdrop" style="width:100%; border-radius: 8px; margin-bottom: 10px;">` : ""}
        ${film.poster_path ? `<img src="https://image.tmdb.org/t/p/w300${film.poster_path}" alt="Affiche">` : ""}
      `;
    } catch (err) {
      console.error("Erreur d'affichage du film :", err);
      resultBox.innerHTML = "<p>Impossible de récupérer les détails du film.</p>";
    }  
}
