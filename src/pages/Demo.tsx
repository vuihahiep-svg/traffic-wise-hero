import { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createHCMGraph, findShortestPath, type CityGraph } from "@/lib/graph";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mic, MicOff, Upload } from "lucide-react";

const MAP_CENTER: [number, number] = [10.79, 106.69];

const getEdgeColor = (weight: number) => {
  if (weight <= 20) return "#3ce36a";
  if (weight <= 50) return "#a5c8ff";
  if (weight <= 75) return "#ffb4ab";
  return "#ff4444";
};

const LoadingOverlay = ({ label }: { label: string }) => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/70 backdrop-blur-sm rounded-md">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <span className="text-xs uppercase tracking-widest text-on-surface-variant font-headline">{label}</span>
      <div className="w-32 h-1 bg-on-surface/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  </div>
);

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Demo = () => {
  const [graph, setGraph] = useState<CityGraph>(createHCMGraph);
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [bestPath, setBestPath] = useState<{ path: string[]; edgeIds: string[]; totalWeight: number } | null>(null);
  const [audioText, setAudioText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const audioRecognitionRef = useRef<any>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioMode, setAudioMode] = useState<"mic" | "file">("file");
  const [audioTranscript, setAudioTranscript] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [preAnalysisGraph, setPreAnalysisGraph] = useState<CityGraph | null>(null);
  const [showRemoveOptions, setShowRemoveOptions] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingTraffic, setLoadingTraffic] = useState(false);
  const [loadingFlood, setLoadingFlood] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<"flood" | "traffic">("flood");

  const logRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const recognitionRef = useRef<any>(null);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Map initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: true, attributionControl: true }).setView(MAP_CENTER, 13);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);
    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;
    return () => { layerGroup.clearLayers(); map.remove(); mapRef.current = null; layerGroupRef.current = null; };
  }, []);

  // Map rendering
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
      const isTrafficJam = edge.weight >= 70;
      L.polyline([[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]], {
        color: isOnBestPath ? "#2792ff" : getEdgeColor(edge.weight),
        weight: isOnBestPath ? 6 : isTrafficJam ? 5 : 3,
        opacity: isOnBestPath ? 1 : 0.6,
        dashArray: isTrafficJam && !isOnBestPath ? "8 6" : undefined,
      }).bindPopup(`<strong>${edge.name}</strong><br/>Weight: ${edge.weight}/100${isTrafficJam ? '<br/><span style="color:#ff4444;font-weight:700;">⚠️ TRAFFIC JAM</span>' : ''}`).addTo(layerGroup);
      // Traffic zone circle at midpoint for heavily congested roads
      if (edge.weight >= 80) {
        const midLat = (fromNode.lat + toNode.lat) / 2;
        const midLng = (fromNode.lng + toNode.lng) / 2;
        L.circle([midLat, midLng], { radius: 250, color: "#ff8800", fillColor: "#ff8800", fillOpacity: 0.12, weight: 1, dashArray: "4 4" }).addTo(layerGroup);
      }
    });

    graph.nodes.forEach((node) => {
      const markerColor = node.id === startNode ? "#2792ff" : node.id === endNode ? "#3ce36a" : node.flooded ? "#ff4444" : node.floodScore >= 70 ? "#ff8800" : "#a5c8ff";
      L.circleMarker([node.lat, node.lng], {
        radius: 7, color: "#041329", weight: 2, fillColor: markerColor, fillOpacity: 1,
      }).bindPopup(`<div style="font-size:12px;line-height:1.5;"><strong>${node.name}</strong><br/>${node.flooded ? `<span style="color:#ff4444;font-weight:700;">🌊 FLOODED (Score: ${node.floodScore})</span>` : node.floodScore >= 70 ? `<span style="color:#ff8800;font-weight:700;">⚠️ CONGESTED (Score: ${node.floodScore})</span>` : "Normal"}</div>`).addTo(layerGroup);
      if (node.flooded) {
        L.circle([node.lat, node.lng], { radius: 400, color: "#ff4444", fillColor: "#ff4444", fillOpacity: 0.18, weight: 2 }).addTo(layerGroup);
      } else if (node.floodScore >= 70) {
        L.circle([node.lat, node.lng], { radius: 300, color: "#ff8800", fillColor: "#ff8800", fillOpacity: 0.12, weight: 1, dashArray: "6 4" }).addTo(layerGroup);
      }
    });
  }, [graph, startNode, endNode, bestPath]);

  const recalculateRoute = useCallback((nextGraph: CityGraph) => {
    if (!startNode || !endNode) return;
    const result = findShortestPath(nextGraph, startNode, endNode);
    setBestPath(result.totalWeight === Infinity ? null : result);
  }, [startNode, endNode]);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const findRoute = async () => {
    if (!startNode || !endNode) return;
    if (startNode === endNode) { addLog("⚠ Start and end must be different"); return; }
    setLoadingRoute(true);
    addLog("🔍 Calculating best route...");
    await delay(1000);
    const result = findShortestPath(graph, startNode, endNode);
    if (result.totalWeight === Infinity) {
      addLog("❌ No path found");
      setBestPath(null);
    } else {
      setBestPath(result);
      const nodeNames = result.path.map((id) => graph.nodes.find((n) => n.id === id)?.name).join(" → ");
      addLog(`✅ Route found: ${nodeNames} (Total weight: ${result.totalWeight})`);
    }
    setLoadingRoute(false);
  };

  const syncMediaSeed = useCallback(async (silent = false) => {
    setLoadingSync(true);
    if (!silent) addLog("📡 Fetching latest route scores from API...");
    await delay(1000);

    try {
      const { data, error } = await supabase.functions.invoke("media-seed-latest");
      if (error) throw error;

      const routes: { route: string; score: number; reason: string; node: boolean }[] = data?.routes || [];
      if (routes.length === 0) {
        if (!silent) addLog("⚠ No route scores returned from API");
        setLoadingSync(false);
        return;
      }

      setGraph((prevGraph) => {
        const updatedGraph = {
          ...prevGraph,
          edges: prevGraph.edges.map((e) => ({ ...e })),
          nodes: prevGraph.nodes.map((n) => ({ ...n })),
        };
        let matched = 0;

        for (const entry of routes) {
          if (entry.node) {
            // node: true → this is a crossroad/intersection, update the node AND all surrounding roads
            const nodeIdx = updatedGraph.nodes.findIndex((n) =>
              n.name.toLowerCase().includes(entry.route.toLowerCase()) ||
              entry.route.toLowerCase().includes(n.name.toLowerCase())
            );
            if (nodeIdx !== -1) {
              const matchedNode = updatedGraph.nodes[nodeIdx];
              const isFlooded = entry.score >= 50;
              updatedGraph.nodes[nodeIdx] = {
                ...matchedNode,
                flooded: isFlooded,
                floodScore: entry.score,
              };
              addLog(`${isFlooded ? '🌊' : '📍'} API node: "${matchedNode.name}" → score ${entry.score} (${entry.reason})`);
              matched++;

              // Update ALL surrounding edges connected to this node
              updatedGraph.edges.forEach((edge, eIdx) => {
                if (edge.from === matchedNode.id || edge.to === matchedNode.id) {
                  const oldW = edge.weight;
                  const newW = Math.max(edge.weight, Math.round(entry.score * 0.8));
                  updatedGraph.edges[eIdx] = { ...edge, weight: newW };
                  if (newW !== oldW) {
                    addLog(`  ↳ Road "${edge.name}" weight ${oldW} → ${newW} (near ${matchedNode.name})`);
                  }
                }
              });
            }
          } else {
            // node: false or missing → this is a road/edge
            const edgeIdx = updatedGraph.edges.findIndex((e) =>
              e.name.toLowerCase().includes(entry.route.toLowerCase()) ||
              entry.route.toLowerCase().includes(e.name.toLowerCase())
            );
            if (edgeIdx !== -1) {
              const oldWeight = updatedGraph.edges[edgeIdx].weight;
              updatedGraph.edges[edgeIdx] = { ...updatedGraph.edges[edgeIdx], weight: entry.score };
              addLog(`📊 API: "${updatedGraph.edges[edgeIdx].name}" → score ${oldWeight} → ${entry.score} (${entry.reason})`);
              matched++;
            }

            // Also check nodes for non-node entries
            const nodeIdx = updatedGraph.nodes.findIndex((n) =>
              n.name.toLowerCase().includes(entry.route.toLowerCase()) ||
              entry.route.toLowerCase().includes(n.name.toLowerCase())
            );
            if (nodeIdx !== -1) {
              updatedGraph.nodes[nodeIdx] = {
                ...updatedGraph.nodes[nodeIdx],
                flooded: entry.score >= 50,
                floodScore: entry.score,
              };
              matched++;
            }
          }
        }

        addLog(`✅ Synced ${routes.length} scores (${matched} matched)`);
        return updatedGraph;
      });

      // Recalculate after state update
      setTimeout(() => {
        setGraph((g) => {
          recalculateRoute(g);
          return g;
        });
      }, 100);
    } catch (err: any) {
      if (!silent) addLog(`❌ API sync failed: ${err.message || "Unknown error"}`);
    }

    setLoadingSync(false);
  }, [addLog, recalculateRoute]);

  // Auto-sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      syncMediaSeed(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [syncMediaSeed]);

  const handleTrafficReport = async (reportText?: string) => {
    const text = reportText || audioText;
    if (!text.trim()) return;
    setLoadingTraffic(true);
    addLog("🤖 AI analyzing traffic report...");

    try {
      const roadNames = graph.edges.map((e) => e.name);
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { type: "traffic_report", textReport: text, roadNames },
      });

      if (error) throw error;
      await delay(1000);

      if (data?.result?.roads && data.result.roads.length > 0) {
        const updatedGraph = { ...graph, edges: [...graph.edges], nodes: [...graph.nodes] };

        for (const road of data.result.roads) {
          const edgeIdx = updatedGraph.edges.findIndex((e) =>
            e.name.toLowerCase().includes(road.name.toLowerCase()) || road.name.toLowerCase().includes(e.name.toLowerCase())
          );
          if (edgeIdx !== -1) {
            const oldWeight = updatedGraph.edges[edgeIdx].weight;
            updatedGraph.edges[edgeIdx] = { ...updatedGraph.edges[edgeIdx], weight: road.severity };
            const icon = road.condition === "clear" ? "✅" : "🚗";
            addLog(`${icon} AI: "${updatedGraph.edges[edgeIdx].name}" → ${road.condition} (weight: ${oldWeight} → ${road.severity})`);
          }
        }

        addLog(`📝 AI Summary: ${data.result.summary}`);
        setGraph(updatedGraph);
        recalculateRoute(updatedGraph);
        addLog("🔄 Route recalculated after AI traffic analysis");
      } else {
        addLog(`⚠ AI could not match any roads in report`);
      }
    } catch (err: any) {
      addLog(`❌ AI analysis failed: ${err.message || "Unknown error"}`);
    }

    if (!reportText) setAudioText("");
    setLoadingTraffic(false);
  };

  // Start/stop microphone recording for audio analysis
  const toggleAudioRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("❌ Speech recognition not supported in this browser");
      return;
    }

    if (isRecordingAudio) {
      audioRecognitionRef.current?.stop();
      setIsRecordingAudio(false);
      addLog("🛑 Recording stopped");
      return;
    }

    setAudioTranscript("");
    setCorrectedText("");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "vi-VN";

    let transcript = "";

    recognition.onresult = (event: any) => {
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + " ";
        }
      }
      setAudioTranscript(transcript.trim());
    };

    recognition.onerror = (e: any) => {
      addLog(`❌ Recording error: ${e.error}`);
      setIsRecordingAudio(false);
    };

    recognition.onend = () => {
      setIsRecordingAudio(false);
    };

    audioRecognitionRef.current = recognition;
    recognition.start();
    setIsRecordingAudio(true);
    addLog("🎙️ Recording started — speak now...");
  };

  // Process recorded transcript through LLM correction → traffic analysis
  const handleProcessTranscript = async () => {
    if (!audioTranscript.trim()) return;
    setLoadingAudio(true);

    try {
      addLog(`📝 Step 1 complete — Raw transcript: "${audioTranscript}"`);

      addLog("🤖 Step 2: AI correcting transcript...");
      await delay(500);

      const roadNames = graph.edges.map((e) => e.name);
      const { data: correctionData, error: correctionError } = await supabase.functions.invoke("analyze-image", {
        body: { type: "correct_speech_text", textReport: audioTranscript, roadNames },
      });

      if (correctionError) throw correctionError;

      const corrected = correctionData?.result?.correctedText || audioTranscript;
      setCorrectedText(corrected);
      addLog(`✅ Corrected text: "${corrected}"`);

      addLog("📊 Step 3: Analyzing corrected text for traffic conditions...");
      await handleTrafficReport(corrected);

    } catch (err: any) {
      addLog(`❌ Processing failed: ${err.message || "Unknown error"}`);
    }

    setLoadingAudio(false);
  };

  // Process audio file: convert to base64 → send to AI for transcription → correct → analyze
  const handleAudioFileUpload = async () => {
    if (!audioFile) return;
    setLoadingAudio(true);
    setAudioTranscript("");
    setCorrectedText("");

    try {
      addLog("🎵 Step 1: Sending audio file to AI for transcription...");
      await delay(500);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioFile);
      });

      const mimeType = audioFile.type || "audio/mpeg";

      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { type: "transcribe_audio", audioBase64: base64, mimeType },
      });

      if (error) throw error;

      const transcript = data?.result?.transcript || "";
      if (!transcript.trim()) {
        addLog("⚠ No speech detected in audio file.");
        setLoadingAudio(false);
        return;
      }

      setAudioTranscript(transcript.trim());
      addLog(`📝 Raw transcript: "${transcript.trim()}"`);

      // Step 2: LLM correction
      addLog("🤖 Step 2: AI correcting transcript...");
      await delay(500);

      const roadNames = graph.edges.map((e) => e.name);
      const { data: correctionData, error: correctionError } = await supabase.functions.invoke("analyze-image", {
        body: { type: "correct_speech_text", textReport: transcript.trim(), roadNames },
      });

      if (correctionError) throw correctionError;

      const corrected = correctionData?.result?.correctedText || transcript.trim();
      setCorrectedText(corrected);
      addLog(`✅ Corrected text: "${corrected}"`);

      // Step 3: Traffic analysis
      addLog("📊 Step 3: Analyzing corrected text for traffic conditions...");
      await handleTrafficReport(corrected);

    } catch (err: any) {
      addLog(`❌ Audio file processing failed: ${err.message || "Unknown error"}`);
    }

    setLoadingAudio(false);
  };

  const TARGET_NODE_ID = "n17"; // Ngã 4 Phú Nhuận

  const handleImageAnalysis = async () => {
    if (!imageFile) return;
    const isFlood = analysisMode === "flood";
    if (isFlood) setLoadingFlood(true);
    else setLoadingTraffic(true);

    // Save graph snapshot before analysis for revert option
    setPreAnalysisGraph(JSON.parse(JSON.stringify(graph)));

    addLog(`📸 AI analyzing image for ${isFlood ? "flooding" : "traffic"}...`);

    try {
      const base64 = await fileToBase64(imageFile);
      const roadNames = graph.edges.map((e) => e.name);
      const nodeNames = graph.nodes.map((n) => n.name);

      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: {
          type: isFlood ? "flood_detection" : "traffic_detection",
          imageBase64: base64,
          roadNames,
          nodeNames,
        },
      });

      if (error) throw error;
      await delay(1000);

      const targetNode = graph.nodes.find((n) => n.id === TARGET_NODE_ID);
      const connectedEdges = graph.edges.filter((e) => e.from === TARGET_NODE_ID || e.to === TARGET_NODE_ID);

      if (isFlood && data?.result) {
        const r = data.result;
        addLog(`🌊 AI: Flooding ${r.flooded ? "DETECTED" : "not detected"} — Score: ${r.floodScore}`);
        addLog(`📝 ${r.description}`);

        if (r.flooded && targetNode) {
          addLog(`📍 Auto-mapped to: ${targetNode.name}`);
          const updatedGraph = {
            ...graph,
            nodes: graph.nodes.map((node) =>
              node.id === TARGET_NODE_ID
                ? { ...node, flooded: true, floodScore: r.floodScore }
                : node
            ),
            edges: graph.edges.map((edge) => {
              if (edge.from === TARGET_NODE_ID || edge.to === TARGET_NODE_ID) {
                const newWeight = Math.min(100, Math.max(edge.weight, Math.round(r.floodScore * 0.8)));
                return { ...edge, weight: newWeight };
              }
              return edge;
            }),
          };
          addLog(`🌊 Flood zone marked at "${targetNode.name}" — score: ${r.floodScore}`);
          connectedEdges.forEach((e) => addLog(`   ↳ Road "${e.name}" weight increased`));
          setGraph(updatedGraph);
          recalculateRoute(updatedGraph);
          addLog("🔄 Route recalculated after flood detection");

          // Pan map to flood zone
          if (mapRef.current) {
            mapRef.current.flyTo([targetNode.lat, targetNode.lng], 15, { duration: 1 });
          }
        }
      } else if (!isFlood && data?.result) {
        const r = data.result;
        addLog(`🚗 AI: Traffic ${r.congested ? "CONGESTED" : "clear"} — Score: ${r.congestionScore}`);
        addLog(`📝 ${r.description}`);

        if (r.congested && targetNode) {
          addLog(`📍 Auto-mapped to: ${targetNode.name}`);
          const updatedGraph = {
            ...graph,
            edges: graph.edges.map((edge) => {
              if (edge.from === TARGET_NODE_ID || edge.to === TARGET_NODE_ID) {
                addLog(`🚗 Traffic jam: "${edge.name}" → weight: ${r.congestionScore}`);
                return { ...edge, weight: r.congestionScore };
              }
              return edge;
            }),
            nodes: [...graph.nodes],
          };
          setGraph(updatedGraph);
          recalculateRoute(updatedGraph);
          addLog("🔄 Route recalculated after traffic detection");

          // Pan map to traffic zone
          if (mapRef.current) {
            mapRef.current.flyTo([targetNode.lat, targetNode.lng], 15, { duration: 1 });
          }
        }
      }
    } catch (err: any) {
      addLog(`❌ AI image analysis failed: ${err.message || "Unknown error"}`);
    }

    // Keep image visible — user can remove with keep/revert options
    if (isFlood) setLoadingFlood(false);
    else setLoadingTraffic(false);
  };

  // Web Speech API
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("❌ Speech recognition not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      addLog("🎙️ Speech recognition stopped");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "vi-VN"; // Vietnamese, falls back to English

    recognition.onstart = () => {
      setIsListening(true);
      addLog("🎙️ Listening... speak now");
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAudioText(transcript);
    };

    recognition.onerror = (event: any) => {
      addLog(`❌ Speech error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      addLog("🎙️ Speech recognition ended");
    };

    recognitionRef.current = recognition;
    recognition.start();
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
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tighter uppercase">
              <span className="text-gradient">Live Demo</span> — HCM City Navigation
            </h1>
            <p className="text-on-surface-variant text-sm mt-2">AI-powered routing with real-time flood & traffic analysis</p>
          </div>
          <Link to="/" className="text-on-surface-variant hover:text-on-surface text-sm font-headline uppercase tracking-widest">← Back</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-md border border-on-surface/10 overflow-hidden" style={{ minHeight: 500 }}>
            <div ref={mapContainerRef} className="h-full min-h-[500px] w-full" />
          </div>

          <div className="space-y-4">
            {/* Route finder */}
            <div className="glass rounded-md border border-on-surface/10 p-6 relative overflow-hidden">
              {loadingRoute && <LoadingOverlay label="Calculating route..." />}
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-primary">Find Route</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">Start</label>
                  <select value={startNode} onChange={(e) => setStartNode(e.target.value)} className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 text-sm text-on-surface focus:border-primary outline-none">
                    <option value="">Select start point</option>
                    {graph.nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">End</label>
                  <select value={endNode} onChange={(e) => setEndNode(e.target.value)} className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 text-sm text-on-surface focus:border-primary outline-none">
                    <option value="">Select end point</option>
                    {graph.nodes.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
                  </select>
                </div>
                <button onClick={findRoute} disabled={loadingRoute || !startNode || !endNode} className="w-full bg-primary-container text-primary-container-foreground py-2.5 rounded font-headline font-bold uppercase tracking-widest text-sm active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none">
                  {loadingRoute ? "Calculating..." : "Find Best Route"}
                </button>
                <button onClick={() => syncMediaSeed(false)} disabled={loadingSync} className="w-full bg-tertiary/15 text-tertiary py-2.5 rounded font-headline font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden">
                  {loadingSync ? "Syncing API..." : "📡 Sync Scores from API"}
                </button>
                <button onClick={resetGraph} className="w-full border border-outline-variant/20 text-on-surface-variant py-2 rounded text-xs uppercase tracking-widest active:scale-95 transition-transform">Reset All</button>
              </div>
              {bestPath && (
                <div className="mt-4 p-3 bg-primary/10 border-l-4 border-primary rounded-r text-xs">
                  <div className="font-bold text-primary mb-1">Route Found (Weight: {bestPath.totalWeight})</div>
                  {bestPath.path.map((id) => graph.nodes.find((node) => node.id === id)?.name).join(" → ")}
                </div>
              )}
            </div>

            {/* Traffic report with speech */}
            <div className="glass rounded-md border border-on-surface/10 p-6 relative overflow-hidden">
              {loadingTraffic && <LoadingOverlay label="AI analyzing traffic..." />}
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-error">Traffic Report</h3>
              <p className="text-[10px] text-on-surface-variant mb-3">Type or use voice input. AI will analyze and update road weights.</p>
              <div className="relative">
                <textarea
                  value={audioText}
                  onChange={(e) => setAudioText(e.target.value)}
                  placeholder="Describe traffic conditions..."
                  className="w-full bg-surface border border-outline-variant/20 rounded px-3 py-2 pr-12 text-sm text-on-surface focus:border-destructive outline-none resize-none h-20"
                />
                <button
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-2 top-2 p-2 rounded-full transition-all active:scale-90 ${isListening ? "bg-error/20 text-error animate-pulse" : "bg-on-surface/5 text-on-surface-variant hover:text-on-surface"}`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={() => handleTrafficReport()} disabled={loadingTraffic || !audioText.trim()} className="w-full mt-2 bg-destructive/15 text-error py-2 rounded font-headline font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none">
                {loadingTraffic ? "Analyzing..." : "Analyze with AI"}
              </button>
            </div>

            {/* Audio Analysis */}
            <div className="glass rounded-md border border-on-surface/10 p-6 relative overflow-hidden">
              {loadingAudio && <LoadingOverlay label="Processing audio..." />}
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-secondary">Audio Analysis</h3>
              <p className="text-[10px] text-on-surface-variant mb-3">Speech-to-Text → AI Correction → Traffic Analysis</p>
              
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAudioMode("mic")}
                  className={`flex-1 py-1.5 rounded text-xs font-headline uppercase tracking-widest transition-all active:scale-95 ${audioMode === "mic" ? "bg-secondary/20 text-secondary font-bold" : "bg-on-surface/5 text-on-surface-variant"}`}
                >🎙️ Microphone</button>
                <button
                  onClick={() => setAudioMode("file")}
                  className={`flex-1 py-1.5 rounded text-xs font-headline uppercase tracking-widest transition-all active:scale-95 ${audioMode === "file" ? "bg-secondary/20 text-secondary font-bold" : "bg-on-surface/5 text-on-surface-variant"}`}
                >📁 File Upload</button>
              </div>

              {audioMode === "mic" ? (
                <button
                  onClick={toggleAudioRecording}
                  className={`w-full py-2.5 rounded font-headline font-bold uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isRecordingAudio
                      ? "bg-error/20 text-error animate-pulse"
                      : "bg-secondary/20 text-secondary"
                  }`}
                >
                  {isRecordingAudio ? <><MicOff className="w-4 h-4" /> Stop Recording</> : <><Mic className="w-4 h-4" /> Start Recording</>}
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      setAudioFile(e.target.files?.[0] || null);
                      setAudioTranscript("");
                      setCorrectedText("");
                    }}
                    className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-secondary/20 file:text-secondary"
                  />
                  {audioFile && (
                    <div className="flex items-center gap-2 p-2 bg-secondary/10 rounded text-xs">
                      <Upload className="w-3 h-3 text-secondary" />
                      <span className="text-on-surface truncate">{audioFile.name}</span>
                      <button onClick={() => { setAudioFile(null); setAudioTranscript(""); setCorrectedText(""); }} className="ml-auto text-on-surface-variant hover:text-error text-xs">✕</button>
                    </div>
                  )}
                  {audioFile && !audioTranscript && (
                    <button
                      onClick={handleAudioFileUpload}
                      disabled={loadingAudio}
                      className="w-full bg-secondary/20 text-secondary py-2 rounded font-headline font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loadingAudio ? "Processing..." : "Process Audio File"}
                    </button>
                  )}
                </div>
              )}

              {audioTranscript && (
                <div className="mt-3 space-y-2">
                  <div className="p-2 bg-on-surface/5 rounded text-xs space-y-1">
                    <div className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest">Raw Transcript:</div>
                    <div className="text-on-surface">{audioTranscript}</div>
                  </div>
                  {!correctedText && audioMode === "mic" && (
                    <button
                      onClick={handleProcessTranscript}
                      disabled={loadingAudio || isRecordingAudio}
                      className="w-full bg-secondary/20 text-secondary py-2 rounded font-headline font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loadingAudio ? "Processing..." : "Process with AI"}
                    </button>
                  )}
                </div>
              )}
              {correctedText && (
                <div className="mt-2 p-2 bg-secondary/10 rounded text-xs space-y-1">
                  <div className="text-secondary font-bold text-[10px] uppercase tracking-widest">AI Corrected:</div>
                  <div className="text-on-surface">{correctedText}</div>
                </div>
              )}
            </div>

            {/* Image analysis (flood + traffic) */}
            <div className="glass rounded-md border border-on-surface/10 p-6 relative overflow-hidden">
              {loadingFlood && <LoadingOverlay label="AI analyzing image..." />}
              <h3 className="font-headline font-bold uppercase tracking-tight mb-4 text-tertiary">Image Analysis</h3>
              <p className="text-[10px] text-on-surface-variant mb-3">Upload an image — AI will detect flooding or traffic jams</p>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAnalysisMode("flood")}
                  className={`flex-1 py-1.5 rounded text-xs font-headline uppercase tracking-widest transition-all active:scale-95 ${analysisMode === "flood" ? "bg-tertiary/20 text-tertiary font-bold" : "bg-on-surface/5 text-on-surface-variant"}`}
                >🌊 Flood</button>
                <button
                  onClick={() => setAnalysisMode("traffic")}
                  className={`flex-1 py-1.5 rounded text-xs font-headline uppercase tracking-widest transition-all active:scale-95 ${analysisMode === "traffic" ? "bg-error/20 text-error font-bold" : "bg-on-surface/5 text-on-surface-variant"}`}
                >🚗 Traffic</button>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-tertiary/20 file:text-tertiary"
              />
              {imageFile && (
                <div className="mt-3 space-y-2">
                  <div className="relative rounded overflow-hidden border border-on-surface/10">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => {
                        if (preAnalysisGraph) {
                          setShowRemoveOptions(true);
                        } else {
                          setImageFile(null);
                        }
                      }}
                      className="absolute top-1 right-1 bg-surface/80 text-on-surface-variant hover:text-error rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold backdrop-blur-sm transition-colors active:scale-90"
                      title="Remove image"
                    >✕</button>
                  </div>
                  {showRemoveOptions && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          addLog("🗑️ Image removed — scores kept");
                          setImageFile(null);
                          setPreAnalysisGraph(null);
                          setShowRemoveOptions(false);
                        }}
                        className="flex-1 bg-tertiary/20 text-tertiary py-1.5 rounded font-headline font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                      >
                        Keep Scores
                      </button>
                      <button
                        onClick={() => {
                          if (preAnalysisGraph) {
                            setGraph(preAnalysisGraph);
                            recalculateRoute(preAnalysisGraph);
                            addLog("↩️ Image removed — scores reverted");
                          }
                          setImageFile(null);
                          setPreAnalysisGraph(null);
                          setShowRemoveOptions(false);
                        }}
                        className="flex-1 bg-error/20 text-error py-1.5 rounded font-headline font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
                      >
                        Revert Scores
                      </button>
                    </div>
                  )}
                  {!showRemoveOptions && (
                    <button onClick={handleImageAnalysis} disabled={loadingFlood || loadingTraffic} className="w-full bg-tertiary/20 text-tertiary py-2 rounded font-headline font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none">
                      {loadingFlood || loadingTraffic ? "Analyzing..." : `Analyze for ${analysisMode === "flood" ? "Flood" : "Traffic"}`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Legend */}
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
            {log.map((entry, index) => <div key={index}>{entry}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
