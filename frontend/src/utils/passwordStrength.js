/**
 * Evaluates password strength based on 4 criteria.
 * Returns { score: 0-4, level: string, color: string, width: string }
 * Requirements: 10.4, 10.5
 */
export function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, level: "Lemah", color: "bg-rose-500", width: "0%" };

  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { level: "Lemah",       color: "bg-rose-500",    width: "25%"  },
    { level: "Lemah",       color: "bg-rose-500",    width: "25%"  },
    { level: "Cukup",       color: "bg-amber-500",   width: "50%"  },
    { level: "Kuat",        color: "bg-blue-500",    width: "75%"  },
    { level: "Sangat Kuat", color: "bg-emerald-500", width: "100%" },
  ];

  return { score, ...levels[score] };
}
