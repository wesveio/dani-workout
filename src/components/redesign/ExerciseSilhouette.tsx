// src/components/redesign/ExerciseSilhouette.tsx
export function ExerciseSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 64 64'
      className={`opacity-[0.08] ${className}`}
      fill='currentColor'
    >
      <circle cx='32' cy='14' r='6' />
      <rect x='12' y='24' width='40' height='6' rx='3' />
      <rect x='20' y='34' width='8' height='20' rx='3' />
      <rect x='36' y='34' width='8' height='20' rx='3' />
    </svg>
  );
}
