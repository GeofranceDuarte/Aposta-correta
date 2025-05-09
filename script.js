
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

    const filtered = data.response.filter(f => {
      const goals = f.goals;
      if (!goals || goals.home === null || goals.away === null) return false;
      const diff = Math.abs(goals.home - goals.away);
      return diff === 2;
    });

    gamesContainer.innerHTML = "";

    filtered.forEach(game => {
      const { home, away } = game.teams;
      const { home: gHome, away: gAway } = game.goals;
      const odds = (Math.random() * (1.15 - 1.03) + 1.03).toFixed(2); // Simulando odds

      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${home.name} vs ${away.name}</h3>
        <p><strong>Placar:</strong> ${gHome} - ${gAway}</p>
        <p><strong>Odd Simulada:</strong> ${odds}</p>
        <p><strong>Status:</strong> ${game.fixture.status.long}</p>
      `;
      gamesContainer.appendChild(div);
    });

    if (filtered.length === 0) {
      gamesContainer.innerHTML = "Nenhum jogo com os critérios no momento.";
    }
  } catch (err) {
    gamesContainer.innerHTML = "Erro ao buscar os jogos.";
    console.error(err);
  }
}

fetchLiveMatches();
setInterval(fetchLiveMatches, 60000);
