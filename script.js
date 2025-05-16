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

  const url = `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      noGamesContainer.style.display = "flex";
      gamesContainer.innerHTML = "";
      return;
    }

    const filtered = data.filter(game => {
      const homeScore = game.scores?.[0]?.score;
      const awayScore = game.scores?.[1]?.score;

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
      const home = game.home_team || "Time da Casa";
      const away = game.away_team || "Time Visitante";
      const homeScore = game.scores?.[0]?.score ?? "-";
      const awayScore = game.scores?.[1]?.score ?? "-";
      const league = game.sport_title || "Liga Desconhecida";
      const commenceTime = new Date(game.commence_time);
      const timeElapsed = Math.floor((Date.now() - commenceTime.getTime()) / 60000);
      const matchPeriod = getMatchPeriod(timeElapsed);
      const simulatedOdd = (Math.random() * (1.15 - 1.03) + 1.03).toFixed(2);

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="league">
          <i class="fas fa-trophy"></i> ${league}
        </div>
        <div class="teams">
          <span class="team-home">${home}</span>
          <span class="team-away">${away}</span>
        </div>
        <div class="score">${homeScore} - ${awayScore}</div>
        <div class="status">
          <i class="fas fa-play-circle"></i> ${matchPeriod} (${timeElapsed} min)
        </div>
        <div class="odds">🎯 Odd Simulada: ${simulatedOdd}</div>
        <div class="stats">
          <span><strong>Início:</strong> ${formatDate(game.commence_time)}</span>
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
setInterval(fetchLiveMatches, 10 * 60 * 1000); // atualiza a cada 10 minutos
