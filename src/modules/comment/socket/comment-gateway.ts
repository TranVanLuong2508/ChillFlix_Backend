import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class CommentGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(' Client connected:', client.id);
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

  broadcastCountComments(data: any) {
    this.server.emit('countComments', data);
  }
}
