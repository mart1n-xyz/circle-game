import type { Family } from "./types.ts";

// Small, original vector scenes. No network images or generated bitmap dependencies.
export function ProjectArt({ family }: { family: Family }) {
  return (
    <svg
      viewBox="0 0 360 160"
      aria-hidden="true"
      className={"project-art " + family}
    >
      <circle cx="286" cy="38" r="24" fill="currentColor" opacity=".15" />
      <path
        d="M30 135H330"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".3"
      />
      {family === "equipment" && (
        <g stroke="#344c3c" strokeWidth="2" strokeLinejoin="round">
          <path d="M77 128V48h174v80" fill="#f2edd7" />
          <path d="M67 48l18-17h163l17 17z" fill="#58795b" />
          <path d="M81 49h178v21H81z" fill="#f2c966" />
          <path
            d="M95 49v21m25-21v21m25-21v21m25-21v21m25-21v21m25-21v21m25-21v21"
            stroke="#f7e4a6"
            strokeWidth="12"
          />
          <rect x="96" y="83" width="66" height="45" rx="2" fill="#9aaf87" />
          <path d="M129 84v43m-33-21h66" />
          <rect x="184" y="81" width="41" height="47" rx="2" fill="#dfb98d" />
          <path d="M191 89h27v19h-27z" fill="#f6e9c8" />
          <circle cx="218" cy="117" r="1" />
          <path
            d="M277 132V91m0 22c-26-1-23-25-12-20 9 4 12 20 12 20zm0-10c22 0 22-24 12-20-7 3-12 20-12 20z"
            fill="#789560"
          />
          <path d="M262 120h29l-5 14h-19z" fill="#be7759" />
          <path d="M47 129l9-20 10 20m-15-7h10" fill="none" />
        </g>
      )}
      {family === "seasonal" && (
        <g stroke="#654936" strokeWidth="2" strokeLinejoin="round">
          <path d="M90 125V52h175v73" fill="#f4e8ca" />
          <path d="M76 53l23-25h153l25 25z" fill="#b96b47" />
          <path
            d="M83 53v15q14 15 27 0 14 15 28 0 14 15 28 0 14 15 28 0 14 15 28 0 14 15 28 0 14 15 21 0V53z"
            fill="#f3c579"
          />
          <path d="M110 54v14m28-14v14m28-14v14m28-14v14m28-14v14m28-14v14" />
          <rect x="102" y="96" width="150" height="29" fill="#bc895a" />
          <path
            d="M102 105h150m-150 10h150m-112-19v29m37-29v29m37-29v29"
            opacity=".6"
          />
          {[119, 142, 165, 189, 213, 237].map((x, i) => (
            <g key={x}>
              <ellipse
                cx={x}
                cy={88 - (i % 2) * 5}
                rx="10"
                ry="9"
                fill={i % 2 ? "#ce864b" : "#a1aa62"}
              />
              <path d={"M" + x + " " + (80 - (i % 2) * 5) + "l3-6"} />
            </g>
          ))}
          <path d="M57 130l6-36h14l5 36z" fill="#d4a977" />
          <path
            d="M69 94V65m0 13c-17 0-20-15-9-13 5 1 9 13 9 13zm0 6c19 0 19-16 9-13-5 1-9 13-9 13z"
            fill="#81975a"
          />
          <path d="M283 132l8-25h18l8 25z" fill="#e2b05e" />
          <path d="M294 106l-4-13m11 13l6-11" />
        </g>
      )}
      {family === "venture" && (
        <g stroke="#51485d" strokeWidth="2" strokeLinejoin="round">
          <path d="M87 131V62h180v69" fill="#e8ddeb" />
          <path d="M72 63l105-40 105 40z" fill="#8f80ab" />
          <path d="M87 63h180" strokeWidth="5" />
          <rect x="108" y="77" width="45" height="39" fill="#b5c8b4" />
          <path d="M130 77v39m-22-20h45" />
          <rect x="201" y="77" width="45" height="39" fill="#b5c8b4" />
          <path d="M223 77v39m-22-20h45" />
          <path d="M164 130V82h25v48" fill="#ad99bb" />
          <circle cx="184" cy="109" r="1" />
          <path d="M96 52h162" stroke="#f4ead8" strokeWidth="5" />
          <path
            d="M52 131V95m0 19c-23-2-25-28-14-23 10 4 14 23 14 23zm0-8c21 0 25-24 13-21-8 2-13 21-13 21z"
            fill="#8aab82"
          />
          <path d="M39 121h27l-5 13H44z" fill="#c09181" />
          <circle cx="297" cy="110" r="18" fill="#aabf97" />
          <path d="M297 105v28m0-17l-7-7m7 14l9-9" />
          <path d="M119 35v-13h13v8" fill="#bdadc9" />
        </g>
      )}
    </svg>
  );
}
