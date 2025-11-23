import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';

interface JoinRoomPayload {
  roomId: string;
  userId: string;
  userName: string;
}

interface ComponentUpdate {
  roomId: string;
  userId: string;
  components: any[];
  timestamp: number;
}

interface CursorPosition {
  roomId: string;
  userId: string;
  userName: string;
  position: { x: number; y: number };
  color: string;
}

interface SelectionUpdate {
  roomId: string;
  userId: string;
  componentId: string | null;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('CollaborationGateway');

  constructor(private collaborationService: CollaborationService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove user from all rooms
    const rooms = this.collaborationService.getUserRooms(client.id);
    for (const roomId of rooms) {
      await this.handleLeaveRoom(client, { roomId, userId: client.id });
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { roomId, userId, userName } = payload;

    // Join the room
    client.join(roomId);

    // Add user to collaboration service
    this.collaborationService.addUserToRoom(roomId, userId, {
      socketId: client.id,
      userName,
      joinedAt: new Date(),
    });

    // Get current room state
    const roomState = this.collaborationService.getRoomState(roomId);

    // Notify others in the room
    client.to(roomId).emit('user_joined', {
      userId,
      userName,
      timestamp: Date.now(),
    });

    // Send current room state to the joining user
    client.emit('room_state', {
      components: roomState.components,
      users: roomState.users,
    });

    // Send active users list to the joining user
    const activeUsers = this.collaborationService.getActiveUsers(roomId);
    client.emit('active_users', activeUsers);

    // Broadcast updated user list to all in room
    this.server.to(roomId).emit('active_users', activeUsers);

    this.logger.log(`User ${userName} (${userId}) joined room ${roomId}`);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string },
  ) {
    const { roomId, userId } = payload;

    // Leave the room
    client.leave(roomId);

    // Remove user from collaboration service
    const userName = this.collaborationService.removeUserFromRoom(roomId, userId);

    // Notify others
    client.to(roomId).emit('user_left', {
      userId,
      userName,
      timestamp: Date.now(),
    });

    // Broadcast updated user list
    const activeUsers = this.collaborationService.getActiveUsers(roomId);
    this.server.to(roomId).emit('active_users', activeUsers);

    this.logger.log(`User ${userName} (${userId}) left room ${roomId}`);
  }

  @SubscribeMessage('component_update')
  handleComponentUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ComponentUpdate,
  ) {
    const { roomId, userId, components, timestamp } = payload;

    // Update room state
    this.collaborationService.updateRoomComponents(roomId, components);

    // Broadcast to all other users in the room
    client.to(roomId).emit('component_update', {
      userId,
      components,
      timestamp,
    });

    this.logger.debug(`Component update in room ${roomId} by user ${userId}`);
  }

  @SubscribeMessage('cursor_move')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CursorPosition,
  ) {
    const { roomId, userId, userName, position, color } = payload;

    // Broadcast cursor position to others
    client.to(roomId).emit('cursor_move', {
      userId,
      userName,
      position,
      color,
    });
  }

  @SubscribeMessage('selection_change')
  handleSelectionChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SelectionUpdate,
  ) {
    const { roomId, userId, componentId } = payload;

    // Update user's selection
    this.collaborationService.updateUserSelection(roomId, userId, componentId);

    // Broadcast to others
    client.to(roomId).emit('selection_change', {
      userId,
      componentId,
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  @SubscribeMessage('request_sync')
  handleRequestSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const { roomId } = payload;
    const roomState = this.collaborationService.getRoomState(roomId);

    client.emit('sync_state', {
      components: roomState.components,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast a message to all users in a room
   */
  broadcastToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
  }

  /**
   * Send a message to a specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.collaborationService.getUserSocketId(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
