import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "./CompleteMatches.css";

const CompletedMatches = () => {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const matchRef = ref(db, "matches");

    onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const list = Object.keys(data)
        .map((key) => ({
          id: key,
          ...data[key],
        }))
        .filter((m) => m.winner); // ✅ only completed matches

      setMatches(list.reverse());
    });
  }, []);

  return (
    <div className="container">
    <h2>🏁 Completed Matches</h2>

    {matches.length === 0 && <p>No matches completed yet</p>}

    {matches.map((m) => (
      <div
        key={m.id}
        className="card-wrapper"
        onClick={() => navigate(`/scorecard/${m.id}`)}
        style={{ cursor: "pointer" }}
      >
        <div className="card-cm">
          <div className="card-inner">
            <h3>{m.teamA} vs {m.teamB}</h3>
            <div className="card-stats">
              <span className="badge-winner">{m.winner}</span>
              {m.target && (
                <span className="badge-target">Target: {m.target}</span>
              )}
            </div>
          </div>
        </div>
        <span className="card-arrow">›</span>
      </div>
    ))}
  </div>
)
};

export default CompletedMatches;