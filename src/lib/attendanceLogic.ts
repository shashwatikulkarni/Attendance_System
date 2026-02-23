type EvaluationResult =
  | {
      allowed: true;
      attendanceType: "Full Day" | "Half Day";
      late: boolean;
    }
  | {
      allowed: false;
      reason: string;
    };

export function evaluateAttendance(
  startTime: string,
  endTime: string
): EvaluationResult {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const OFFICE_START = 9 * 60 + 30;   // 09:30
  const OFFICE_END = 18 * 60 + 30;    // 18:30
  const HALF_POINT = 14 * 60 + 30;    // 14:30
  const LATE_AFTER = 9 * 60 + 35;     // 09:35

  const inMin = toMinutes(startTime);
  const outMin = toMinutes(endTime);

  if (inMin >= outMin) {
    return { allowed: false, reason: "Invalid time range" };
  }

  if (inMin < OFFICE_START) {
    return { allowed: false, reason: "Check-in cannot be before 09:30 AM" };
  }

  if (outMin > OFFICE_END) {
    return { allowed: false, reason: "Check-out cannot be after 06:30 PM" };
  }

  const isLate = inMin > LATE_AFTER;

  // Morning Half
  if (inMin >= OFFICE_START && outMin <= HALF_POINT) {
    return {
      allowed: true,
      attendanceType: "Half Day",
      late: isLate,
    };
  }

  // Evening Half
  if (inMin >= HALF_POINT && outMin <= OFFICE_END) {
    return {
      allowed: true,
      attendanceType: "Half Day",
      late: false,
    };
  }

  // Full Day
  if (inMin <= OFFICE_START && outMin >= OFFICE_END) {
    return {
      allowed: true,
      attendanceType: "Full Day",
      late: false,
    };
  }

  return {
    allowed: true,
    attendanceType: "Half Day",
    late: isLate,
  };
}
