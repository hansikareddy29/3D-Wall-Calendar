'use client';
//  Landscape card dimensions 
const CARD_W = 800;
const CX = CARD_W / 2;   // 400 => nail center x

// Left clip at 10% of card width, right at 90%
const C1X = 80;    // left clothespin center x
const C2X = 720;   // right clothespin center x
const NAIL_Y = 14;
const CLIP_TOP_Y = 100; // where rope arrives at top of clip gap

// Wooden clothespin shape  
// Drawn as two wooden arms, straddling the card top edge
function Clothespin({ cx, y }: { cx: number; y: number }) {
  const AW = 9;    // arm half-width
  const AG = 2.5;  // gap between arms at center
  const armTop = y - 6;
  const springY = y + 18;
  const jawBot = y + 50;

  // Wood color variation
  const woodMain = '#c49062';
  const woodDark = '#8a5a28';
  const woodLight = '#ddb878';

  return (
    <g>
      {/* Left arm */}
      <path
        d={`
          M ${cx - AW - 2} ${armTop}
          C ${cx - AW - 2} ${armTop + 6}, ${cx - AG - 1} ${springY - 10}, ${cx - AG - 1} ${springY}
          L ${cx - AG - 1} ${jawBot}
          Q ${cx - AG - 1} ${jawBot + 4} ${cx - AG + 2} ${jawBot + 4}
          L ${cx} ${jawBot + 4}
          L ${cx} ${springY + 2}
          C ${cx} ${springY - 6}, ${cx - AW + 1} ${armTop + 8}, ${cx - AW + 1} ${armTop}
          Z
        `}
        fill={woodMain}
        stroke={woodDark}
        strokeWidth={0.8}
      />
      {/* Left arm highlight */}
      <path
        d={`M ${cx - AW} ${armTop + 4} C ${cx - AW} ${armTop + 14}, ${cx - AG - 0.5} ${springY - 8}, ${cx - AG - 0.5} ${springY}`}
        fill="none"
        stroke={woodLight}
        strokeWidth={1}
        opacity={0.55}
      />

      {/* Right arm */}
      <path
        d={`
          M ${cx + AW + 2} ${armTop}
          C ${cx + AW + 2} ${armTop + 6}, ${cx + AG + 1} ${springY - 10}, ${cx + AG + 1} ${springY}
          L ${cx + AG + 1} ${jawBot}
          Q ${cx + AG + 1} ${jawBot + 4} ${cx + AG - 2} ${jawBot + 4}
          L ${cx} ${jawBot + 4}
          L ${cx} ${springY + 2}
          C ${cx} ${springY - 6}, ${cx + AW - 1} ${armTop + 8}, ${cx + AW - 1} ${armTop}
          Z
        `}
        fill={woodMain}
        stroke={woodDark}
        strokeWidth={0.8}
      />
      {/* Right arm highlight */}
      <path
        d={`M ${cx + AW} ${armTop + 4} C ${cx + AW} ${armTop + 14}, ${cx + AG + 0.5} ${springY - 8}, ${cx + AG + 0.5} ${springY}`}
        fill="none"
        stroke={woodLight}
        strokeWidth={1}
        opacity={0.55}
      />
      <ellipse cx={cx} cy={springY} rx={6.5} ry={6.5} fill="none" stroke="#8a8a8a" strokeWidth={2.2} />
      <ellipse cx={cx} cy={springY} rx={4} ry={4} fill="none" stroke="#b0b0b0" strokeWidth={1.2} />
      <circle cx={cx} cy={springY} r={1.5} fill="#aaa" />
    </g>
  );
}

