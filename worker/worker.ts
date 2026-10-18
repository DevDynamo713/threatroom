export interface Env { THREATROOM_DO: DurableObjectNamespace; }
export class ThreatRoomDO {
  private state: DurableObjectState;
  private threats: Map<string, any> = new Map();
  private websockets: WebSocket[] = [];
  constructor(state: DurableObjectState, env: Env) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (url.pathname === '/threats' && request.method === 'GET') {
      return Response.json(Array.from(this.threats.values()));
    }
    if (url.pathname === '/threat' && request.method === 'POST') {
      const data = await request.json();
      const threat = { ...data, id: crypto.randomUUID(), timestamp: new Date().toISOString(), acknowledged: false };
      this.threats.set(threat.id, threat);
      this.broadcast(JSON.stringify({ type: 'threat', data: threat }));
      return Response.json({ success: true, threat });
    }
    return new Response('Not Found', { status: 404 });
  }
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) { }
  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) { this.websockets = this.websockets.filter(w => w !== ws); }
  private broadcast(msg: string) { for (const ws of this.websockets) { if (ws.readyState === 1) ws.send(msg); } }
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.THREATROOM_DO.idFromName(url.pathname);
    const stub = env.THREATROOM_DO.get(id);
    return stub.fetch(request);
  }
}