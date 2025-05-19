const gamesContainer = document.getElementById("gamesContainer");
const noGamesContainer = document.getElementById("noGamesContainer");

async function fetchLiveMatches() {
  gamesContainer.innerHTML = "Carregando jogos...";
  noGamesContainer.style.display = "none";

  try {
    const res = await fetch("https://api.sofascore.com/api/v1/sport/football/events/live");
    const data = await res.json();
    const allGames = data.events;

    const filteredGames = allGames.filter(game => {
      const homeGoals = game.homeScore.current ?? 0;
      const awayGoals = game.awayScore.current ?? 0;
      const timePeriod = game.time.period;
      return Math.abs(homeGoals - awayGoals) === 2 && timePeriod === "SECOND_HALF";
    });

    if (filteredGames.length === 0) {
      gamesContainer.innerHTML = "";
      noGamesContainer.style.display = "flex";
      return;
    }

    gamesContainer.innerHTML = "";

    for (const game of filteredGames) {
      const home = game.homeTeam.name;
      const away = game.awayTeam.name;
      const homeGoals = game.homeScore.current ?? 0;
      const awayGoals = game.awayScore.current ?? 0;
      const status = game.time.current;
      const league = game.tournament.name;
      const leagueImg = `https://api.sofascore.app/api/v1/unique-tournament/${game.tournament.uniqueTournament.slug}/image`;

      const homeImg = `https://api.sofascore.app/api/v1/team/${game.homeTeam.id}/image`;
      const awayImg = `https://api.sofascore.app/api/v1/team/${game.awayTeam.id}/image`;

      const winner = homeGoals > awayGoals ? home : away;

      // Odds
      let winnerOdd = "N/A";
      try {
        const oddsUrl = `https://api.digitalsport24.com/v1/widget/event-odds?eventId=${game.id}`;
        const oddsRes = await fetch(oddsUrl);
        const oddsJson = await oddsRes.json();

        const h2h = oddsJson.odds.find(o => o.marketName === "1X2" || o.marketName === "Match Result");
        if (h2h) {
          const outcome = h2h.bookmakers[0]?.selections.find(sel => sel.name.includes(winner));
          if (outcome) {
            winnerOdd = parseFloat(outcome.odds).toFixed(2);
          }
        }
      } catch {
        console.warn("Odds não encontradas para:", home, "vs", away);
      }

      const displayStatus = Number.isInteger(status) ? `${status}'` : status;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="league">
          <img src="${leagueImg}" alt="${league}" class="league-icon" onerror="this.onerror=null;this.src='fallback-league.png'"> ${league}
        </div>
        <div class="teams">
          <span class="team team-home">
            <img src="${homeImg}" alt="${home}" class="team-icon" onerror="this.onerror=null;this.src='fallback-team.png'"> ${home}
          </span>
          <span class="team team-away">
            <img src="${awayImg}" alt="${away}" class="team-icon" onerror="this.onerror=null;this.src='fallback-team.png'"> ${away}
          </span>
        </div>
        <div class="score">${homeGoals} - ${awayGoals}</div>
        <div class="status"><i class="fas fa-clock"></i> 2º Tempo - ${displayStatus}</div>
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
setInterval(fetchLiveMatches, 30 * 1000); // Atualiza a cada 30 segundos


