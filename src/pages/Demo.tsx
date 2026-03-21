import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createHCMGraph, findShortestPath, type CityGraph } from "@/lib/graph";
import { Link } from "react-router-dom";

const MAP_CENTER: [number, number] = [10.79, 106.69];

const getEdgeColor = (weight: number) => {
  if (weight <= 20) return "#3ce36a";
  if (weight <= 50) return "#a5c8ff";
  if (weight <= 75) return "#ffb4ab";
  return "#ff4444";
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(MAP_CENTER, 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      layerGroup.clearLayers();
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    graph.edges.forEach((edge) => {
      const fromNode = graph.nodes.find((n) => n.id === edge.from);
      const toNode = graph.nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const isOnBestPath = bestPath?.edgeIds.includes(edge.id) ?? false;
      const polyline = L.polyline(
        [
          [fromNode.lat, fromNode.lng],
          [toNode.lat, toNode.lng],
        ],
        {
          color: isOnBestPath ? "#2792ff" : getEdgeColor(edge.weight),
          weight: isOnBestPath ? 6 : 3,
          opacity: isOnBestPath ? 1 : 0.6,
        }
      ).bindPopup(`<strong>${edge.name}</strong><br/>Weight: ${edge.weight}/100`);

      polyline.addTo(layerGroup);
    });

    graph.nodes.forEach((node) => {
      const markerColor = node.id === startNode
        ? "#2792ff"
        : node.id === endNode
          ? "#3ce36a"
          : node.flooded
            ? "#ff4444"
            : "#a5c8ff";

      const marker = L.circleMarker([node.lat, node.lng], {
        radius: 7,
        color: "#041329",
        weight: 2,
        fillColor: markerColor,
        fillOpacity: 1,
      }).bindPopup(`
        <div style="font-size:12px;line-height:1.5;">
          <strong>${node.name}</strong><br/>
          ${node.flooded ? `<span style="color:#ff4444;font-weight:700;">🌊 FLOODED (Score: ${node.floodScore})</span>` : "Normal"}
        </div>
      `);

      marker.addTo(layerGroup);

      if (node.flooded) {
        L.circle([node.lat, node.lng], {
          radius: 400,
          color: "#ff4444",
          fillColor: "#ff4444",
          fillOpacity: 0.18,
          weight: 2,
        }).addTo(layerGroup);
      }
    });
  }, [graph, startNode, endNode, bestPath]);

  const recalculateRoute = useCallback((nextGraph: CityGraph) => {
    if (!startNode || !endNode) return;
    const result = findShortestPath(nextGraph, startNode, endNode);
    setBestPath(result.totalWeight === Infinity ? null : result);
  }, [startNode, endNode]);

  const findRoute = () => {
    if (!startNode || !endNode) return;
    if (startNode === endNode) {
      addLog("⚠ Start and end must be different");
      return;
    }

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
    const updatedGraph = {
      ...graph,
      edges: graph.edges.map((edge) => {
        const edgeName = edge.name.toLowerCase();
        const matchesRoad = text.includes(edgeName);
        if (!matchesRoad) return edge;

        if (text.includes("tắc") || text.includes("kẹt") || text.includes("jam") || text.includes("blocked") || text.includes("congestion")) {
          const nextWeight = text.includes("nghiêm trọng") || text.includes("severe") ? 100 : 85;
          addLog(`🚗 Traffic alert: "${edge.name}" weight updated to ${nextWeight}`);
          return { ...edge, weight: nextWeight };
        }

        if (text.includes("thông") || text.includes("clear") || text.includes("free")) {
          addLog(`🟢 Road cleared: "${edge.name}" weight updated to 10`);
          return { ...edge, weight: 10 };
        }

        return edge;
      }),
      nodes: [...graph.nodes],
    };

    const changed = updatedGraph.edges.some((edge, index) => edge.weight !== graph.edges[index].weight);
    if (!changed) {
      addLog(`⚠ Could not match road in report: "${audioText}"`);
    }

    setGraph(updatedGraph);
    setAudioText("");
    if (changed) {
      recalculateRoute(updatedGraph);
      addLog("🔄 Route recalculated after traffic update");
    }
  };

  const handleFloodImage = () => {
    if (!imageFile) return;

    addLog(`📸 Analyzing image: ${imageFile.name}...`);
    const randomIdx = Math.floor(Math.random() * graph.nodes.length);

    const updatedGraph = {
      ...graph,
      edges: [...graph.edges],
      nodes: graph.nodes.map((node, index) => {
        if (index !== randomIdx) return node;
        const floodScore = 70 + Math.floor(Math.random() * 30);
        addLog(`🌊 FLOOD DETECTED near "${node.name}" - flood score: ${floodScore}`);
        return { ...node, flooded: true, floodScore };
      }),
    };

    setGraph(updatedGraph);
    setImageFile(null);
    recalculateRoute(updatedGraph);
    addLog("🔄 Route recalculated after flood detection");
  };

  const resetGraph = () => {
    const freshGraph = createHCMGraph();
    setGraph(freshGraph);
    setBestPath(null);
    setStartNode("");
    setEndNode("");
    setAudioText("");
    setImageFile(null);
    addLog("🔄 Graph reset to default");
  };

  return (
    <div className="min-h-screen bg-surface pt-20 font-body">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase">
              <span className="text-gradient">Live Demo</span> — HCM City Navigation
            </h1>
            <p className="text-on-surface-variant text-sm mt-2">Interactive graph-based routing with real-time condition updates</p>
          </div>
          <Link to="/" className="text-on-surface-variant hover:text-on-surface text-sm font-headline uppercase tracking-widest">
            ← Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-md border border-on-surface/10 overflow-hidden" style={{ minHeight: 500 }}>
            <div ref={mapContainerRef} className="h-full min-h-[500px] w-full" />
          </div>

          <div className="space-y-4">
            <div className="glass rounded-md border border-on-surface/10 p-6">
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-primary">Find Route</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">Start</label>
                  <select value={startNode} onChange={(e) => setStartNode(e.target.value)} className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 text-sm text-on-surface focus:border-primary outline-none">
                    <option value="">Select start point</option>
                    {graph.nodes.map((node) => (
                      <option key={node.id} value={node.id}>{node.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">End</label>
                  <select value={endNode} onChange={(e) => setEndNode(e.target.value)} className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 text-sm text-on-surface focus:border-primary outline-none">
                    <option value="">Select end point</option>
                    {graph.nodes.map((node) => (
                      <option key={node.id} value={node.id}>{node.name}</option>
                    ))}
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
                  {bestPath.path.map((id) => graph.nodes.find((node) => node.id === id)?.name).join(" → ")}
                </div>
              )}
            </div>

            <div className="glass rounded-md border border-on-surface/10 p-6">
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-error">Traffic Report</h3>
              <p className="text-[10px] text-on-surface-variant mb-3">Enter a traffic report (e.g. &quot;Lê Lợi đang bị tắc nghiêm trọng&quot;)</p>
              <textarea
                value={audioText}
                onChange={(e) => setAudioText(e.target.value)}
                placeholder="Nhập thông tin tắc đường..."
                className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 text-sm text-on-surface focus:border-destructive outline-none resize-none h-20"
              />
              <button onClick={handleTrafficReport} className="w-full mt-2 bg-destructive/15 text-error py-2 rounded font-headline font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform">
                Report Traffic
              </button>
            </div>

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

            <div className="glass rounded-md border border-on-surface/10 p-4">
              <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: "#3ce36a" }} /> Good (1-20)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: "#a5c8ff" }} /> Moderate (21-50)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: "#ffb4ab" }} /> Bad (51-75)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-1 rounded" style={{ backgroundColor: "#ff4444" }} /> Severe (76-100)</div>
                <div className="flex items-center gap-2"><div className="w-4 rounded" style={{ backgroundColor: "#2792ff", height: 4 }} /> Best Route</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2" style={{ borderColor: "#ff4444", backgroundColor: "rgba(255,68,68,0.2)" }} /> Flood Zone</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 glass rounded-md border border-on-surface/10 p-4">
          <h4 className="font-headline font-bold text-xs uppercase tracking-widest mb-3 text-on-surface-variant">System Log</h4>
          <div ref={logRef} className="h-32 overflow-y-auto text-xs font-label text-on-surface-variant space-y-1">
            {log.length === 0 && <div className="text-on-surface-variant/40">Waiting for actions...</div>}
            {log.map((entry, index) => (
              <div key={index}>{entry}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
