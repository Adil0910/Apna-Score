import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";
import "./Live.css";

const Live = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [showNextPlayer, setShowNextPlayer] = useState(false);
  const [nextPlayerIndex, setNextPlayerIndex] = useState(null);
  const [showBowlerSelect, setShowBowlerSelect] = useState(false);
  const [newBowler, setNewBowler] = useState(null);

  const userId = localStorage.getItem("userId");
  const matchRef = ref(db, `matches/${id}`);

  useEffect(() => {
    const unsub = onValue(matchRef, (snap) => {
      setMatch(snap.val());
    });
    return () => unsub();
  }, [id]);

  if (!match) return <h3>Loading...</h3>;

  const battingTeamName = match.current.battingTeam;
  const bowlingTeamName =
    battingTeamName === match.teamA ? match.teamB : match.teamA;

  const isAdmin = match.createdBy === userId;

  const battingKey =
    match.current.battingTeam === match.teamA ? "playersA" : "playersB";
  const bowlingKey = battingKey === "playersA" ? "playersB" : "playersA";

  const batting = JSON.parse(JSON.stringify(match[battingKey]));
  const bowling = JSON.parse(JSON.stringify(match[bowlingKey]));

  const currentBowler = match.current.bowler || 0;

  const updateState = (data) => {
    const prevState = {
      playersA: match.playersA,
      playersB: match.playersB,
      current: match.current,
    };
    const updatedData = {};
    Object.keys(data).forEach((key) => {
      if (key.startsWith("current/")) {
        updatedData[`current/${key.split("/")[1]}`] = data[key];
      } else {
        updatedData[key] = data[key];
      }
    });
    update(matchRef, { ...updatedData, lastState: prevState });
  };

  const undoLast = () => {
    if (!match.lastState) {
      alert("No action to undo");
      return;
    }
    update(matchRef, {
      playersA: match.lastState.playersA,
      playersB: match.lastState.playersB,
      current: match.lastState.current,
      lastState: null,
    });
    setShowBowlerSelect(false);
    setNewBowler(null);
    setShowNextPlayer(false);
    setNextPlayerIndex(null);
  };

  const updateBowlerBall = () => {
    bowling[currentBowler].bowling.balls =
      (bowling[currentBowler].bowling.balls || 0) + 1;
    const b = bowling[currentBowler].bowling.balls;
    bowling[currentBowler].bowling.overs = Math.floor(b / 6) + "." + (b % 6);
  };

  const endInnings = () => {
    setShowNextPlayer(false);
    setShowBowlerSelect(false);
    setNextPlayerIndex(null);
    setNewBowler(null);

    if (match.current.innings === 1) {
      const target = match.current.runs + 1;
      alert(`Target: ${target} 🎯`);
      update(matchRef, {
        target,
        current: {
          innings: 2,
          runs: 0,
          wickets: 0,
          balls: 0,
          over: 0,
          striker: 0,
          nonStriker: 1,
          nextPlayer: 2,
          history: [],
          battingTeam:
            match.current.battingTeam === match.teamA
              ? match.teamB
              : match.teamA,
          bowler: 0,
        },
      });
    } else {
      const winner =
        (match.current.runs || 0) >= (match.target || 0)
          ? battingTeamName
          : bowlingTeamName;
      update(matchRef, { winner,completedAt: Date.now()});
      alert(`${winner} Won 🏆`);
    }
  };

  const addRun = (run) => {
    if (showBowlerSelect) {
      alert("Select new bowler first");
      return;
    }

    let { runs, balls, over, striker, nonStriker, history = [], wickets = 0 } =
      match.current;

    const currentTotalBalls = over * 6 + balls;
    if (currentTotalBalls >= match.overs * 6) {
      endInnings();
      return;
    }

    let newRuns = runs + run;
    let newBalls = balls + 1;
    let newOver = over;
    let newStriker = striker;
    let newNonStriker = nonStriker;

    batting[striker].batting.runs = (batting[striker].batting.runs || 0) + run;
    batting[striker].batting.balls = (batting[striker].batting.balls || 0) + 1;
    bowling[currentBowler].bowling.runs =
      (bowling[currentBowler].bowling.runs || 0) + run;
    updateBowlerBall();

    history.push(run.toString());
    if (history.length > 6) history.shift();

    if (run % 2 === 1) [newStriker, newNonStriker] = [newNonStriker, newStriker];

    if (newBalls === 6) {
      newOver += 1;
      newBalls = 0;
      [newStriker, newNonStriker] = [newNonStriker, newStriker];
      setShowBowlerSelect(true);
    }

    const updatedData = {
      [battingKey]: batting,
      [bowlingKey]: bowling,
      "current/runs": newRuns,
      "current/balls": newBalls,
      "current/over": newOver,
      "current/striker": newStriker,
      "current/nonStriker": newNonStriker,
      "current/history": history,
    };

    const newTotalBalls = newOver * 6 + newBalls;

   if (match.current.innings === 2 && newRuns >= (match.target || 0)) {
  update(matchRef, { 
    ...updatedData, 
    winner: battingTeamName,
    completedAt: Date.now() // ✅ add this
  });
  alert(`${battingTeamName} Won 🏆`);
  return;
}

    if (wickets >= batting.length - 1 || newTotalBalls >= match.overs * 6) {
      if (match.current.innings === 2) {
        const winner =
          newRuns >= (match.target || 0) ? battingTeamName : bowlingTeamName;
       update(matchRef, { 
  ...updatedData, 
  winner,
  completedAt: Date.now() // ✅ add
});
      } else {
        updateState(updatedData);
        endInnings();
      }
      return;
    }

    updateState(updatedData);
  };

  const addWicket = () => {
    if (showBowlerSelect) {
      alert("Select new bowler first");
      return;
    }

    let {
      wickets = 0,
      balls = 0,
      over = 0,
      striker,
      nonStriker,
      history = [],
    } = match.current;

    const totalBalls = over * 6 + balls;
    if (totalBalls >= match.overs * 6) {
      endInnings();
      return;
    }

    batting[striker].status = "out";
    balls += 1;
    wickets += 1;

    bowling[currentBowler].bowling.wickets =
      (bowling[currentBowler].bowling.wickets || 0) + 1;
    updateBowlerBall();

    history.push("W");
    if (history.length > 6) history.shift();

    let newStriker = striker;
    let newNonStriker = nonStriker;

    if (balls === 6) {
      over += 1;
      balls = 0;
      [newStriker, newNonStriker] = [newNonStriker, newStriker];
      setShowBowlerSelect(true);
    }

    // ✅ ALL OUT CHECK: batting.length - 1 players out = last wicket
    const isAllOut = wickets >= batting.length - 1;

    updateState({
      [battingKey]: batting,
      [bowlingKey]: bowling,
      "current/wickets": wickets,
      "current/balls": balls,
      "current/over": over,
      "current/striker": newStriker,
      "current/nonStriker": newNonStriker,
      "current/history": history,
    });

    if (isAllOut) {
      // Last wicket gira — innings end karo, next player mat dikhao
      setShowNextPlayer(false);
      endInnings();
    } else {
      // Aur players available hain — next select karo
      setShowNextPlayer(true);
    }
  };

  const selectNextPlayer = () => {
    if (nextPlayerIndex === null) {
      alert("Select next player");
      return;
    }
    const updated = [...batting];
    updated[nextPlayerIndex].status = "batting";
    updateState({
      [battingKey]: updated,
      "current/striker": nextPlayerIndex,
      "current/nextPlayer": nextPlayerIndex + 1,
    });
    setShowNextPlayer(false);
    setNextPlayerIndex(null);
  };

  const addWide = () => {
    let { runs, history = [] } = match.current;
    runs += 1;
    history.push("Wd");
    if (history.length > 6) history.shift();
    updateState({ "current/runs": runs, "current/history": history });
  };

  const addNoBall = () => {
    let { runs, history = [] } = match.current;
    runs += 1;
    history.push("Nb");
    if (history.length > 6) history.shift();
    updateState({ "current/runs": runs, "current/history": history });
  };

  const addNoBallRun = (run) => {
    let { runs, striker, nonStriker, history = [] } = match.current;
    runs += 1 + run;
    batting[striker].batting.runs = (batting[striker].batting.runs || 0) + run;
    bowling[currentBowler].bowling.runs =
      (bowling[currentBowler].bowling.runs || 0) + run + 1;
    history.push(`Nb+${run}`);
    if (history.length > 6) history.shift();
    if (run % 2 === 1) [striker, nonStriker] = [nonStriker, striker];
    updateState({
      [battingKey]: batting,
      [bowlingKey]: bowling,
      "current/runs": runs,
      "current/striker": striker,
      "current/nonStriker": nonStriker,
      "current/history": history,
    });
  };

  const addLegBye = (run) => {
    if (showBowlerSelect) {
      alert("Select new bowler first");
      return;
    }
    let { runs, balls, over, striker, nonStriker, history = [] } = match.current;
    runs += run;
    balls += 1;
    bowling[currentBowler].bowling.runs =
      (bowling[currentBowler].bowling.runs || 0) + run;
    updateBowlerBall();
    history.push(`Lb${run}`);
    if (history.length > 6) history.shift();
    if (run % 2 === 1) [striker, nonStriker] = [nonStriker, striker];
    if (balls === 6) {
      over += 1;
      balls = 0;
      [striker, nonStriker] = [nonStriker, striker];
      setShowBowlerSelect(true);
      const totalBalls = over * 6 + balls;
      if (totalBalls >= match.overs * 6) {
        updateState({
          [bowlingKey]: bowling,
          "current/runs": runs,
          "current/balls": balls,
          "current/over": over,
          "current/striker": striker,
          "current/nonStriker": nonStriker,
          "current/history": history,
        });
        endInnings();
        return;
      }
    }
    updateState({
      [bowlingKey]: bowling,
      "current/runs": runs,
      "current/balls": balls,
      "current/over": over,
      "current/striker": striker,
      "current/nonStriker": nonStriker,
      "current/history": history,
    });
  };

  const addWicketRun = (run) => {
    if (showBowlerSelect) {
      alert("Select new bowler first");
      return;
    }

    let {
      runs,
      wickets = 0,
      balls = 0,
      over = 0,
      striker,
      nonStriker,
      history = [],
    } = match.current;

    // Pehle se all out tha
    if (wickets >= batting.length - 1) {
      setShowNextPlayer(false);
      endInnings();
      return;
    }

    runs += run;
    balls += 1;
    wickets += 1;

    batting[striker].status = "out";
    bowling[currentBowler].bowling.runs =
      (bowling[currentBowler].bowling.runs || 0) + run;
    bowling[currentBowler].bowling.wickets =
      (bowling[currentBowler].bowling.wickets || 0) + 1;
    updateBowlerBall();

    history.push(`W+${run}`);
    if (history.length > 6) history.shift();

    if (run % 2 === 1) [striker, nonStriker] = [nonStriker, striker];

    if (balls === 6) {
      over += 1;
      balls = 0;
      [striker, nonStriker] = [nonStriker, striker];
      setShowBowlerSelect(true);
      const totalBalls = over * 6 + balls;
      if (totalBalls >= match.overs * 6) {
        updateState({
          [battingKey]: batting,
          [bowlingKey]: bowling,
          "current/runs": runs,
          "current/wickets": wickets,
          "current/balls": balls,
          "current/over": over,
          "current/history": history,
        });
        endInnings();
        return;
      }
    }

    // ✅ ALL OUT CHECK: is wicket ke BAAD check karo
    const isAllOut = wickets >= batting.length - 1;

    updateState({
      [battingKey]: batting,
      [bowlingKey]: bowling,
      "current/runs": runs,
      "current/wickets": wickets,
      "current/balls": balls,
      "current/over": over,
      "current/striker": striker,
      "current/nonStriker": nonStriker,
      "current/history": history,
    });

    if (isAllOut) {
      // Last wicket — innings end karo, next player mat dikhao
      setShowNextPlayer(false);
      endInnings();
    } else {
      setShowNextPlayer(true);
    }
  };

  const changeBowler = (i) => {
    updateState({ "current/bowler": i });
  };

  const confirmBowler = () => {
    if (newBowler === null) {
      alert("Select bowler");
      return;
    }
    changeBowler(newBowler);
    setShowBowlerSelect(false);
    setNewBowler(null);
  };

  const availablePlayers = batting.filter(
    (p, i) =>
      p.status !== "out" &&
      i !== match.current.striker &&
      i !== match.current.nonStriker
  );

  const validBowling = bowling
    .map((b, i) => ({ ...b, originalIndex: i }))
    .filter((b) => b.name && b.name.trim() !== "");

