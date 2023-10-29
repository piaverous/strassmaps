import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./scoreHeader.css";
import { getTramLineColor } from "../utils";
import CTSLogo from "./CTSLogo";

const ScoreHeader = ({ percentFoundTotal, percentFoundPerLine }) => {
  const [folded, setFolded] = useState(false);

  const FoldingButton = () => (
    <span
      className="button is-small floating-toggle"
      onClick={() => setFolded(!folded)}
    >
      <span
        className="icon"
        style={{
          transition: "all 0.2s linear",
          transform: folded ? "rotate(180deg)" : "rotate(0)",
        }}
      >
        <i className="fas fa-chevron-up" />
      </span>
    </span>
  );

  return (
    <div className="p-3">
      <div className="score-header">
        {folded ? (
          <>
            <p className="content">
              <span className="icon">
                <CTSLogo />
              </span>
              <span className="ml-3 is-size-5">
                {percentFoundTotal % 1 === 0
                  ? percentFoundTotal
                  : percentFoundTotal.toPrecision(2)}
                %
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="content">
              <span className="is-size-4">
                {percentFoundTotal % 1 === 0
                  ? percentFoundTotal
                  : percentFoundTotal.toPrecision(2)}
                %
              </span>{" "}
              des stations de tram trouvées
            </p>
            {/* <progress className="progress m-0" value={percentFoundTotal} max="100">
          {percentFoundTotal}%
        </progress> */}
            <div className="is-flex is-flex-wrap-wrap is-align-items-center	">
              {Object.keys(percentFoundPerLine).map((lineLabel) => {
                const percentFound = percentFoundPerLine[lineLabel];
                const color = getTramLineColor(lineLabel);
                return (
                  <div
                    className="icon is-medium mr-1 has-text-weight-bold"
                    key={lineLabel}
                  >
                    <CircularProgressbar
                      value={percentFound}
                      text={lineLabel}
                      background
                      styles={buildStyles({
                        textSize: "3rem",
                        textColor: "#fff",
                        pathColor: "#fff",
                        trailColor: color,
                        backgroundColor: color,
                      })}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
        <FoldingButton />
      </div>
    </div>
  );
};
export default ScoreHeader;
