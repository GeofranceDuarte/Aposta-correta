// script.js atualizado para manter o layout original e exibir jogos com exatamente 2 gols de diferença

const apiKey = "e1db2069903286a3b62359e4450f69fd";
const gamesContainer = document.getElementById("gamesContainer");
const noGamesContainer = document.getElementById("noGamesContainer");

function getMatchPeriod(minutes) {
  if (minutes <= 45) return "1º Tempo";
  if (minutes > 45 && minutes <= 60) return "Intervalo";
  return "2º Tempo";
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

async function fetchLiveMatches() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 0 && hour < 8) {
    gamesContainer.innerHTML = "⚠️ A plataforma está disponível das 08h às 23h.";
    return;
  }

  gamesContainer.innerHTML = "<div class='loading-animation'><span></span><span></span><span></span></div>";
  noGamesContainer.style.display = "none";

  try {
    const response = await fetch(`https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${apiKey}`);

    if (!response.ok) throw new Error("Erro ao buscar dados da API");

    const data = await response.json();

    const filteredGames = data.filter(game => {
      if (!game.scores || game.status !== "live") return false;

      const homeScore = game.scores[0]?.score;
      const awayScore = game.scores[1]?.score;
      if (homeScore == null || awayScore == null) return false;

      return Math.abs(homeScore - awayScore) === 2;
    });

    if (filteredGames.length === 0) {
      gamesContainer.innerHTML = "";
      noGamesContainer.style.display = "flex";
      return;
    }

    gamesContainer.innerHTML = "";
    filteredGames.forEach(game => {
      const home = game.home_team;
      const away = game.away_team;
      const homeScore = game.scores[0]?.score ?? "-";
      const awayScore = game.scores[1]?.score ?? "-";
      const league = game.sport_nice;
      const commenceTime = new Date(game.commence_time);
      const timeElapsed = Math.floor((Date.now() - commenceTime.getTime()) / 60000);
      const matchPeriod = getMatchPeriod(timeElapsed);

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="league"><i class="fas fa-futbol"></i> ${league}</div>
        <div class="teams">
          <span class="team-home">${home}</span>
          <span class="team-away">${away}</span>
        </div>
        <div class="score">${homeScore} - ${awayScore}</div>
        <div class="status"><i class="fas fa-clock"></i> Ao Vivo - ${matchPeriod} (${timeElapsed} min)</div>
      `;

      gamesContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Erro ao carregar jogos:", error);
    gamesContainer.innerHTML = "Erro ao carregar os jogos. Tente novamente mais tarde.";
    noGamesContainer.style.display = "none";
  }
}

fetchLiveMatches();
setInterval(fetchLiveMatches, 50 * 60 * 1000);
