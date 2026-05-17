"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type LandingMapPreviewProps = {
  className?: string;
};

const previewNodes = [
  { id: "N", x: 190, y: 150, size: 70, fill: "#f6b84b" },
  { id: "A", x: 210, y: 395, size: 76, fill: "#35c7b3" },
  { id: "WJ", x: 770, y: 160, size: 78, fill: "#6d8cff" },
  { id: "P", x: 790, y: 405, size: 72, fill: "#e85d87" },
];

const previewTasks = [
  { label: "Pitch", x: 390, y: 94, tone: "#ffd37c" },
  { label: "UI", x: 430, y: 332, tone: "#35c7b3" },
  { label: "API", x: 585, y: 222, tone: "#6d8cff" },
  { label: "Proof", x: 585, y: 460, tone: "#e85d87" },
];

const previewEdges = [
  ["190 150", "448 130"],
  ["210 395", "486 368"],
  ["770 160", "640 258"],
  ["790 405", "638 495"],
  ["640 258", "486 368"],
  ["486 368", "448 130"],
];

export function LandingMapPreview({ className }: LandingMapPreviewProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <svg
        aria-hidden="true"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1000 600"
      >
        <defs>
          <pattern
            id="woven-preview"
            width="34"
            height="34"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 17H34M17 0V34" stroke="#f6b84b" strokeOpacity="0.12" />
            <path d="M0 0L34 34M34 0L0 34" stroke="#35c7b3" strokeOpacity="0.08" />
          </pattern>
          <linearGradient id="hero-warm" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#17120d" />
            <stop offset="48%" stopColor="#221911" />
            <stop offset="100%" stopColor="#0f1715" />
          </linearGradient>
          <filter id="soft-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="1000" height="600" fill="url(#hero-warm)" />
        <rect width="1000" height="600" fill="url(#woven-preview)" />
        <path
          d="M0 525 C180 475 280 585 462 526 S782 425 1000 510"
          fill="none"
          stroke="#f6b84b"
          strokeOpacity="0.16"
          strokeWidth="20"
        />

        {previewEdges.map(([from, to], index) => {
          const [fromX, fromY] = from.split(" ").map(Number);
          const [toX, toY] = to.split(" ").map(Number);
          const midX = (fromX + toX) / 2;

          return (
            <motion.path
              animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.28, 0.9, 0.28] }}
              d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
              fill="none"
              initial={{ pathLength: 0 }}
              key={`${from}-${to}`}
              stroke={index === 4 ? "#ff6b6b" : "#f6d7a1"}
              strokeDasharray={index === 4 ? "8 12" : "0"}
              strokeLinecap="round"
              strokeWidth={index === 4 ? 5 : 3}
              transition={{
                delay: index * 0.18,
                duration: 3.6,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          );
        })}

        {previewTasks.map((task, index) => (
          <motion.g
            animate={{ y: [0, -8, 0], opacity: 1 }}
            initial={{ scale: 0.8, opacity: 0 }}
            key={task.label}
            transition={{
              delay: 0.35 + index * 0.12,
              duration: 3 + index * 0.1,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            <rect
              fill="#fff8ed"
              height="72"
              rx="18"
              stroke={task.tone}
              strokeOpacity="0.95"
              strokeWidth="2"
              width="132"
              x={task.x}
              y={task.y}
            />
            <circle cx={task.x + 24} cy={task.y + 24} fill={task.tone} r="8" />
            <text
              fill="#1d1711"
              fontFamily="var(--font-geist-sans)"
              fontSize="22"
              fontWeight="700"
              x={task.x + 23}
              y={task.y + 52}
            >
              {task.label}
            </text>
          </motion.g>
        ))}

        {previewNodes.map((node, index) => (
          <motion.g
            animate={{ scale: [1, 1.05, 1] }}
            initial={{ scale: 0.7, opacity: 0 }}
            key={node.id}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            transition={{
              delay: index * 0.18,
              duration: 3.2,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              fill={node.fill}
              filter="url(#soft-glow)"
              opacity="0.28"
              r={node.size / 1.15}
            />
            <circle cx={node.x} cy={node.y} fill="#fffaf1" r={node.size / 2} />
            <circle
              cx={node.x}
              cy={node.y}
              fill={node.fill}
              opacity="0.92"
              r={node.size / 2 - 9}
            />
            <text
              dominantBaseline="middle"
              fill="#160f0a"
              fontFamily="var(--font-geist-sans)"
              fontSize={node.id.length > 1 ? 23 : 30}
              fontWeight="800"
              textAnchor="middle"
              x={node.x}
              y={node.y + 1}
            >
              {node.id}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