export default function WallHanger() {
  return (
    <div
      className="relative select-none pointer-events-none"
      style={{ width: 'min(800px, 94vw)', height: 'auto', aspectRatio: '800 / 160', zIndex: 40 }}
    >
      {/* SVG: rope strands + clothespins + nail */}
      <svg
        viewBox={`0 0 ${CARD_W} 160`}
        width="100%"
        preserveAspectRatio="xMidYMin meet"
        className="absolute top-0 left-0"
      >
        <defs>
          {/* Radial gradient for the metal nail head */}
          <radialGradient id="nailGradient" cx="37%" cy="33%" r="50%">
            <stop offset="0%" stopColor="#ececec" />
            <stop offset="45%" stopColor="#adadad" />
            <stop offset="100%" stopColor="#686868" />
          </radialGradient>

          <filter id="nailShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.45" />
            </feComponentTransfer>
          </filter>

          {/* Clip-path masks so rope disappears inside each clothespin gap */}
          <mask id="lClipMask">
            <rect width={CARD_W} height="130" fill="white" />
            <rect x={C1X - 14} y={CLIP_TOP_Y - 8} width={28} height={65} fill="black" />
          </mask>
          <mask id="rClipMask">
            <rect width={CARD_W} height="130" fill="white" />
            <rect x={C2X - 14} y={CLIP_TOP_Y - 8} width={28} height={65} fill="black" />
          </mask>
        </defs>

        {/* Nail Shank (under rope) */}
        <rect x={CX - 2.5} y={NAIL_Y - 2} width={5} height={12} rx={1} fill="#707070" opacity={0.8} />
        
        {/* Wall Shadow for the assembly */}
        <ellipse cx={CX} cy={NAIL_Y - 2} rx={11} ry={4} fill="black" opacity={0.15} filter="url(#nailShadow)" />

        {/* Clothespins*/}
        <Clothespin cx={C1X} y={CLIP_TOP_Y} />
        <Clothespin cx={C2X} y={CLIP_TOP_Y} />

        {/* Left rope strand */}
        {/* Shadow */}
        <path d={`M ${CX} ${NAIL_Y} C ${CX - 40} 55, ${C1X + 20} 85, ${C1X} ${CLIP_TOP_Y}`}
          fill="none" stroke="#7a5c38" strokeWidth={2.2} strokeLinecap="round"
          mask="url(#lClipMask)" opacity={0.55} />
        {/* Main cord */}
        <path d={`M ${CX} ${NAIL_Y} C ${CX - 40} 55, ${C1X + 18} 84, ${C1X} ${CLIP_TOP_Y}`}
          fill="none" stroke="#c49a6c" strokeWidth={3.5} strokeLinecap="round"
          mask="url(#lClipMask)" />
        {/* Twist highlight */}
        <path d={`M ${CX} ${NAIL_Y} C ${CX - 42} 53, ${C1X + 16} 82, ${C1X - 1} ${CLIP_TOP_Y}`}
          fill="none" stroke="#e8c898" strokeWidth={1.4} strokeLinecap="round"
          strokeDasharray="5 4" opacity={0.78} mask="url(#lClipMask)" />

        {/* Right rope strand */}
        <path d={`M ${CX} ${NAIL_Y} C ${CX + 40} 55, ${C2X - 20} 85, ${C2X} ${CLIP_TOP_Y}`}
          fill="none" stroke="#7a5c38" strokeWidth={2.2} strokeLinecap="round"
          mask="url(#rClipMask)" opacity={0.55} />
        <path d={`M ${CX} ${NAIL_Y} C ${CX + 40} 55, ${C2X - 18} 84, ${C2X} ${CLIP_TOP_Y}`}
          fill="none" stroke="#c49a6c" strokeWidth={3.5} strokeLinecap="round"
          mask="url(#rClipMask)" />
        <path d={`M ${CX} ${NAIL_Y} C ${CX + 42} 53, ${C2X - 16} 82, ${C2X + 1} ${CLIP_TOP_Y}`}
          fill="none" stroke="#e8c898" strokeWidth={1.4} strokeLinecap="round"
          strokeDasharray="5 4" opacity={0.78} mask="url(#rClipMask)" />

        {/* Knot at nail */}
        <ellipse cx={CX} cy={NAIL_Y} rx={7} ry={6} fill="#b88848" />
        <ellipse cx={CX - 1} cy={NAIL_Y - 1.5} rx={4} ry={3} fill="#ddb870" opacity={0.75} />
        <ellipse cx={CX + 2} cy={NAIL_Y + 1.5} rx={2.5} ry={2} fill="#906030" opacity={0.55} />

        {/* Nail Head */}
        <circle cx={CX} cy={NAIL_Y} r={8} fill="url(#nailGradient)" stroke="rgba(0,0,0,0.2)" strokeWidth={0.5} />

        {/* Rope tail visible in the clothespin gap  */}
        <line x1={C1X} y1={CLIP_TOP_Y - 4} x2={C1X} y2={CLIP_TOP_Y + 16}
          stroke="#c49a6c" strokeWidth={2.5} opacity={0.6} strokeLinecap="round" />
        <line x1={C2X} y1={CLIP_TOP_Y - 4} x2={C2X} y2={CLIP_TOP_Y + 16}
          stroke="#c49a6c" strokeWidth={2.5} opacity={0.6} strokeLinecap="round" />
      </svg>
    </div>
  );
}
