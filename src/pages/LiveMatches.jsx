import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "./LiveMatches.css";

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
    <>
    <div className="navbar-box">
      <h2>Apna Score</h2>
      <button
  id="installBtn"
  style={{
    padding: "10px 15px",
    background: "#fbfdff",
    color: "#0d47a1",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
   Install App
</button>

    </div>
      {/* 🔍 Search */}
      <div className="search-box">
        <input className="search-matches"
        type="text"
        placeholder="Search team..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />   

      </div>
      <div className="create-box">
        <button className="create-btn" onClick={() => navigate(`/create`)} >
          + Create Match
        </button>
      </div>
      
      {/* 🎯 Filter */}
      <div className="btn-grp" style={{ marginBottom: "15px" }}>
        <button className="live-btn" onClick={() => setFilter("live")}>Live</button>
        <button className="complete-btn" onClick={() => setFilter("completed")}>Completed</button>
        <button className="all-btn" onClick={() => setFilter("all")}>All</button>
      
      </div>

      {filteredMatches.length === 0 && <p className="msg-matches">No matches found</p>}
<div className="card-boxlive">
      {filteredMatches.map((m) => (
        <div className="live-card"
          key={m.id}
          onClick={() => navigate(`/live/${m.id}`)}
        >
     <h3>
  {typeof m.teamA === "object" ? m.teamA?.name : m.teamA} vs{" "}
  {typeof m.teamB === "object" ? m.teamB?.name : m.teamB}
</h3>

          {!m.winner ? (
            <p className="live-card-live"> Live</p>
          ) : (
            <p style={{ color: "red", fontWeight: "bold" }}>🔴 {m.winner} Won</p>
          )}

          <p>
            {m.current?.runs}/{m.current?.wickets} (
            {m.current?.over}.{m.current?.balls})
          </p>
        </div>
      ))}</div>
      </>
  );
};

export default LiveMatches;