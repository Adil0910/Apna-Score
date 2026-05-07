import React, { useState } from "react";
import { db } from "../firebase";
import { ref, push } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "./Create.css";

const Create = () => {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [overs, setOvers] = useState(10);
  const [tossWinner, setTossWinner] = useState("");
const [decision, setDecision] = useState("");
const [battingTeam, setBattingTeam] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [currentTeam, setCurrentTeam] = useState("A");
  const [step, setStep] = useState("setup");

  const [playersA, setPlayersA] = useState(["", "", "", "", ""]);
const [playersB, setPlayersB] = useState(["", "", "", "", ""]);

  const navigate = useNavigate();

  const userId =
    localStorage.getItem("userId") || Date.now().toString();
  localStorage.setItem("userId", userId);

  // 👉 Format players (same as tera old logic)
  const formatPlayers = (players) => {
    return players.map((name, i) => ({
      name: name.trim(),
      batting: { runs: 0, balls: 0 },
      bowling: { runs: 0, balls: 0, wickets: 0, overs: "0.0" },
      status: i < 2 ? "batting" : "yet",
    }));
  };

  // 👉 Start button
  const handleStart = () => {
    if (!teamA || !teamB) {
      alert("Team name bhar bhai 😄");
      return;
    }

    if (teamA === teamB) {
  alert("Dono team same nahi ho sakti 😄");
  return;
}

    let bt = "";

  if (decision === "bat") {
    bt = tossWinner;
  } else {
    bt = tossWinner === teamA ? teamB : teamA;
  }

  setBattingTeam(bt); // ✅ FIX

  setShowPopup(true);
  setCurrentTeam("A");
  setStep("teamA");
};

  // 👉 Input change
  const handleChange = (index, value) => {
    if (currentTeam === "A") {
      const updated = [...playersA];
      updated[index] = value;
      setPlayersA(updated);
    } else {
      const updated = [...playersB];
      updated[index] = value;
      setPlayersB(updated);
    }
  };

  // 👉 Save popup
  const handleSave = () => {
    const list = currentTeam === "A" ? playersA : playersB;
    const empty = list.some((n) => n.trim() === "");

   const validPlayers = list.filter((n) => n.trim() !== "");

// ✅ Min 5 players
if (validPlayers.length < 5) {
  alert("Kam se kam 5 players hone chahiye 😄");
  return;
}

// ✅ Max 11 players
if (validPlayers.length > 11) {
  alert("Maximum 11 players hi allowed hai 😄");
  return;
}

    if (step === "teamA") {
      setCurrentTeam("B");
      setStep("teamB");
    } else {
      setShowPopup(false);
      createMatch();
    }
  };

  // 👉 FINAL SAME FUNCTION (unchanged logic 🔥)
  const createMatch = async () => {
    try {

      const matchRef = ref(db, "matches");

      const newMatch = push(matchRef, {
  teamA,
  teamB,
  tossWinner,
  decision,
  playersA: formatPlayers(playersA),
  playersB: formatPlayers(playersB),
  overs,
  createdBy: userId,
createdAt: Date.now(),
  current: {
    innings: 1,
    battingTeam: battingTeam,
    striker: 0,
    nonStriker: 1,
    nextPlayer: 2,
    runs: 0,
    wickets: 0,
    over: 0,
    history: [],
    balls: 0,
  },
  
});

      console.log("created", newMatch.key);

      navigate(`/match/${newMatch.key}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <>
    <div className="main-container-create">
     <div className="nav-create"><button className="complete-btn" onClick={() => navigate(`/completed`)}>
  View Completed Matches
</button></div>
    <div className="container-create">
     
      <h2><span className="cr-span">Cre</span>ate Match</h2>

      {/* Team Names */}
      <input
        placeholder="Team A"
        value={teamA}
        onChange={(e) => setTeamA(e.target.value)}
      />

      <input
        placeholder="Team B"
        value={teamB}
        onChange={(e) => setTeamB(e.target.value)}
      />

        <h3>Toss</h3>

<select onChange={(e) => setTossWinner(e.target.value)}>
  <option value="">Select Toss Winner</option>
<option value={teamA} disabled={!teamA}>{teamA || "Team A"}</option>
<option value={teamB} disabled={!teamB}>{teamB || "Team B"}</option>
</select>

<select onChange={(e) => setDecision(e.target.value)}>
  <option value="">Decision</option>
  <option value="bat">Bat</option>
  <option value="bowl">Bowl</option>
</select>


      {/* Overs Select */}
      <div className="overs">
        <p>Select Overs</p>
        <div className="options">
          {[2, 5, 10, 20].map((o) => (
            <button
              key={o}
              className={overs === o ? "active" : ""}
              onClick={() => setOvers(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <button className="start-btn" onClick={handleStart}>
      Start Match
      </button>

      {/* Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>
              {currentTeam === "A" ? teamA : teamB} Players
            </h3>

            {(currentTeam === "A"
              ? playersA
              : playersB
            ).map((name, i) => (
              <input
                key={i}
                placeholder={`Player ${i + 1}`}
                value={name}
                onChange={(e) =>
                  handleChange(i, e.target.value)
                }
              />
              
            ))
            }
         <button className="add-btn" onClick={() => {
  const list = currentTeam === "A" ? playersA : playersB;

  if (list.length >= 11) {
    alert("Maximum 11 players hi add kar sakte ho 😄");
    return;
  }

  if (currentTeam === "A") {
    setPlayersA([...playersA, ""]);
  } else {
    setPlayersB([...playersB, ""]);
  }
}}>
  + Add Player
</button>
            <button className="sta-btns" onClick={handleSave}>
              {step === "teamA" ? "Next" : "Start Match"}
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
    </>
  );
};

export default Create;