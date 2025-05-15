const apiKey = "8f612f2a4bb97e35422cf82fb9b7041f";
const gamesContainer = document.getElementById("gamesContainer");
const noGamesContainer = document.getElementById("noGamesContainer"); // <-- PEGANDO O BLOCO

async function fetchLiveMatches() {
  gamesContainer.innerHTML = "Carregando jogos...";
  noGamesContainer.style.display = "none"; // Oculta mensagem enquanto carrega

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
      noGamesContainer.style.display = "flex"; // Exibe animação e mensagem
      return;
    }

    noGamesContainer.style.display = "none"; // Oculta se houver jogos

    filtered.forEach(game => {
      const { home, away } = game.teams;
      const { home: gHome, away: gAway } = game.goals;
      const status = game.fixture.status;
      const league = game.league;
      const odds = parseFloat((Math.random() * (1.15 - 1.02) + 1.02)).toFixed(2);
      const stats = game.statistics || [];

      const time = status.elapsed ? `${status.elapsed}'` : "Aguarde...";

      const yellowCardsHome = stats.find(stat => stat.team.id === home.id && stat.type === "Yellow Cards")?.value || 0;
      const yellowCardsAway = stats.find(stat => stat.team.id === away.id && stat.type === "Yellow Cards")?.value || 0;
      const redCardsHome = stats.find(stat => stat.team.id === home.id && stat.type === "Red Cards")?.value || 0;
      const redCardsAway = stats.find(stat => stat.team.id === away.id && stat.type === "Red Cards")?.value || 0;
      const possessionHome = stats.find(stat => stat.team.id === home.id && stat.type === "Possession")?.value || 0;
      const possessionAway = stats.find(stat => stat.team.id === away.id && stat.type === "Possession")?.value || 0;
      const shotsHome = stats.find(stat => stat.team.id === home.id && stat.type === "Shots")?.value || 0;
      const shotsAway = stats.find(stat => stat.team.id === away.id && stat.type === "Shots")?.value || 0;

      const statusIcon = getStatusIcon(status.short);
      const statusText = status.long;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="league">
          <img src="${league.logo}" alt="Logo da liga">
          ${league.name} - ${league.country}
        </div>
        <div class="teams">
          <span class="team-home">${home.name}</span>
          <span class="team-away">${away.name}</span>
        </div>
        <div class="score">${gHome} - ${gAway}</div>
        <div class="odds">🎯 Odd Simulada: <strong>${odds}</strong></div>
        <div class="status" title="${statusText}">
          <i class="${statusIcon}"></i> ${statusText} - ${time}
        </div>
        <div class="game-stats">
          <p><strong>Cartões Amarelos:</strong> ${home.name}: ${yellowCardsHome} | ${away.name}: ${yellowCardsAway}</p>
          <p><strong>Cartões Vermelhos:</strong> ${home.name}: ${redCardsHome} | ${away.name}: ${redCardsAway}</p>
          <p><strong>Posse de Bola:</strong> ${home.name}: ${possessionHome}% | ${away.name}: ${possessionAway}%</p>
          <p><strong>Finalizações:</strong> ${home.name}: ${shotsHome} | ${away.name}: ${shotsAway}</p>
        </div>
      `;

      gamesContainer.appendChild(card);
    });

  } catch (err) {
    gamesContainer.innerHTML = "Erro ao buscar os jogos.";
    noGamesContainer.style.display = "none";
    console.error(err);
  }
}

function getStatusIcon(short) {
  switch (short) {
    case "1H": return "fas fa-clock";            // Primeiro tempo
    case "2H": return "fas fa-stopwatch";        // Segundo tempo
    case "HT": return "fas fa-mug-hot";          // Intervalo
    case "FT": return "fas fa-flag-checkered";   // Encerrado
    case "NS": return "fas fa-hourglass-start";  // Ainda não começou
    default:   return "fas fa-info-circle";
  }
}

fetchLiveMatches();
setInterval(fetchLiveMatches, 60000);
