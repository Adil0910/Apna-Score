import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useParams } from "react-router-dom";
import "./Scorecard.css";

const ScoreCard = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("A");

  useEffect(() => {
    const matchRef = ref(db, `matches/${id}`);
    onValue(matchRef, (snap) => {
      setMatch(snap.val());
    });
  }, [id]);

  if (!match) return <h3>Loading...</h3>;

  const players = selectedTeam === "A" ? match.playersA : match.playersB;
  const teamName = selectedTeam === "A" ? match.teamA : match.teamB;
  const runs = players?.reduce((t, p) => t + (p.batting?.runs || 0), 0);
  const wickets = players?.filter((p) => p.status === "out").length;
  const topScore = Math.max(...(players?.map((p) => p.batting?.runs || 0) || [0]));

  return (
    <div className="container">

      {/* Match Title */}
      <div className="match-title-card">
        <h2>{match.teamA} vs {match.teamB}</h2>
        {match.winner && (
          <div className="winner-banner">🏆 {match.winner} Won</div>
        )}
      </div>

      {/* Team Dropdown */}
      <div className="dropdown-wrapper">
        <label>Select Team</label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          <option value="A">{match.teamA}</option>
          <option value="B">{match.teamB}</option>
        </select>
      </div>

      {/* Team Scorecard */}
      <div className="team-card">
        <div className="team-header">
          <h3>{teamName}</h3>
          <span className="team-score">{runs}/{wickets}</span>
        </div>

        {/* Table Header */}
        <div className="score-table-header">
          <span>Batter</span>
          <span>R</span>
          <span>B</span>
          <span>SR</span>
        </div>

        {/* Player Rows */}
        <div className="player-list">
          {players?.map((p, i) => {
            const r = p.batting?.runs || 0;
            const b = p.batting?.balls || 0;
            const sr = b > 0 ? ((r / b) * 100).toFixed(1) : "0.0";
            const isTop = r === topScore && topScore > 0;
            const isOut = p.status === "out";

            return (
              <div
                key={i}
                className={`score-row ${isOut ? "out" : "not-out"} ${isTop ? "top-scorer" : ""}`}
              >
                <span className="player-name">
                  {p.name}
                  {!isOut && <span className="not-out-dot">*</span>}
                </span>
                <span>{r}</span>
                <span>{b}</span>
                <span className="sr">{sr}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ScoreCard;
