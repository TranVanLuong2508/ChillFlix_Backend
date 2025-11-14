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
export class CommentGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    client.on('disconnect', () => {
      for (const [userId, socketSet] of this.userSockets.entries()) {
        if (socketSet.has(client.id)) {
          socketSet.delete(client.id);
          console.log(`Socket ${client.id} removed from user ${userId}`);
          if (socketSet.size === 0) {
            this.userSockets.delete(userId);
            console.log(`All sockets removed for user ${userId}`);
          }
          break;
        }
      }
    });
  }

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (data?.userId) {
      const userIdStr = String(data.userId);
      if (!this.userSockets.has(userIdStr)) {
        this.userSockets.set(userIdStr, new Set());
      }
      this.userSockets.get(userIdStr)!.add(client.id);
      console.log(`User ${userIdStr} registered socket ${client.id}`);
      console.log(`Current userSockets keys:`, Array.from(this.userSockets.keys()));
    }
  }

  private emitToUser(userId: string, event: string, data: any) {
    const userIdStr = String(userId);
    console.log(
      `[SOCKET] emitToUser: trying userId=${userIdStr}, current keys:`,
      Array.from(this.userSockets.keys()),
    );
    const socketSet = this.userSockets.get(userIdStr);
    if (socketSet && socketSet.size > 0) {
      for (const socketId of socketSet) {
        console.log(
          `[SOCKET] emitToUser: userId=${userIdStr}, socketId=${socketId}, event=${event}`,
        );
        this.server.to(socketId).emit(event, data);
      }
    } else {
      console.log(`[SOCKET] emitToUser: userId=${userIdStr} not found in userSockets`);
    }
  }

  sendReplyNotification(targetUserId: string, data: any) {
    this.emitToUser(targetUserId, 'replyNotification', data);
  }

  sendReactionNotification(targetUserId: string, data: any) {
    this.emitToUser(targetUserId, 'reactionNotification', data);
  }

  @SubscribeMessage('sendComment')
  handleSendComment(@MessageBody() data: any) {
    this.server.emit('newComment', data);
  }

  broadcastNewComment(comment: any) {
    this.server.emit('newComment', comment);
  }

  broadcastReplyComment(data: any) {
    this.server.emit('replyComment', data);
  }

  broadcastDeleteComment(commentId: string) {
    this.server.emit('deleteComment', { commentId });
  }

  broadcastHideComment(commentId: string, isHidden: boolean) {
    this.server.emit('hideComment', { commentId, isHidden });
  }

  broadcastUpdateComment(comment: any) {
    this.server.emit('updateComment', comment);
  }

  broadcastReactComment(reaction: any) {
    this.server.emit('reactComment', reaction);
  }

  broadcastCountComments(data: { filmId: string; total: number }) {
    this.server.emit('countComments', data);
  }
}
