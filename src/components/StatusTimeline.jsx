import { STATUS } from "../lib/businessRules";

const STEPS = [STATUS.REPORTED, STATUS.ASSIGNED, STATUS.ACCEPTED, STATUS.IN_PROGRESS, STATUS.COMPLETED];

export default function StatusTimeline({ status }) {
  if (status === STATUS.CANCELLED) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-status-cancelled/10 border border-status-cancelled/30 px-4 py-3">
        <span className="w-2.5 h-2.5 rounded-full bg-status-cancelled" />
        <span className="font-medium text-status-cancelled">Request Cancelled</span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    done
                      ? "bg-hazard-500 border-hazard-700"
                      : "bg-white border-trust-300"
                  }`}
                />
                <span
                  className={`mt-2 text-xs text-center w-20 ${
                    done ? "text-trust-900 font-medium" : "text-trust-300"
                  }`}
                >
                  {step}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-1 rounded-full ${
                    i < currentIndex ? "bg-hazard-500" : "bg-trust-100"
                  }`}
                  style={{
                    backgroundImage:
                      i < currentIndex
                        ? "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.35) 4px, rgba(255,255,255,0.35) 8px)"
                        : undefined,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
