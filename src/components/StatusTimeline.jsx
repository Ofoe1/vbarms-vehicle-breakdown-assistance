import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { STATUS } from "../lib/businessRules";

const STEPS = [STATUS.REPORTED, STATUS.ASSIGNED, STATUS.ACCEPTED, STATUS.IN_PROGRESS, STATUS.COMPLETED];
const STEP_LABELS = ["Reported", "Assigned", "Accepted", "In Progress", "Completed"];

export default function StatusTimeline({ status }) {
  if (status === STATUS.CANCELLED) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
        <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
        <span className="font-medium text-red-800">Request cancelled</span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="w-full">
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex-shrink-0">
                {done ? (
                  <CheckCircle
                    size={18}
                    className={`${i === currentIndex ? "text-trust-700" : "text-trust-400"}`}
                  />
                ) : (
                  <Circle size={18} className="text-trust-200" />
                )}
              </div>

              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-1 ${
                    done ? "bg-trust-400" : "bg-trust-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-xs text-trust-500 font-medium">
        {STEP_LABELS.map((label, i) => (
          <span
            key={label}
            className={i <= currentIndex ? "text-trust-700" : "text-trust-400"}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}