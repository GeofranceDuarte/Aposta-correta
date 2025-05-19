const gamesContainer = document.getElementById("gamesContainer");
const noGamesContainer = document.getElementById("noGamesContainer");

// Sua API Key da API-Football
const API_KEY = "22d09fd14e1718437b00944f0f22db6b";

async function fetchLiveMatches() {
  gamesContainer.innerHTML = "Carregando jogos...";
  noGamesContainer.style.display = "none";

  try {
    const res = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY,
      },
    });

    const data = await res.json();

    if (!data.response || data.response.length === 0) {
      gamesContainer.innerHTML = "";
      noGamesContainer.style.display = "flex";
      return;
    }

    // Filtra jogos com diferença de 2 gols e no 2º tempo (segunda etapa)
    const filteredGames = data.response.filter(game => {
      const homeGoals = game.goals.home ?? 0;
      const awayGoals = game.goals.away ?? 0;
      const timeStatus = game.fixture.status.long; // Exemplo: "2nd Half"

      return (
        Math.abs(homeGoals - awayGoals) === 2 &&
        timeStatus.toLowerCase().includes("2nd half")
      );
    });

    if (filteredGames.length === 0) {
      gamesContainer.innerHTML = "";
      noGamesContainer.style.display = "flex";
      return;
    }

    gamesContainer.innerHTML = "";

    for (const game of filteredGames) {
      const home = game.teams.home.name;
      const away = game.teams.away.name;
      const homeGoals = game.goals.home ?? 0;
      const awayGoals = game.goals.away ?? 0;
      const elapsed = game.fixture.status.elapsed ?? 0; // minutos
      const league = game.league.name;
      const leagueFlag = game.league.flag || "fallback-league.png";
      const homeLogo = game.teams.home.logo || "fallback-team.png";
      const awayLogo = game.teams.away.logo || "fallback-team.png";

      const winner = homeGoals > awayGoals ? home : away;

      // Odds não disponíveis via API-Football gratuita
      const winnerOdd = "N/A";

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="league">
          <img src="${leagueFlag}" alt="${league}" class="league-icon" onerror="this.onerror=null;this.src='fallback-league.png'"> ${league}
        </div>
        <div class="teams">
          <span class="team team-home">
            <img src="${homeLogo}" alt="${home}" class="team-icon" onerror="this.onerror=null;this.src='fallback-team.png'"> ${home}
          </span>
          <span class="team team-away">
            <img src="${awayLogo}" alt="${away}" class="team-icon" onerror="this.onerror=null;this.src='fallback-team.png'"> ${away}
          </span>
        </div>
        <div class="score">${homeGoals} - ${awayGoals}</div>
        <div class="status"><i class="fas fa-clock"></i> 2º Tempo - ${elapsed}'</div>
        <div class="odds">Odd para o time vencedor (${winner}): <strong>${winnerOdd}</strong></div>
      `;
      gamesContainer.appendChild(card);
    }

  } catch (error) {
    console.error("Erro ao carregar jogos:", error);
    gamesContainer.innerHTML = "Erro ao carregar os jogos.";
  }
}

fetchLiveMatches();
setInterval(fetchLiveMatches, 6 * 60 * 1000); // Atualiza a cada 6 minutos
