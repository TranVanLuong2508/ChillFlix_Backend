import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class RatingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[RATING SOCKET] Client connected: ${client.id}`);
  }

  broadcastRatingUpdate(data: {
    filmId: string;
    averageRating: number;
    totalRatings: number;
    newRating?: any;
  }) {
    console.log('[RATING] Broadcasting rating update for film:', data.filmId);
    this.server.emit('ratingUpdated', data);
  }

  broadcastRatingDelete(data: { filmId: string; ratingId: string }) {
    console.log('[RATING] Broadcasting rating delete:', data.ratingId);
    this.server.emit('ratingDeleted', data);
  }
}
