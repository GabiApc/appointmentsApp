import { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { config } from "./config";
import applicationRoutes from "./routes";

const SERVER_PORT = 5000;

export class AppServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.standardMiddleware(this.app);

    this.startServer(this.app);
  }

  private standardMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      //const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      //this.socketIOConnections(socketIO);
    } catch (error) {
      console.log(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    console.info(`Server has started with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      console.info(`Server running on port ${SERVER_PORT}`);
    });
  }

  //private socketIOConnections(io: Server): void {}
}
