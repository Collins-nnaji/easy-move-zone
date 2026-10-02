import { useId } from "react";

/** Small botanical illustrations keep the catalogue fast and work at any size. */
export function ProduceArt({
  crop,
  className,
}: {
  crop: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const warm = ["cocoa", "ginger", "yam", "cassava", "cashew"].includes(crop);
  return (
    <svg
      viewBox="0 0 280 240"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      <defs>
        <radialGradient id={`${id}-bg`}>
          <stop stopColor={warm ? "#f1dfc0" : "#e6ead5"} />
          <stop offset="1" stopColor={warm ? "#e7d0b0" : "#d7dfc1"} />
        </radialGradient>
        <linearGradient
          id={`${id}-pod`}
          x1="70"
          y1="70"
          x2="200"
          y2="190"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#b88745" />
          <stop offset=".5" stopColor="#70472b" />
          <stop offset="1" stopColor="#3e3025" />
        </linearGradient>
      </defs>
      <rect width="280" height="240" rx="4" fill={`url(#${id}-bg)`} />
      <circle cx="140" cy="116" r="88" stroke="#fff" strokeOpacity=".3" />
      <ellipse
        cx="140"
        cy="195"
        rx="80"
        ry="10"
        fill="#473d2a"
        fillOpacity=".1"
      />
      {crop === "cocoa" ? (
        <g transform="rotate(-25 140 130)">
          <path
            d="M145 66c-1-22 8-33 24-37"
            stroke="#5f6944"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M154 55c31-35 57-19 63-12-19 24-41 32-63 12Z"
            fill="#526a40"
          />
          <path
            d="M140 58C91 65 79 111 88 144c9 34 29 51 52 61 24-10 44-28 53-61 9-33-4-79-53-86Z"
            fill={`url(#${id}-pod)`}
          />
          <path
            d="M140 63c-28 41-26 92 0 135m0-135c28 41 26 92 0 135m0-135v135M119 70c-39 40-31 84 6 120m36-120c39 40 31 84-6 120"
            stroke="#e0b679"
            strokeOpacity=".5"
            strokeWidth="2"
          />
        </g>
      ) : crop === "tomatoes" ? (
        <g>
          {[
            { x: 105, y: 110, r: 43 },
            { x: 171, y: 140, r: 48 },
            { x: 97, y: 167, r: 32 },
          ].map(({ x, y, r }) => (
            <g key={x + y}>
              <circle cx={x} cy={y} r={r} fill="#b95436" />
              <ellipse
                cx={x - 12}
                cy={y - 13}
                rx={r / 3}
                ry={r / 2.5}
                fill="#dc7951"
                transform={`rotate(30 ${x} ${y})`}
              />
              <path
                d={`M${x} ${y - r + 8}l-16-7 8 15-5 9 15-7 12 8-4-13 8-9-16 4Z`}
                fill="#49633b"
              />
            </g>
          ))}
        </g>
      ) : crop === "hibiscus" ? (
        <g>
          {[0, 1, 2, 3, 4].map((n) => (
            <path
              key={n}
              d="M140 126c-58-34-37-75-16-70 17 2 28 37 16 70Z"
              transform={`rotate(${n * 72} 140 126)`}
              fill={n % 2 ? "#9a4857" : "#713444"}
            />
          ))}
          <circle cx="140" cy="126" r="13" fill="#ddb98b" />
          <path d="M140 142v58" stroke="#526a40" strokeWidth="4" />
        </g>
      ) : crop === "sesame" ? (
        <g>
          <ellipse cx="140" cy="156" rx="79" ry="28" fill="#7b694d" />
          <path d="M61 156c8 43 32 53 79 53s71-10 79-53" fill="#9d845e" />
          <ellipse cx="140" cy="154" rx="69" ry="20" fill="#dfc79a" />
          {Array.from({ length: 32 }, (_, n) => {
            const x = 86 + (n % 8) * 15 + (Math.floor(n / 8) % 2) * 5;
            const y = 142 + Math.floor(n / 8) * 8;
            return (
              <ellipse
                key={n}
                cx={x}
                cy={y}
                rx="4"
                ry="2"
                transform={`rotate(${n * 19} ${x} ${y})`}
                fill={n % 3 ? "#f4e8ca" : "#c4a66d"}
              />
            );
          })}
          <path
            d="M145 122c4-32 15-59 37-80"
            stroke="#687d4c"
            strokeWidth="3"
          />
          <path
            d="M164 81c-32-22-36-6-29 10 9 5 20 1 29-10Zm7-13c25-7 31-21 23-27-13 1-23 12-23 27Z"
            fill="#687d4c"
          />
        </g>
      ) : crop === "rice" ? (
        <g>
          <path
            d="M141 201c-8-46-5-109 17-155M111 196c-5-43-21-87-29-112M168 196c7-30 22-58 43-80"
            stroke="#7d8552"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {Array.from({ length: 8 }, (_, n) => (
            <g key={n} transform={`translate(${144 + n * 1.5} ${64 + n * 15})`}>
              <ellipse
                cx="-10"
                cy="0"
                rx="6"
                ry="13"
                transform="rotate(-40)"
                fill="#bc9657"
              />
              <ellipse
                cx="11"
                cy="-4"
                rx="6"
                ry="13"
                transform="rotate(40)"
                fill="#d6b779"
              />
            </g>
          ))}
          {Array.from({ length: 5 }, (_, n) => (
            <ellipse
              key={n}
              cx={85 + n * 4}
              cy={93 + n * 17}
              rx="6"
              ry="12"
              transform={`rotate(-35 ${85 + n * 4} ${93 + n * 17})`}
              fill="#c3a269"
            />
          ))}
        </g>
      ) : crop === "cashew" ? (
        <g>
          <path
            d="M143 82c-40-12-59 20-46 57 7 20 35 22 51 9 38-31 54-66 20-76-8-3-17 1-25 10Z"
            fill="#c08b52"
          />
          <path
            d="M108 137c-44 9-35 51-8 50 22-1 10-20 22-25 11-5 5-25-14-25Z"
            fill="#85654a"
          />
          <path
            d="M153 83c20-34 49-35 59-19-12 20-38 29-59 19Z"
            fill="#526a40"
          />
          <path
            d="M144 84l-8-29"
            stroke="#526a40"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      ) : crop === "ginger" ? (
        <g transform="rotate(-15 140 135)">
          <path
            d="M92 178c-16-8-18-25-3-36l26-17-5-29c-3-22 21-27 27-8l8 24 20-27c14-20 34-8 22 12l-16 28 20-2c22-2 30 20 10 26l-37 11-14 30c-10 24-29 22-31 1l-2-13-25 10Z"
            fill="#bca073"
          />
          <path
            d="m120 113 17-6m-19 22 18 2m17-9 16 6m-38 30 20 7m-28 7 15 8m40-42 4 17"
            stroke="#8d764f"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m120 96 1 11m52-17-9 14m24 31-10 3"
            stroke="#e3c99b"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      ) : crop === "cassava" ? (
        <g transform="rotate(20 140 130)">
          <path
            d="M124 67c-35 13-34 93-13 129l10 11 8-13c17-42 25-105-5-127Z"
            fill="#8e7251"
          />
          <path
            d="M164 83c-30 10-25 74-10 109l10 15 8-15c15-39 18-94-8-109Z"
            fill="#a3875d"
          />
          <path
            d="m107 103 25 5m-29 22 27 5m-25 22 20 3m29-35 19 4m-21 20 20 4m-16 18 15 3"
            stroke="#d1b48a"
            strokeWidth="2"
          />
          <path
            d="m124 68 19-34m21 50-21-50"
            stroke="#687d4c"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g transform="rotate(-25 140 130)">
          <path
            d="M111 61c-31 20-22 66-20 90 2 28 14 55 36 56 26 2 31-26 37-51 8-32 30-74 1-96-17-13-39-10-54 1Z"
            fill={crop === "ginger" ? "#b89b65" : "#8e7251"}
          />
          <path
            d="M122 74c-7 32-8 79 4 117m19-119c-2 26-12 65-8 101"
            stroke="#dbbc87"
            strokeWidth="3"
            strokeOpacity=".6"
            strokeLinecap="round"
          />
          <path
            d="M138 57c-6-24 4-41 17-47"
            stroke="#526a40"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M145 37c20-20 42-13 49-4-15 16-32 19-49 4Z" fill="#63774a" />
        </g>
      )}
    </svg>
  );
}

export function ExportJourneyArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 350"
      className={className}
      role="img"
      aria-label="Produce collected in Nigeria, transported to port and prepared for its onward journey"
      fill="none"
    >
      <circle cx="282" cy="174" r="142" stroke="#aabb9e" strokeOpacity=".2" />
      <ellipse
        cx="282"
        cy="174"
        rx="78"
        ry="142"
        stroke="#aabb9e"
        strokeOpacity=".2"
      />
      <path
        d="M141 174h282M158 108h248M158 240h248"
        stroke="#aabb9e"
        strokeOpacity=".2"
      />
      <path
        d="M69 254C160 247 120 112 271 128s133 77 221-54"
        stroke="#dbc39c"
        strokeWidth="2"
        strokeDasharray="5 7"
      />
      <path
        d="M69 254C160 247 120 112 271 128"
        stroke="#d4ad72"
        strokeWidth="2"
      />
      <g transform="translate(220 150)">
        <path d="M0 66h170l-23 29H27L0 66Z" fill="#d5b78a" />
        <path d="M14 30h43v35H14z" fill="#d78359" />
        <path d="M62 30h43v35H62z" fill="#71866a" />
        <path d="M110 30h43v35h-43z" fill="#a8b394" />
        <path d="M26 9h43v18H26z" fill="#a8b394" />
        <path d="M74 9h43v18H74z" fill="#d5b78a" />
        <path d="M157 22h20v42h-20z" fill="#f0eee0" />
        <path d="M169 3v19" stroke="#f0eee0" strokeWidth="4" />
        <path
          d="M-12 109q14-10 28 0t28 0 28 0 28 0 28 0 28 0 28 0"
          stroke="#82987c"
          strokeWidth="2"
        />
        {[24, 38, 72, 86, 120, 134].map((x) => (
          <path
            key={x}
            d={`M${x} 35v24`}
            stroke="#203d31"
            strokeOpacity=".25"
            strokeWidth="2"
          />
        ))}
      </g>
      <circle cx="69" cy="254" r="8" fill="#d4ad72" />
      <circle cx="271" cy="128" r="8" fill="#d4ad72" />
      <circle cx="492" cy="74" r="8" fill="#f1eee0" />
      <text x="35" y="286" fill="#d5decf" fontSize="12" fontFamily="sans-serif">
        Collection
      </text>
      <text
        x="239"
        y="103"
        fill="#d5decf"
        fontSize="12"
        fontFamily="sans-serif"
      >
        Nigeria · Port
      </text>
      <text x="430" y="49" fill="#d5decf" fontSize="12" fontFamily="sans-serif">
        Your destination
      </text>
    </svg>
  );
}
