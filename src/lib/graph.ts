// Graph data structure for HCM city road network
// Nodes = intersections, Edges = roads with weight 1 (best) to 100 (worst)

export interface GraphNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  flooded: boolean;
  floodScore: number; // 1-100
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number; // 1 (best) to 100 (worst)
  name: string;
}

export interface CityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Sample HCM city intersections (District 1, 3, 5, 10, Binh Thanh area)
export const createHCMGraph = (): CityGraph => {
  const nodes: GraphNode[] = [
    { id: "n1", name: "Bến Thành Market", lat: 10.7725, lng: 106.6980, flooded: false, floodScore: 1 },
    { id: "n2", name: "Nguyễn Huệ - Lê Lợi", lat: 10.7740, lng: 106.7020, flooded: false, floodScore: 1 },
    { id: "n3", name: "Phạm Ngũ Lão - Bùi Viện", lat: 10.7680, lng: 106.6930, flooded: false, floodScore: 1 },
    { id: "n4", name: "Ngã 6 Phù Đổng", lat: 10.7710, lng: 106.6920, flooded: false, floodScore: 1 },
    { id: "n5", name: "Vòng xoay Dân Chủ", lat: 10.7720, lng: 106.6830, flooded: false, floodScore: 1 },
    { id: "n6", name: "Chợ Lớn", lat: 10.7530, lng: 106.6590, flooded: false, floodScore: 1 },
    { id: "n7", name: "Ngã tư Hàng Xanh", lat: 10.8010, lng: 106.7100, flooded: false, floodScore: 1 },
    { id: "n8", name: "Cầu Thị Nghè", lat: 10.7890, lng: 106.7050, flooded: false, floodScore: 1 },
    { id: "n9", name: "Nhà thờ Đức Bà", lat: 10.7798, lng: 106.6990, flooded: false, floodScore: 1 },
    { id: "n10", name: "Dinh Độc Lập", lat: 10.7770, lng: 106.6955, flooded: false, floodScore: 1 },
    { id: "n11", name: "Ngã 4 Bảy Hiền", lat: 10.7900, lng: 106.6510, flooded: false, floodScore: 1 },
    { id: "n12", name: "Cầu Sài Gòn", lat: 10.7960, lng: 106.7280, flooded: false, floodScore: 1 },
    { id: "n13", name: "Ngã tư Thủ Đức", lat: 10.8480, lng: 106.7530, flooded: false, floodScore: 1 },
    { id: "n14", name: "Tân Sơn Nhất", lat: 10.8190, lng: 106.6600, flooded: false, floodScore: 1 },
    { id: "n15", name: "Ngã 4 An Sương", lat: 10.8540, lng: 106.6170, flooded: false, floodScore: 1 },
    { id: "n16", name: "Chợ Tân Bình", lat: 10.8000, lng: 106.6520, flooded: false, floodScore: 1 },
    { id: "n17", name: "Ngã 4 Phú Nhuận", lat: 10.7990, lng: 106.6820, flooded: false, floodScore: 1 },
    { id: "n18", name: "Cầu Chữ Y", lat: 10.7500, lng: 106.6830, flooded: false, floodScore: 1 },
  ];

  const edges: GraphEdge[] = [
    { id: "e1", from: "n1", to: "n2", weight: 15, name: "Lê Lợi" },
    { id: "e2", from: "n1", to: "n3", weight: 20, name: "Phạm Ngũ Lão" },
    { id: "e3", from: "n1", to: "n4", weight: 10, name: "Hàm Nghi" },
    { id: "e4", from: "n4", to: "n5", weight: 25, name: "Nguyễn Trãi" },
    { id: "e5", from: "n5", to: "n6", weight: 35, name: "Nguyễn Trãi (xa)" },
    { id: "e6", from: "n2", to: "n9", weight: 12, name: "Đồng Khởi" },
    { id: "e7", from: "n9", to: "n10", weight: 8, name: "Lê Duẩn" },
    { id: "e8", from: "n9", to: "n8", weight: 18, name: "Hai Bà Trưng" },
    { id: "e9", from: "n8", to: "n7", weight: 22, name: "Điện Biên Phủ" },
    { id: "e10", from: "n7", to: "n12", weight: 30, name: "Xa lộ Hà Nội" },
    { id: "e11", from: "n12", to: "n13", weight: 40, name: "Xa lộ Hà Nội (xa)" },
    { id: "e12", from: "n10", to: "n17", weight: 28, name: "Nam Kỳ Khởi Nghĩa" },
    { id: "e13", from: "n17", to: "n14", weight: 20, name: "Cộng Hòa" },
    { id: "e14", from: "n14", to: "n15", weight: 45, name: "Trường Chinh" },
    { id: "e15", from: "n14", to: "n16", weight: 15, name: "Hoàng Văn Thụ" },
    { id: "e16", from: "n16", to: "n11", weight: 18, name: "CMT8" },
    { id: "e17", from: "n11", to: "n5", weight: 30, name: "CMT8 (xuống)" },
    { id: "e18", from: "n3", to: "n18", weight: 25, name: "Trần Hưng Đạo" },
    { id: "e19", from: "n18", to: "n6", weight: 30, name: "Hậu Giang" },
    { id: "e20", from: "n17", to: "n7", weight: 20, name: "Phan Đăng Lưu" },
    { id: "e21", from: "n5", to: "n16", weight: 35, name: "Lý Thường Kiệt" },
    { id: "e22", from: "n4", to: "n10", weight: 15, name: "Pasteur" },
    { id: "e23", from: "n8", to: "n17", weight: 18, name: "Hoàng Sa" },
    { id: "e24", from: "n3", to: "n4", weight: 10, name: "Trần Hưng Đạo" },
  ];

  return { nodes, edges };
};

// Dijkstra's algorithm to find shortest path
export const findShortestPath = (
  graph: CityGraph,
  startId: string,
  endId: string
): { path: string[]; totalWeight: number; edgeIds: string[] } => {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const prevEdge: Record<string, string | null> = {};
  const visited = new Set<string>();

  graph.nodes.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    prevEdge[n.id] = null;
  });
  dist[startId] = 0;

  while (true) {
    let u: string | null = null;
    let minDist = Infinity;
    for (const id in dist) {
      if (!visited.has(id) && dist[id] < minDist) {
        minDist = dist[id];
        u = id;
      }
    }
    if (!u || u === endId) break;
    visited.add(u);

    // Get neighbors (undirected graph)
    const neighborEdges = graph.edges.filter((e) => e.from === u || e.to === u);
    for (const edge of neighborEdges) {
      const v = edge.from === u ? edge.to : edge.from;
      if (visited.has(v)) continue;

      // Add flood penalty from destination node
      const destNode = graph.nodes.find((n) => n.id === v);
      const floodPenalty = destNode ? destNode.floodScore : 0;
      const newDist = dist[u!] + edge.weight + floodPenalty;

      if (newDist < dist[v]) {
        dist[v] = newDist;
        prev[v] = u;
        prevEdge[v] = edge.id;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  const edgeIds: string[] = [];
  let current: string | null = endId;
  while (current) {
    path.unshift(current);
    if (prevEdge[current]) edgeIds.unshift(prevEdge[current]!);
    current = prev[current];
  }

  return { path, totalWeight: dist[endId] ?? Infinity, edgeIds };
};
