const apiKey = "e1db2069903286a3b62359e4450f69fd";
const gamesContainer = document.getElementById("gamesContainer");
const noGamesContainer = document.getElementById("noGamesContainer");

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function getMatchPeriod(minutes) {
  if (minutes <= 45) return "1º Tempo";
  if (minutes > 45 && minutes <= 60) return "Intervalo";
  return "2º Tempo";
}

async function fetchLiveMatches() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 0 && hour < 8) {
    console.log("⏰ Fora do horário de requisição (00h - 08h).");
    return;
  }

  gamesContainer.innerHTML = "Carregando jogos...";
  noGamesContainer.style.display = "none";

  const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=us,eu&markets=h2h&oddsFormat=decimal&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      noGamesContainer.style.display = "flex";
      gamesContainer.innerHTML = "";
      return;
    }

    const filtered = data.filter(game => {
      if (game.status !== "live") return false;
      if (!game.scores) return false;

      const homeScore = game.scores[0]?.score;
      const awayScore = game.scores[1]?.score;

      if (homeScore == null || awayScore == null) return false;

      const diff = Math.abs(homeScore - awayScore);
      return diff === 2;
    });

    if (filtered.length === 0) {
      noGamesContainer.style.display = "flex";
      gamesContainer.innerHTML = "";
      return;
    }

    gamesContainer.innerHTML = "";
    noGamesContainer.style.display = "none";

    filtered.forEach(game => {
      const home = game.home_team;
      const away = game.away_team;
      const homeScore = game.scores[0]?.score ?? "-";
      const awayScore = game.scores[1]?.score ?? "-";
      const league = game.sport_nice;
      const commenceTime = new Date(game.commence_time);
      const timeElapsed = Math.floor((Date.now() - commenceTime.getTime()) / 60000);
      const matchPeriod = getMatchPeriod(timeElapsed);

      const simulatedOdd = (Math.random() * (1.20 - 1.02) + 1.02).toFixed(2);

      const card = document.createElement("div");
      card.className = "card";
      card.style.border = "1px solid #ddd";
      card.style.padding = "15px";
      card.style.marginBottom = "15px";
      card.style.borderRadius = "8px";
      card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
      card.style.background = "#fff";
      card.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

      card.innerHTML = `
        <div style="font-weight:bold; font-size: 1.1em; margin-bottom: 5px;">${league}</div>
        <div style="margin-bottom: 10px;">
          <span style="font-weight: 600;">${home}</span> vs <span style="font-weight: 600;">${away}</span>
        </div>
        <div style="font-size: 1.3em; margin-bottom: 8px;">
          <strong>${homeScore} - ${awayScore}</strong>
        </div>
        <div style="margin-bottom: 10px;">
          <span><strong>Status:</strong> Ao Vivo - ${matchPeriod} (${timeElapsed} min)</span><br>
          <span><strong>Início:</strong> ${formatDate(game.commence_time)}</span>
        </div>
        <div style="margin-bottom: 10px;">
          🎯 Odd Simulada: <strong>${simulatedOdd}</strong>
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

fetchLiveMatches();
setInterval(fetchLiveMatches, 50 * 60 * 1000);
