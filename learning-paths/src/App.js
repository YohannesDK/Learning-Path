import { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

// ─── DATA ────────────────────────────────────────────────────────────────────

const THEMES = {
  events: {
    label: "Event-Driven Architecture",
    color: "#f97316",
    description: "Learn how to build systems using events, queues, and async messaging.",
  },
  cloud: {
    label: "Cloud & Infrastructure",
    color: "#3b82f6",
    description: "From cloud basics to advanced infrastructure-as-code.",
  },
  security: {
    label: "Security Engineering",
    color: "#8b5cf6",
    description: "Secure coding, threat modeling, and compliance.",
  },
};

const PATHS = {
  events: {
    nodes: [
      {
        id: "e1",
        data: {
          title: "Async vs Sync Communication",
          type: "article",
          difficulty: "beginner",
          min_years: 0,
          duration: "1h",
          description: "Understand the fundamental difference between synchronous and asynchronous communication patterns.",
          links: [{ label: "Martin Fowler – Async", url: "https://martinfowler.com" }],
          tags: ["fundamentals", "messaging"],
        },
        position: { x: 60, y: 200 },
      },
      {
        id: "e2",
        data: {
          title: "Message Brokers 101",
          type: "course",
          difficulty: "beginner",
          min_years: 0,
          duration: "3h",
          description: "Introduction to message brokers: what they are, why they exist, and when to use them.",
          links: [{ label: "Udemy Course", url: "https://udemy.com" }],
          tags: ["broker", "fundamentals"],
        },
        position: { x: 340, y: 80 },
      },
      {
        id: "e3",
        data: {
          title: "Apache Kafka Fundamentals",
          type: "course",
          difficulty: "intermediate",
          min_years: 1,
          duration: "8h",
          description: "Deep dive into Kafka: topics, partitions, consumer groups, and offsets.",
          links: [{ label: "Confluent Learn", url: "https://developer.confluent.io" }],
          tags: ["kafka", "streaming"],
        },
        position: { x: 340, y: 300 },
      },
      {
        id: "e4",
        data: {
          title: "Event Sourcing Pattern",
          type: "article",
          difficulty: "intermediate",
          min_years: 2,
          duration: "2h",
          description: "Learn how to model state changes as an immutable sequence of events.",
          links: [{ label: "EventStore Docs", url: "https://eventstore.com/docs" }],
          tags: ["patterns", "event-sourcing"],
        },
        position: { x: 620, y: 80 },
      },
      {
        id: "e5",
        data: {
          title: "Confluent Kafka Certification",
          type: "certificate",
          difficulty: "advanced",
          min_years: 2,
          duration: "20h prep",
          description: "Official Confluent certification for Kafka developers. Validates production-level knowledge.",
          links: [{ label: "Confluent Cert", url: "https://confluent.io/certification" }],
          tags: ["kafka", "certification"],
        },
        position: { x: 620, y: 300 },
      },
      {
        id: "e6",
        data: {
          title: "CQRS & Event-Driven Microservices",
          type: "course",
          difficulty: "advanced",
          min_years: 3,
          duration: "12h",
          description: "Combine CQRS with event-driven patterns to build scalable microservice architectures.",
          links: [{ label: "Pluralsight", url: "https://pluralsight.com" }],
          tags: ["cqrs", "microservices", "patterns"],
        },
        position: { x: 900, y: 200 },
      },
    ],
    edges: [
      { id: "ee1", source: "e1", target: "e2", label: "requires" },
      { id: "ee2", source: "e1", target: "e3", label: "requires" },
      { id: "ee3", source: "e2", target: "e4", label: "recommends" },
      { id: "ee4", source: "e3", target: "e5", label: "requires" },
      { id: "ee5", source: "e4", target: "e6", label: "requires" },
      { id: "ee6", source: "e5", target: "e6", label: "recommends" },
    ],
  },
  cloud: {
    nodes: [
      {
        id: "c1",
        data: {
          title: "Cloud Computing Basics",
          type: "course",
          difficulty: "beginner",
          min_years: 0,
          duration: "4h",
          description: "What is cloud computing? IaaS, PaaS, SaaS explained with real examples.",
          links: [{ label: "AWS Skill Builder", url: "https://skillbuilder.aws" }],
          tags: ["cloud", "fundamentals"],
        },
        position: { x: 60, y: 200 },
      },
      {
        id: "c2",
        data: {
          title: "AWS Cloud Practitioner",
          type: "certificate",
          difficulty: "beginner",
          min_years: 0,
          duration: "10h prep",
          description: "Entry-level AWS certification. Great foundation for any cloud path.",
          links: [{ label: "AWS Cert", url: "https://aws.amazon.com/certification" }],
          tags: ["aws", "certification"],
        },
        position: { x: 340, y: 200 },
      },
      {
        id: "c3",
        data: {
          title: "Terraform Fundamentals",
          type: "course",
          difficulty: "intermediate",
          min_years: 1,
          duration: "6h",
          description: "Infrastructure as Code with Terraform. Write, plan, apply.",
          links: [{ label: "HashiCorp Learn", url: "https://developer.hashicorp.com" }],
          tags: ["iac", "terraform"],
        },
        position: { x: 620, y: 80 },
      },
      {
        id: "c4",
        data: {
          title: "AWS Solutions Architect",
          type: "certificate",
          difficulty: "advanced",
          min_years: 2,
          duration: "40h prep",
          description: "Professional-level AWS certification for designing distributed systems.",
          links: [{ label: "AWS Cert", url: "https://aws.amazon.com/certification" }],
          tags: ["aws", "certification", "architecture"],
        },
        position: { x: 620, y: 320 },
      },
      {
        id: "c5",
        data: {
          title: "Kubernetes in Production",
          type: "course",
          difficulty: "advanced",
          min_years: 3,
          duration: "15h",
          description: "Running and operating Kubernetes clusters at scale.",
          links: [{ label: "KodeKloud", url: "https://kodekloud.com" }],
          tags: ["k8s", "containers"],
        },
        position: { x: 900, y: 200 },
      },
    ],
    edges: [
      { id: "ce1", source: "c1", target: "c2", label: "requires" },
      { id: "ce2", source: "c2", target: "c3", label: "recommends" },
      { id: "ce3", source: "c2", target: "c4", label: "requires" },
      { id: "ce4", source: "c3", target: "c5", label: "recommends" },
      { id: "ce5", source: "c4", target: "c5", label: "recommends" },
    ],
  },
  security: {
    nodes: [
      {
        id: "s1",
        data: {
          title: "OWASP Top 10",
          type: "article",
          difficulty: "beginner",
          min_years: 0,
          duration: "3h",
          description: "The ten most critical web application security risks. Essential reading for every developer.",
          links: [{ label: "OWASP.org", url: "https://owasp.org/Top10" }],
          tags: ["web", "fundamentals"],
        },
        position: { x: 60, y: 200 },
      },
      {
        id: "s2",
        data: {
          title: "Secure Coding Practices",
          type: "course",
          difficulty: "beginner",
          min_years: 1,
          duration: "5h",
          description: "Input validation, output encoding, authentication, and session management.",
          links: [{ label: "SANS Course", url: "https://sans.org" }],
          tags: ["secure-coding", "fundamentals"],
        },
        position: { x: 340, y: 200 },
      },
      {
        id: "s3",
        data: {
          title: "Threat Modeling",
          type: "course",
          difficulty: "intermediate",
          min_years: 2,
          duration: "6h",
          description: "STRIDE, PASTA, and practical threat modeling for software teams.",
          links: [{ label: "OWASP TM", url: "https://owasp.org/threat-modeling" }],
          tags: ["threat-modeling", "design"],
        },
        position: { x: 620, y: 80 },
      },
      {
        id: "s4",
        data: {
          title: "CompTIA Security+",
          type: "certificate",
          difficulty: "intermediate",
          min_years: 2,
          duration: "30h prep",
          description: "Widely recognized security certification covering core concepts.",
          links: [{ label: "CompTIA", url: "https://comptia.org" }],
          tags: ["certification", "compliance"],
        },
        position: { x: 620, y: 320 },
      },
      {
        id: "s5",
        data: {
          title: "Penetration Testing Basics",
          type: "course",
          difficulty: "advanced",
          min_years: 3,
          duration: "20h",
          description: "Ethical hacking fundamentals: reconnaissance, exploitation, reporting.",
          links: [{ label: "TryHackMe", url: "https://tryhackme.com" }],
          tags: ["pentesting", "ethical-hacking"],
        },
        position: { x: 900, y: 200 },
      },
    ],
    edges: [
      { id: "se1", source: "s1", target: "s2", label: "requires" },
      { id: "se2", source: "s2", target: "s3", label: "recommends" },
      { id: "se3", source: "s2", target: "s4", label: "recommends" },
      { id: "se4", source: "s3", target: "s5", label: "recommends" },
      { id: "se5", source: "s4", target: "s5", label: "recommends" },
    ],
  },
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TYPE_ICONS = { course: "📚", article: "📄", certificate: "🏆", video: "🎥" };
const DIFF_COLORS = {
  beginner: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  intermediate: { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  advanced: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

// ─── CUSTOM NODE ─────────────────────────────────────────────────────────────

function LearningNode({ data, selected }) {
  const diff = DIFF_COLORS[data.difficulty];
  const themeColor = data.themeColor || "#6366f1";

  return (
    <div
      style={{
        background: selected ? "#1e1b4b" : "#0f172a",
        border: `2px solid ${selected ? themeColor : "#1e293b"}`,
        borderRadius: 12,
        padding: "12px 16px",
        minWidth: 200,
        maxWidth: 220,
        boxShadow: selected
          ? `0 0 0 3px ${themeColor}44, 0 8px 32px #00000088`
          : "0 4px 16px #00000066",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: themeColor, border: "none", width: 8, height: 8 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>{TYPE_ICONS[data.type] || "📦"}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "2px 6px",
            borderRadius: 4,
            background: diff.bg,
            color: diff.text,
            border: `1px solid ${diff.border}`,
          }}
        >
          {data.difficulty}
        </span>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3, marginBottom: 6 }}>
        {data.title}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9, color: "#94a3b8", background: "#1e293b", padding: "1px 5px", borderRadius: 3 }}>
          ⏱ {data.duration}
        </span>
        {data.min_years > 0 && (
          <span style={{ fontSize: 9, color: "#94a3b8", background: "#1e293b", padding: "1px 5px", borderRadius: 3 }}>
            {data.min_years}yr+ exp
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: themeColor, border: "none", width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { learning: LearningNode };

// ─── SIDE PANEL ──────────────────────────────────────────────────────────────

function SidePanel({ node, themeColor, onClose }) {
  if (!node) return null;
  const d = node.data;
  const diff = DIFF_COLORS[d.difficulty];

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 300,
        background: "#0f172a",
        borderLeft: `1px solid #1e293b`,
        padding: 24,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: "'IBM Plex Mono', monospace",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 24 }}>{TYPE_ICONS[d.type]}</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" }}
        >✕</button>
      </div>

      <div>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: themeColor, marginBottom: 6 }}>
          {d.type}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.4 }}>{d.title}</div>
      </div>

      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{d.description}</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: diff.bg, color: diff.text, fontWeight: 600 }}>
          {d.difficulty}
        </span>
        <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "#1e293b", color: "#94a3b8" }}>
          ⏱ {d.duration}
        </span>
        {d.min_years > 0 && (
          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "#1e293b", color: "#94a3b8" }}>
            {d.min_years}yr+ recommended
          </span>
        )}
      </div>

      {d.tags?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tags</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {d.tags.map((t) => (
              <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: "#1e293b", color: "#64748b", border: "1px solid #334155" }}>
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {d.links?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Resources</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {d.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 11,
                  color: themeColor,
                  textDecoration: "none",
                  padding: "8px 10px",
                  background: "#1e293b",
                  borderRadius: 6,
                  border: `1px solid #334155`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {l.label} <span style={{ opacity: 0.5 }}>→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GRAPH VIEW ──────────────────────────────────────────────────────────────

function GraphView({ themeKey }) {
  const theme = THEMES[themeKey];
  const path = PATHS[themeKey];
  const [selectedNode, setSelectedNode] = useState(null);

  const initialNodes = useMemo(() =>
    path.nodes.map((n) => ({
      ...n,
      type: "learning",
      data: { ...n.data, themeColor: theme.color },
    })),
    [path, theme]
  );

  const initialEdges = useMemo(() =>
    path.edges.map((e) => ({
      ...e,
      type: "smoothstep",
      animated: e.label === "requires",
      style: { stroke: e.label === "requires" ? theme.color : "#334155", strokeWidth: e.label === "requires" ? 2 : 1.5 },
      labelStyle: { fill: "#64748b", fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" },
      labelBgStyle: { fill: "#0f172a" },
      markerEnd: { type: MarkerType.ArrowClosed, color: e.label === "requires" ? theme.color : "#334155" },
    })),
    [path, theme]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelectedNode(null)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{ background: "#020617" }}
      >
        <Background color="#1e293b" gap={24} size={1} />
        <Controls style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
        <MiniMap
          nodeColor={() => theme.color}
          maskColor="#02061799"
          style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
        />
      </ReactFlow>

      <SidePanel
        node={selectedNode}
        themeColor={theme.color}
        onClose={() => setSelectedNode(null)}
      />

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 16, left: 16, background: "#0f172a",
        border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px",
        fontFamily: "'IBM Plex Mono', monospace", display: "flex", gap: 14, zIndex: 5,
      }}>
        {[["animated", theme.color, "requires"], ["static", "#334155", "recommends"]].map(([, color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 20, height: 2, background: color, borderRadius: 1 }} />
            <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
          </div>
        ))}
        <div style={{ width: 1, background: "#1e293b" }} />
        {Object.entries(DIFF_COLORS).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: val.bg, border: `1px solid ${val.border}` }} />
            <span style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTheme, setActiveTheme] = useState(null);

  return (
    <div style={{
      display: "flex", height: "100vh", background: "#020617",
      fontFamily: "'IBM Plex Mono', monospace", color: "#f1f5f9",
    }}>
      {/* Sidebar */}
      <div style={{
        width: 240, background: "#0a0f1e", borderRight: "1px solid #1e293b",
        display: "flex", flexDirection: "column", padding: "24px 0",
        flexShrink: 0,
      }}>
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>
            DevPath
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>
            Learning<br />Explorer
          </div>
        </div>

        <div style={{ padding: "0 12px", marginBottom: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#334155", paddingLeft: 8, marginBottom: 8 }}>
            Themes
          </div>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setActiveTheme(key)}
              style={{
                width: "100%", textAlign: "left", background: activeTheme === key ? "#1e293b" : "none",
                border: "none", borderRadius: 8, padding: "10px 12px", cursor: "pointer",
                color: activeTheme === key ? "#f1f5f9" : "#64748b",
                display: "flex", alignItems: "center", gap: 10, marginBottom: 2,
                borderLeft: activeTheme === key ? `3px solid ${theme.color}` : "3px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: activeTheme === key ? 600 : 400 }}>{theme.label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: "auto", padding: "0 20px" }}>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 16 }}>
            <div style={{ fontSize: 9, color: "#334155", lineHeight: 1.6 }}>
              Click a node to see details and links.
              <br /><br />
              Animated edges = required.
              <br />
              Dashed edges = recommended.
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeTheme ? (
          <>
            <div style={{
              padding: "16px 24px", borderBottom: "1px solid #1e293b",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: THEMES[activeTheme].color }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>{THEMES[activeTheme].label}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>{THEMES[activeTheme].description}</span>
            </div>
            <GraphView key={activeTheme} themeKey={activeTheme} />
          </>
        ) : (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>Pick a learning theme</div>
            <div style={{ fontSize: 11, color: "#475569", textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
              Select a theme from the sidebar to explore the learning path and see what courses, articles, and certifications are recommended.
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              {Object.entries(THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setActiveTheme(key)}
                  style={{
                    background: "#0f172a", border: `1px solid ${theme.color}33`,
                    borderRadius: 8, padding: "10px 16px", cursor: "pointer",
                    color: theme.color, fontSize: 11, fontWeight: 600,
                    fontFamily: "'IBM Plex Mono', monospace",
                    transition: "all 0.15s ease",
                  }}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
