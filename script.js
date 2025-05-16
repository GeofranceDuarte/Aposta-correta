const apiFootballKey = "8f612f2a4bb97e35422cf82fb9b7041f"; // API-Football
const oddsApiKey = "e1db2069903286a3b62359e4450f69fd"; // The Odds API

const gamesContainer = document.getElementById("gamesContainer");
const noGamesContainer = document.getElementById("noGamesContainer");

async function fetchLiveMatches() {
  gamesContainer.innerHTML = "<div class='loading-animation'><span></span><span></span><span></span></div>";
  noGamesContainer.style.display = "none";

  try {
    // 1. Buscar jogos ao vivo com placar
    const liveRes = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": apiFootballKey }
    });

    const liveData = await liveRes.json();
    const allGames = liveData.response;

    const gamesWith2GoalDiff = allGames.filter(g => {
      const homeGoals = g.goals.home;
      const awayGoals = g.goals.away;
      return Math.abs(homeGoals - awayGoals) === 2;
    });

    if (gamesWith2GoalDiff.length === 0) {
      gamesContainer.innerHTML = "";
      noGamesContainer.style.display = "flex";
      return;
    }

    // 2. Buscar odds da The Odds API
    const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${oddsApiKey}`);
    const oddsData = await oddsRes.json();

    gamesContainer.innerHTML = "";

    gamesWith2GoalDiff.forEach(game => {
      const home = game.teams.home.name;
      const away = game.teams.away.name;
      const homeGoals = game.goals.home;
      const awayGoals = game.goals.away;
      const status = game.fixture.status.elapsed;
      const league = game.league.name;

      const winner = homeGoals > awayGoals ? home : away;

      // Procurar odd aproximada
      const oddGame = oddsData.find(o =>
        (o.home_team === home && o.away_team === away) ||
        (o.home_team === away && o.away_team === home)
      );

      let winnerOdd = "N/A";
      if (oddGame && oddGame.bookmakers.length > 0) {
        const h2h = oddGame.bookmakers[0].markets.find(m => m.key === "h2h");
        if (h2h) {
          const outcome = h2h.outcomes.find(o => o.name === winner);
          if (outcome) {
            winnerOdd = outcome.price.toFixed(2);
          }
        }
      }

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="league"><i class="fas fa-futbol"></i> ${league}</div>
        <div class="teams">
          <span class="team-home">${home}</span>
          <span class="team-away">${away}</span>
        </div>
        <div class="score">${homeGoals} - ${awayGoals}</div>
        <div class="status"><i class="fas fa-clock"></i> Ao Vivo - ${status} min</div>
        <div class="odds">Odd para o time vencedor (${winner}): <strong>${winnerOdd}</strong></div>
      `;
      gamesContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    gamesContainer.innerHTML = "Erro ao carregar os jogos.";
  }
}

fetchLiveMatches();
setInterval(fetchLiveMatches, 15 * 60 * 1000); // Atualiza a cada 15 minutos
