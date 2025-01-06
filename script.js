// Hämta API-nycklar från local storage
const spaceId = localStorage.getItem("space_id");
const accessToken = localStorage.getItem("access_token");

// Kontrollera att API-nycklar finns
if (!spaceId || !accessToken) {
  document.getElementById("artist-list").innerHTML =
    "<p>API-nycklar saknas. Kontrollera att space_id och access_token är lagrade korrekt.</p>";
} else {
  // Bas-URL för Contentful API
  const API_URL = `https://cdn.contentful.com/spaces/${spaceId}/entries?access_token=${accessToken}&content_type=artist`;

  async function fetchArtists() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Nätverksfel: ${response.status}`);
      }

      const data = await response.json();
      displayArtists(data);
    } catch (error) {
      console.error("Fel vid hämtning av data:", error);
      document.getElementById("artist-list").innerHTML =
        "<p>Ett fel uppstod vid hämtning av data.</p>";
    }
  }

  function displayArtists(data) {
    const artistList = document.getElementById("artist-list");
    artistList.innerHTML = ""; // Töm listan innan ny data läggs in

    if (!data.items || data.items.length === 0) {
      artistList.innerHTML = "<p>Inga artister hittades.</p>";
      return;
    }

    const included = data.includes?.Entry || [];
    const lookup = {};

    // Skapa ett lookup-objekt för relaterade data (genre, scen, dag)
    included.forEach((item) => {
      lookup[item.sys.id] = item.fields;
    });

    // Loopa igenom varje artist och skapa HTML
    data.items.forEach((artist) => {
      const { name, genre, stage, day, description } = artist.fields;

      // Hämta relaterad data
      const genreName = genre
        ? lookup[genre.sys.id]?.name || "Okänd genre"
        : "Okänd genre";
      const stageName = stage
        ? lookup[stage.sys.id]?.name || "Okänd scen"
        : "Okänd scen";
      const dayData = day ? lookup[day.sys.id] || null : null;
      const dayDate = dayData ? dayData.date || "" : "";

      // Formatera datumet
      let formattedDate = "";
      if (dayDate) {
        const dateObj = new Date(dayDate);
        const options = {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        };
        formattedDate = dateObj.toLocaleDateString("sv-SE", options);
      }

      // Skapa HTML med template literals
      const artistHTML = `
            <div class="artist-card">
              <h2>${name}</h2>
              <p><strong>Genre:</strong> ${genreName}</p>
              <p><strong>Scen:</strong> ${stageName}</p>
              <p><strong>Dag:</strong> ${formattedDate || "Okänt datum"}</p>
              <p><strong>Beskrivning:</strong> ${
                description || "Ingen beskrivning tillgänglig."
              }</p>
            </div>
          `;

      artistList.innerHTML += artistHTML;
    });
  }

  // Anropa funktionen för att hämta artister när sidan laddas
  fetchArtists();
}
