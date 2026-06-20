import confetti from "canvas-confetti";

const GARDEN_COLORS = ["#10b981", "#f59e0b", "#34d399", "#fbbf24", "#6ee7b7"];

/** Burst of green/amber confetti — task complete */
export function fireTaskConfetti() {
  confetti({
    particleCount: 40,
    spread: 60,
    startVelocity: 30,
    origin: { y: 0.85 },
    colors: GARDEN_COLORS,
    scalar: 0.8,
  });
}

/** Wider celebration burst — pomodoro session complete */
export function firePomodoroConfetti() {
  confetti({
    particleCount: 70,
    spread: 90,
    startVelocity: 35,
    origin: { y: 0.8 },
    colors: GARDEN_COLORS,
    scalar: 0.9,
  });
}
