import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

const LiveMatches = () => {
  const [allMatches, setAllMatches] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("live"); // live | completed | all

  const navigate = useNavigate();

  useEffect(() => {
    const matchesRef = ref(db, "matches");

    onValue(matchesRef, (snap) => {
      const data = snap.val() || {};

      const formatted = Object.entries(data).map(([id, m]) => ({
        id,
        ...m,
      }));

      setAllMatches(formatted);
    });
  }, []);

  // 🔎 Apply filter + search
  const filteredMatches = allMatches.filter((m) => {
    const matchText = `${m.teamA} ${m.teamB}`.toLowerCase();

    const matchesSearch = matchText.includes(search.toLowerCase());

    let matchesFilter = true;
   if (filter === "live") {
  matchesFilter =
    !m.winner &&
    (m.current?.runs > 0 || m.current?.balls > 0);
}
    if (filter === "completed") matchesFilter = !!m.winner;

    return matchesSearch && matchesFilter;
  });
  

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏏 Matches</h2>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search team..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
      />

      {/* 🎯 Filter */}
      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => setFilter("live")}>Live</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => navigate(`/create`)} style={{ float: "right" }}>
          + Create Match
        </button>
      </div>

      {filteredMatches.length === 0 && <p>No matches found</p>}

      {filteredMatches.map((m) => (
        <div
          key={m.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/live/${m.id}`)}
        >
     <h3>
  {typeof m.teamA === "object" ? m.teamA?.name : m.teamA} vs{" "}
  {typeof m.teamB === "object" ? m.teamB?.name : m.teamB}
</h3>

          {!m.winner ? (
            <p style={{ color: "green" }}>🟢 Live</p>
          ) : (
            <p style={{ color: "red" }}>🔴 {m.winner} Won</p>
          )}

          <p>
            {m.current?.runs}/{m.current?.wickets} (
            {m.current?.over}.{m.current?.balls})
          </p>
        </div>
      ))}
    </div>
  );
};

export default LiveMatches;