import { getTramLineColor, getTitleCaseStationName } from "../utils";

const ScoreBoard = ({ foundStationsMap }) => {
  const totalFound = Object.keys(foundStationsMap).reduce(
    (accumulator, name) => accumulator + foundStationsMap[name].length,
    0
  );

  return (
    <div className="p-3">
      {totalFound > 1 && (
        <p className="mb-6 has-text-grey has-text-weight-semibold is-uppercase">
          {totalFound} stations
        </p>
      )}
      {Object.keys(foundStationsMap)
        .sort()
        .map((name) => {
          const amount = foundStationsMap[name].length;
          return (
            <div className="content" key={name}>
              {foundStationsMap[name].map((label) => (
                <span
                  key={label}
                  style={{
                    background: getTramLineColor(label),
                    padding: ".35rem .60rem",
                    borderRadius: "50%",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                  }}
                >
                  {label}
                </span>
              ))}
              <span className="ml-3 has-text-weight-semibold">
                {getTitleCaseStationName(name)}
              </span>
              {amount > 1 && (
                <span className="ml-2 has-text-weight-light	">x{amount}</span>
              )}
            </div>
          );
        })}
    </div>
  );
};
export default ScoreBoard;
