export default function BullHead() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12"
    >
      <g>
        {/* Sharper Bull Head */}
        <path
          d="M24 6
             C18 6 14 10 13 15
             C11 12 7 10 4 10
             C3 10 2 12 2 15
             C2 19 5 22 8 22
             C9 29 11 34 14 37
             C17 40 20 41 24 41
             C28 41 31 40 34 37
             C37 34 39 29 40 22
             C43 22 46 19 46 15
             C46 12 45 10 44 10
             C41 10 37 12 35 15
             C34 10 30 6 24 6Z"
          fill="currentColor"
        />

        {/* Sharper Horns */}
        <path
          d="M8 22
             C6 18 4 14 4 10
             C4 7 6 6 7 6
             C10 7 10 11 10 14
             C10 17 9 20 8 22Z"
          fill="currentColor"
        />
        <path
          d="M40 22
             C42 18 44 14 44 10
             C44 7 42 6 41 6
             C38 7 38 11 38 14
             C38 17 39 20 40 22Z"
          fill="currentColor"
        />

        {/* Eyes – narrower & meaner */}
        <rect x="16" y="19" width="4" height="2.2" rx="1" fill="#FFF" />
        <rect x="28" y="19" width="4" height="2.2" rx="1" fill="#FFF" />

        {/* Nose Ring */}
        <ellipse
          cx="24"
          cy="31"
          rx="4"
          ry="2.6"
          fill="none"
          stroke="#FFD700"
          strokeWidth="1.8"
        />
        <circle cx="24" cy="28" r="1.1" fill="#FFD700" />
      </g>
    </svg>
  );
}
