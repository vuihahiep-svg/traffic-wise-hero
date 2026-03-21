import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createHCMGraph, findShortestPath, type CityGraph, type GraphNode, type GraphEdge } from "@/lib/graph";
import { Link } from "react-router-dom";

// Fix leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const nodeIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;background:${color};border:2px solid #041329;border-radius:50%;box-shadow:0 0 8px ${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

const getEdgeColor = (weight: number) => {
  if (weight <= 20) return "#3ce36a";
  if (weight <= 50) return "#a5c8ff";
  if (weight <= 75) return "#ffb4ab";
  return "#ff4444";
};

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, 13); }, [center, map]);
  return null;
};

const Demo = () => {
  const [graph, setGraph] = useState<CityGraph>(createHCMGraph);
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [bestPath, setBestPath] = useState<{ path: string[]; edgeIds: string[]; totalWeight: number } | null>(null);
  const [audioText, setAudioText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const findRoute = () => {
    if (!startNode || !endNode) return;
    if (startNode === endNode) { addLog("⚠ Start and end must be different"); return; }
    const result = findShortestPath(graph, startNode, endNode);
    if (result.totalWeight === Infinity) {
      addLog("❌ No path found");
      setBestPath(null);
      return;
    }
    setBestPath(result);
    const nodeNames = result.path.map((id) => graph.nodes.find((n) => n.id === id)?.name).join(" → ");
    addLog(`✅ Route found: ${nodeNames} (Total weight: ${result.totalWeight})`);
  };

  const handleTrafficReport = () => {
    if (!audioText.trim()) return;
    const text = audioText.toLowerCase();
    // Simple keyword matching for demo
    const updatedGraph = { ...graph, edges: [...graph.edges], nodes: [...graph.nodes] };
    let found = false;

    for (const edge of updatedGraph.edges) {
      const eName = edge.name.toLowerCase();
      if (text.includes(eName) || text.includes(edge.name)) {
        if (text.includes("tắc") || text.includes("kẹt") || text.includes("jam") || text.includes("blocked") || text.includes("congestion")) {
          edge.weight = text.includes("nghiêm trọng") || text.includes("severe") ? 100 : 85;
          addLog(`🚗 Traffic alert: "${edge.name}" weight updated to ${edge.weight}`);
          found = true;
        } else if (text.includes("thông") || text.includes("clear") || text.includes("free")) {
          edge.weight = 10;
          addLog(`🟢 Road cleared: "${edge.name}" weight updated to ${edge.weight}`);
          found = true;
        }
      }
    }

    if (!found) addLog(`⚠ Could not match road in report: "${audioText}"`);
    setGraph(updatedGraph);
    setAudioText("");
    // Re-calculate route if exists
    if (bestPath && startNode && endNode) {
      const result = findShortestPath(updatedGraph, startNode, endNode);
      setBestPath(result);
      addLog("🔄 Route recalculated after traffic update");
    }
  };

  const handleFloodImage = () => {
    if (!imageFile) return;
    // Simulate LLM flood detection (in production this would call an AI edge function)
    addLog(`📸 Analyzing image: ${imageFile.name}...`);

    // For demo: randomly pick a node to mark as flooded
    const randomIdx = Math.floor(Math.random() * graph.nodes.length);
    const updatedGraph = { ...graph, nodes: graph.nodes.map((n, i) => {
      if (i === randomIdx) {
        const floodScore = 70 + Math.floor(Math.random() * 30);
        addLog(`🌊 FLOOD DETECTED near "${n.name}" - flood score: ${floodScore}`);
        return { ...n, flooded: true, floodScore };
      }
      return n;
    }), edges: [...graph.edges] };

    setGraph(updatedGraph);
    setImageFile(null);

    if (bestPath && startNode && endNode) {
      const result = findShortestPath(updatedGraph, startNode, endNode);
      setBestPath(result);
      addLog("🔄 Route recalculated after flood detection");
    }
  };

  const resetGraph = () => {
    setGraph(createHCMGraph());
    setBestPath(null);
    setStartNode("");
    setEndNode("");
    addLog("🔄 Graph reset to default");
  };

  // Build polylines for all edges
  const edgePolylines = graph.edges.map((edge) => {
    const fromNode = graph.nodes.find((n) => n.id === edge.from)!;
    const toNode = graph.nodes.find((n) => n.id === edge.to)!;
    const isOnBestPath = bestPath?.edgeIds.includes(edge.id);
    return {
      edge,
      positions: [[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]] as [number, number][],
      color: isOnBestPath ? "#2792ff" : getEdgeColor(edge.weight),
      weight: isOnBestPath ? 5 : 2,
      opacity: isOnBestPath ? 1 : 0.5,
    };
  });

  return (
    <div className="min-h-screen bg-surface pt-20 font-body">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase">
              <span className="text-gradient">Live Demo</span> — HCM City Navigation
            </h1>
            <p className="text-on-surface-variant text-sm mt-2">Interactive graph-based routing with real-time condition updates</p>
          </div>
          <Link to="/" className="text-on-surface-variant hover:text-on-surface text-sm font-headline uppercase tracking-widest">← Back</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAP */}
          <div className="lg:col-span-2 glass rounded-md border border-on-surface/10 overflow-hidden" style={{ minHeight: 500 }}>
            <MapContainer center={[10.7900, 106.6900]} zoom={13} style={{ height: "100%", minHeight: 500 }} className="z-0">
              <MapUpdater center={[10.7900, 106.6900]} />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />
              {/* Edges */}
              {edgePolylines.map((ep) => (
                <Polyline key={ep.edge.id} positions={ep.positions} color={ep.color} weight={ep.weight} opacity={ep.opacity}>
                  <Popup>
                    <div className="text-xs font-body">
                      <strong>{ep.edge.name}</strong><br />
                      Weight: <span className="font-bold">{ep.edge.weight}</span>/100
                    </div>
                  </Popup>
                </Polyline>
              ))}
              {/* Nodes */}
              {graph.nodes.map((node) => (
                <Marker
                  key={node.id}
                  position={[node.lat, node.lng]}
                  icon={nodeIcon(
                    node.id === startNode ? "#2792ff" : node.id === endNode ? "#3ce36a" : node.flooded ? "#ff4444" : "#a5c8ff"
                  )}
                >
                  <Popup>
                    <div className="text-xs font-body">
                      <strong>{node.name}</strong><br />
                      {node.flooded && <span className="text-red-500 font-bold">🌊 FLOODED (Score: {node.floodScore})</span>}
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Flood circles */}
              {graph.nodes.filter((n) => n.flooded).map((n) => (
                <Circle key={`flood-${n.id}`} center={[n.lat, n.lng]} radius={400} pathOptions={{ color: "#ff4444", fillColor: "#ff4444", fillOpacity: 0.2, weight: 2 }} />
              ))}
            </MapContainer>
          </div>

          {/* CONTROLS */}
          <div className="space-y-4">
            {/* Route finder */}
            <div className="glass rounded-md border border-on-surface/10 p-6">
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-primary">Find Route</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">Start</label>
                  <select value={startNode} onChange={(e) => setStartNode(e.target.value)} className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 text-sm text-on-surface focus:border-primary outline-none">
                    <option value="">Select start point</option>
                    {graph.nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">End</label>
                  <select value={endNode} onChange={(e) => setEndNode(e.target.value)} className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 text-sm text-on-surface focus:border-primary outline-none">
                    <option value="">Select end point</option>
                    {graph.nodes.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <button onClick={findRoute} className="w-full bg-primary-container text-primary-container-foreground py-2.5 rounded font-headline font-bold uppercase tracking-widest text-sm active:scale-95 transition-transform">
                  Find Best Route
                </button>
                <button onClick={resetGraph} className="w-full border border-outline-variant/20 text-on-surface-variant py-2 rounded text-xs uppercase tracking-widest active:scale-95 transition-transform">
                  Reset All
                </button>
              </div>
              {bestPath && (
                <div className="mt-4 p-3 bg-primary/10 border-l-4 border-primary rounded-r text-xs">
                  <div className="font-bold text-primary mb-1">Route Found (Weight: {bestPath.totalWeight})</div>
                  {bestPath.path.map((id) => graph.nodes.find((n) => n.id === id)?.name).join(" → ")}
                </div>
              )}
            </div>

            {/* Traffic report */}
            <div className="glass rounded-md border border-on-surface/10 p-6">
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-error">Traffic Report</h3>
              <p className="text-[10px] text-on-surface-variant mb-3">Enter a traffic report (e.g. "Lê Lợi đang bị tắc nghiêm trọng")</p>
              <textarea
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                placeholder="Nhập thông tin tắc đường..."
                className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 text-sm text-on-surface focus:border-error outline-none resize-none h-20"
              />
              <button onClick={handleTrafficReport} className="w-full mt-2 bg-error-container text-error py-2 rounded font-headline font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform">
                Report Traffic
              </button>
            </div>

            {/* Flood detection */}
            <div className="glass rounded-md border border-on-surface/10 p-6">
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-tertiary">Flood Detection</h3>
              <p className="text-[10px] text-on-surface-variant mb-3">Upload an image to detect flooding (simulated AI analysis)</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-tertiary/20 file:text-tertiary"
              />
              {imageFile && (
                <button onClick={handleFloodImage} className="w-full mt-2 bg-tertiary/20 text-tertiary py-2 rounded font-headline font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform">
                  Analyze for Flood
                </button>
              )}
            </div>

            {/* Legend */}
            <div className="glass rounded-md border border-on-surface/10 p-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#3ce36a] rounded" /> Good (1-20)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#a5c8ff] rounded" /> Moderate (21-50)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#ffb4ab] rounded" /> Bad (51-75)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#ff4444] rounded" /> Severe (76-100)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[#2792ff] rounded" style={{ height: 4 }} /> Best Route</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-[#ff4444] bg-[#ff4444]/20" /> Flood Zone</div>
              </div>
            </div>
          </div>
        </div>

        {/* Log */}
        <div className="mt-6 glass rounded-md border border-on-surface/10 p-4">
          <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">System Log</h4>
          <div ref={logRef} className="h-32 overflow-y-auto text-xs font-label text-on-surface-variant space-y-1 scrollbar-thin">
            {log.length === 0 && <div className="text-on-surface-variant/40">Waiting for actions...</div>}
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