const declareWinner = (winner) => {
  update(matchRef, { 
    winner,
    completedAt: Date.now()
  });
  alert(`${winner} Won 🏆`);
};
  return (
    <div className="container">
      <div className="card score">
        <h2>
          {match.teamA} vs {match.teamB}
        </h2>
        {match.target && match.current.innings === 2 && (
          <h3>Target: {match.target}</h3>
        )}
        <h1>
          {battingTeamName} {match.current.runs}/{match.current.wickets}
        </h1>
        {match.current.innings === 2 && match.target && (
          <p>Need {Math.max(match.target - match.current.runs, 0)} runs</p>
        )}
        <p>
          Over: {match.current.over}.{match.current.balls}
        </p>
        {match.winner && (
          <h2 style={{ color: "green" }}>🏆 {match.winner} Won</h2>
        )}
      </div>

      <div className="card">
        <h3>Batting</h3>
        <div className="row striker">
          <span>
            {batting[match.current.striker]?.name || "Select Batsman"}*
          </span>
          <span>
            {batting[match.current.striker]?.batting?.runs ?? 0}{" "}
            ({batting[match.current.striker]?.batting?.balls ?? 0})
          </span>
        </div>
        <div className="row">
          <span>
            {batting[match.current.nonStriker]?.name || "Select Batsman"}
          </span>
          <span>
            {batting[match.current.nonStriker]?.batting?.runs ?? 0}{" "}
            ({batting[match.current.nonStriker]?.batting?.balls ?? 0})
          </span>
        </div>
        {showNextPlayer && availablePlayers.length > 0 && (
          <div className="card">
            <h3>Select Next Batsman</h3>
            <select
              onChange={(e) => setNextPlayerIndex(Number(e.target.value))}
            >
              <option value="">Select Player</option>
              {batting.map(
                (p, i) =>
                  p.status !== "out" &&
                  i !== match.current.striker &&
                  i !== match.current.nonStriker && (
                    <option key={i} value={i}>
                      {p.name}
                    </option>
                  )
              )}
            </select>
            <button onClick={selectNextPlayer}>Confirm</button>
          </div>
        )}
      </div>

      <div className="card-current-bowler">
        <h3 className="-head-cur-bowler">Current Bowler</h3>
        <div className="row">
          <span>{bowling[currentBowler]?.name}</span>
          <span className="spn-bowler">
            {bowling[currentBowler]?.bowling?.overs || "0.0"} -{" "}
            {bowling[currentBowler]?.bowling?.runs || 0} -{" "}
            {bowling[currentBowler]?.bowling?.wickets || 0}
          </span>
        </div>
      </div>

      {showBowlerSelect && (
        <div className="card">
          <h3>Select New Bowler</h3>
          <select onChange={(e) => setNewBowler(Number(e.target.value))}>
            <option value="">Select Bowler</option>
            {validBowling.map(
              (b) =>
                b.originalIndex !== currentBowler && (
                  <option key={b.originalIndex} value={b.originalIndex}>
                    {b.name}
                  </option>
                )
            )}
          </select>
          <button onClick={confirmBowler}>Confirm</button>
        </div>
      )}

      <div className="card">
        <h3> Bowlers</h3>
        {validBowling.map((b) => (
          <div key={b.originalIndex} className="row">
            <span className="bowler-name">
              {b.originalIndex === currentBowler ? "* " : ""}
              {b.name}
            </span>
            <span className="bowler-over">
              {b.bowling?.overs || "0.0"} - {b.bowling?.runs || 0} -{" "}
              {b.bowling?.wickets || 0}
            </span>
            {isAdmin && !match.winner && (
              <button onClick={() => changeBowler(b.originalIndex)}>
                Select
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Last 6</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {(match.current.history || []).map((h, i) => (
            <span
              key={i}
              className={
                h === "W"
                  ? "ball-w"
                  : h === "4"
                  ? "ball-4"
                  : h === "6"
                  ? "ball-6"
                  : "ball-normal"
              }
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      {isAdmin && !match.winner && (
        <div className="card">
          <h3>Controls</h3>
          <div className="controls">
            {[1, 2, 4, 6].map((r) => (
              <button
                key={r}
                className={
                  r === 4 ? "btn-4" : r === 6 ? "btn-6" : "btn-normal"
                }
                onClick={() => addRun(r)}
              >
                {r}
              </button>
            ))}
            <button className="wicket" onClick={addWicket}>
              W
            </button>
            <button onClick={addWide}>Wd</button>
            <button onClick={addNoBall}>Nb</button>
            <button onClick={() => addNoBallRun(4)}>Nb+4</button>
            <button onClick={() => addNoBallRun(6)}>Nb+6</button>
            <button onClick={() => addLegBye(1)}>Lb1</button>
            <button onClick={() => addLegBye(2)}>Lb2</button>
            <button onClick={() => addWicketRun(2)}>W+2</button>
            <button className="undo-btn" onClick={undoLast}>
              ⬅️ Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Live;