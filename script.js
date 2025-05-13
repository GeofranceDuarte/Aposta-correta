const apiKey = "8f612f2a4bb97e35422cf82fb9b7041f";
const gamesContainer = document.getElementById("gamesContainer");

async function fetchLiveMatches() {
  gamesContainer.innerHTML = "Carregando jogos...";

  const url = "https://v3.football.api-sports.io/fixtures?live=all";
  const headers = {
    "x-apisports-key": apiKey
  };

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log("Resposta da API:", data); // Ajuda a depurar

    const filtered = data.response.filter(f => {
      const goals = f.goals;
      if (!goals || goals.home === null || goals.away === null) return false;
      const diff = Math.abs(goals.home - goals.away);
      return diff === 2;
    });

    gamesContainer.innerHTML = "";

    if (filtered.length === 0) {
      gamesContainer.innerHTML = "Nenhum jogo com os critérios no momento.";
      return;
    }

    filtered.forEach(game => {
      const { home, away } = game.teams;
      const { home: gHome, away: gAway } = game.goals;
      const status = game.fixture.status;
      const odds = (Math.random() * (1.15 - 1.03) + 1.03).toFixed(2); // Simulando odds

      const statusIcon = getStatusIcon(status.short);
      const statusText = status.long;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="teams">
          <span class="team-home">${home.name}</span>
          <span class="team-away">${away.name}</span>
        </div>
        <div class="score">${gHome} - ${gAway}</div>
        <div class="odds">Odd Simulada: ${odds}</div>
        <div class="status">
          <i class="${statusIcon}"></i> ${statusText}
        </div>
      `;

      gamesContainer.appendChild(card);
    });

  } catch (err) {
    gamesContainer.innerHTML = "Erro ao buscar os jogos.";
    console.error(err);
  }
}

function getStatusIcon(short) {
  switch (short) {
    case "1H": return "fas fa-clock";
    case "2H": return "fas fa-stopwatch";
    case "HT": return "fas fa-mug-hot";
    case "FT": return "fas fa-flag-checkered";
    case "NS": return "fas fa-hourglass-start";
    default:   return "fas fa-info-circle";
  }
}

fetchLiveMatches();
setInterval(fetchLiveMatches, 60000);

