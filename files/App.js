import { useState, useCallback, useEffect, useMemo } from "react";
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

// ─── DATA LOADING ─────────────────────────────────────────────────────────────

// In create-react-app, JSON files in /src can be imported dynamically via fetch
// We use process.env.PUBLIC_URL trick: instead we place data in /src/data and
// use dynamic import() which webpack supports for JSON files.

async function loadTopics() {
  const mod = await import("./data/topics.json");
  return mod.default;
}

async function loadPath(pathFile) {
  // pathFile looks like "paths/events/path.json"
  // dynamic import needs a relative path from this file
  const mod = await import(`./data/${pathFile}`);
  return mod.default;
}

async function loadNode(nodeFile) {
  const mod = await import(`./data/${nodeFile}`);
  return mod.default;
}

async function loadFullPath(topic) {
  const path = await loadPath(topic.pathFile);
  const nodeData = await Promise.all(path.nodeFiles.map((f) => loadNode(f)));

  // Build a lookup map for quick access
  const nodeMap = {};
  nodeData.forEach((n) => (nodeMap[n.id] = n));

  return { path, nodeMap };
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TYPE_ICONS = { course: "📚", article: "📄", certificate: "🏆", video: "🎥" };

const DIFF_COLORS = {
  beginner:     { bg: "#dcfce7", text: "#166534", border: "#86efac" },
  intermediate: { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  advanced:     { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

// ─── CUSTOM NODE ──────────────────────────────────────────────────────────────

function LearningNode({ data, selected }) {
  const diff = DIFF_COLORS[data.difficulty] || DIFF_COLORS.beginner;
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
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: themeColor, border: "none", width: 8, height: 8 }}
      />

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

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: themeColor, border: "none", width: 8, height: 8 }}
      />
    </div>
  );
}

const nodeTypes = { learning: LearningNode };

// ─── SIDE PANEL ───────────────────────────────────────────────────────────────

function SidePanel({ node, themeColor, onClose }) {
  if (!node) return null;
  const d = node.data;
  const diff = DIFF_COLORS[d.difficulty] || DIFF_COLORS.beginner;

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 300,
        background: "#0f172a",
        borderLeft: "1px solid #1e293b",
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
        <span style={{ fontSize: 24 }}>{TYPE_ICONS[d.type] || "📦"}</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#64748b", fontSize: 18, cursor: "pointer" }}
        >
          ✕
        </button>
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
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Tags
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {d.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 3,
                  background: "#1e293b",
                  color: "#64748b",
                  border: "1px solid #334155",
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {d.links?.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Resources
          </div>
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
                  border: "1px solid #334155",
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

// ─── GRAPH VIEW ───────────────────────────────────────────────────────────────

function GraphView({ topic, path, nodeMap }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const initialNodes = useMemo(() =>
    path.nodeFiles.map((file) => {
      const nodeId = file.split("/").pop().replace(".json", "");
      const nodeData = nodeMap[nodeId];
      const position = path.layout[nodeId] || { x: 0, y: 0 };
      return {
        id: nodeId,
        type: "learning",
        position,
        data: { ...nodeData, themeColor: topic.color },
      };
    }),
    [path, nodeMap, topic]
  );

  const initialEdges = useMemo(() =>
    path.edges.map((e) => ({
      ...e,
      type: "smoothstep",
      animated: e.relationship === "requires",
      style: {
        stroke: e.relationship === "requires" ? topic.color : "#334155",
        strokeWidth: e.relationship === "requires" ? 2 : 1.5,
      },
      label: e.relationship,
      labelStyle: { fill: "#64748b", fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" },
      labelBgStyle: { fill: "#0f172a" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.relationship === "requires" ? topic.color : "#334155",
      },
    })),
    [path, topic]
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
          nodeColor={() => topic.color}
          maskColor="#02061799"
          style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
        />
      </ReactFlow>

      <SidePanel
        node={selectedNode}
        themeColor={topic.color}
        onClose={() => setSelectedNode(null)}
      />

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "'IBM Plex Mono', monospace",
          display: "flex",
          gap: 14,
          zIndex: 5,
          flexWrap: "wrap",
        }}
      >
        {[["requires", topic.color], ["recommends", "#334155"]].map(([label, color]) => (
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

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [pathData, setPathData] = useState(null);   // { path, nodeMap }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load topics list on mount
  useEffect(() => {
    loadTopics()
      .then(setTopics)
      .catch((e) => setError("Failed to load topics: " + e.message));
  }, []);

  // Load path + nodes when a topic is selected
  useEffect(() => {
    if (!activeTopic) return;
    setLoading(true);
    setPathData(null);
    setError(null);
    loadFullPath(activeTopic)
      .then((data) => {
        setPathData(data);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load path: " + e.message);
        setLoading(false);
      });
  }, [activeTopic]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#020617",
        fontFamily: "'IBM Plex Mono', monospace",
        color: "#f1f5f9",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          background: "#0a0f1e",
          borderRight: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>
            DevPath
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>
            Learning<br />Explorer
          </div>
        </div>

        <div style={{ padding: "0 12px", marginBottom: 8 }}>
          <div
            style={{
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#334155",
              paddingLeft: 8,
              marginBottom: 8,
            }}
          >
            Topics
          </div>

          {topics.length === 0 && (
            <div style={{ fontSize: 10, color: "#475569", paddingLeft: 8 }}>Loading topics…</div>
          )}

          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic)}
              style={{
                width: "100%",
                textAlign: "left",
                background: activeTopic?.id === topic.id ? "#1e293b" : "none",
                border: "none",
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                color: activeTopic?.id === topic.id ? "#f1f5f9" : "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 2,
                borderLeft: activeTopic?.id === topic.id
                  ? `3px solid ${topic.color}`
                  : "3px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{ width: 8, height: 8, borderRadius: "50%", background: topic.color, flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, fontWeight: activeTopic?.id === topic.id ? 600 : 400 }}>
                {topic.label}
              </span>
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
              Static edges = recommended.
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {error && (
          <div style={{ padding: 16, background: "#450a0a", color: "#fca5a5", fontSize: 11 }}>
            ⚠ {error}
          </div>
        )}

        {activeTopic && (
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #1e293b",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: activeTopic.color }} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{activeTopic.label}</span>
            <span style={{ fontSize: 11, color: "#475569" }}>{activeTopic.description}</span>
          </div>
        )}

        {loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              fontSize: 11,
              gap: 8,
            }}
          >
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            Loading path…
          </div>
        )}

        {!loading && activeTopic && pathData && (
          <GraphView
            key={activeTopic.id}
            topic={activeTopic}
            path={pathData.path}
            nodeMap={pathData.nodeMap}
          />
        )}

        {!activeTopic && !loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>Pick a learning topic</div>
            <div
              style={{ fontSize: 11, color: "#475569", textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}
            >
              Select a topic from the sidebar to explore the learning path and see what courses, articles, and certifications are recommended.
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  style={{
                    background: "#0f172a",
                    border: `1px solid ${topic.color}33`,
                    borderRadius: 8,
                    padding: "10px 16px",
                    cursor: "pointer",
                    color: topic.color,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'IBM Plex Mono', monospace",
                    transition: "all 0.15s ease",
                  }}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
