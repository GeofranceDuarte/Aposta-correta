const apiKey = "8f612f2a4bb97e35422cf82fb9b7041f";
const gamesContainer = document.getElementById("gamesContainer");

async function fetchLiveMatches() {
  gamesContainer.innerHTML = `
    <div style="text-align:center;">
      <i class="fas fa-spinner fa-spin"></i> Carregando jogos ao vivo...
    </div>
  `;

  const url = "https://v3.football.api-sports.io/fixtures?live=all";
  const headers = {
    "x-apisports-key": apiKey
  };

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log("Resposta da API:", data);

    const filtered = data.response.filter(f => {
      const goals = f.goals;
      if (!goals || goals.home === null || goals.away === null) return false;
      const diff = Math.abs(goals.home - goals.away);
      return diff === 2;
    });

    gamesContainer.innerHTML = "";

    if (filtered.length === 0) {
      gamesContainer.innerHTML = `
        <div style="text-align:center; color: #ccc;">
          <i class="fas fa-info-circle"></i> Nenhum jogo com 2 gols de diferença no momento.
        </div>
      `;
      return;
    }

    filtered.forEach(game => {
      const { home, away } = game.teams;
      const { home: gHome, away: gAway } = game.goals;
      const status = game.fixture.status;
      const odds = parseFloat((Math.random() * (1.15 - 1.03) + 1.03)).toFixed(2);

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
        <div class="odds">🎯 Odd Simulada: <strong>${odds}</strong></div>
        <div class="status" title="${statusText}">
          <i class="${statusIcon}"></i> ${statusText}
        </div>
      `;

      gamesContainer.appendChild(card);
    });

  } catch (err) {
    gamesContainer.innerHTML = `
      <div style="text-align:center; color: #e74c3c;">
        <i class="fas fa-exclamation-triangle"></i> Erro ao buscar os jogos.
      </div>
    `;
    console.error(err);
  }
}

function getStatusIcon(short) {
  switch (short) {
    case "1H": return "fas fa-clock"; // 1º tempo
    case "2H": return "fas fa-stopwatch"; // 2º tempo
    case "HT": return "fas fa-mug-hot"; // intervalo
    case "FT": return "fas fa-flag-checkered"; // finalizado
    case "NS": return "fas fa-hourglass-start"; // ainda não começou
    default:   return "fas fa-info-circle";
  }
}

// Primeira carga + atualização a cada 60s
fetchLiveMatches();
setInterval(fetchLiveMatches, 60000);
