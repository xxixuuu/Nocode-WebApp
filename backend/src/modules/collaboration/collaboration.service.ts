import { Injectable, Logger } from '@nestjs/common';

interface User {
  socketId: string;
  userName: string;
  joinedAt: Date;
  selectedComponentId?: string | null;
}

interface Room {
  id: string;
  users: Map<string, User>;
  components: any[];
  createdAt: Date;
  lastActivityAt: Date;
}

@Injectable()
export class CollaborationService {
  private rooms: Map<string, Room> = new Map();
  private userToRooms: Map<string, Set<string>> = new Map();
  private logger = new Logger('CollaborationService');

  /**
   * Add a user to a room
   */
  addUserToRoom(roomId: string, userId: string, userData: User): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        components: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      });
    }

    const room = this.rooms.get(roomId)!;
    room.users.set(userId, userData);
    room.lastActivityAt = new Date();

    // Track user's rooms
    if (!this.userToRooms.has(userId)) {
      this.userToRooms.set(userId, new Set());
    }
    this.userToRooms.get(userId)!.add(roomId);

    this.logger.log(
      `User ${userId} added to room ${roomId}. Room now has ${room.users.size} users.`,
    );
  }

  /**
   * Remove a user from a room
   */
  removeUserFromRoom(roomId: string, userId: string): string {
    const room = this.rooms.get(roomId);
    if (!room) return '';

    const user = room.users.get(userId);
    const userName = user?.userName || '';

    room.users.delete(userId);
    room.lastActivityAt = new Date();

    // Remove room from user's tracking
    const userRooms = this.userToRooms.get(userId);
    if (userRooms) {
      userRooms.delete(roomId);
      if (userRooms.size === 0) {
        this.userToRooms.delete(userId);
      }
    }

    // Clean up empty rooms after 5 minutes of inactivity
    if (room.users.size === 0) {
      setTimeout(() => {
        const currentRoom = this.rooms.get(roomId);
        if (currentRoom && currentRoom.users.size === 0) {
          this.rooms.delete(roomId);
          this.logger.log(`Room ${roomId} deleted due to inactivity`);
        }
      }, 5 * 60 * 1000);
    }

    this.logger.log(
      `User ${userId} removed from room ${roomId}. Room now has ${room.users.size} users.`,
    );

    return userName;
  }

  /**
   * Get all rooms a user is in
   */
  getUserRooms(userId: string): string[] {
    const rooms = this.userToRooms.get(userId);
    return rooms ? Array.from(rooms) : [];
  }

  /**
   * Get room state
   */
  getRoomState(roomId: string): { components: any[]; users: Map<string, User> } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { components: [], users: new Map() };
    }

    return {
      components: room.components,
      users: room.users,
    };
  }

  /**
   * Update room components
   */
  updateRoomComponents(roomId: string, components: any[]): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.components = components;
    room.lastActivityAt = new Date();
  }

  /**
   * Get active users in a room
   */
  getActiveUsers(roomId: string): Array<{ userId: string; userName: string; selectedComponentId?: string | null }> {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.users.entries()).map(([userId, user]) => ({
      userId,
      userName: user.userName,
      selectedComponentId: user.selectedComponentId,
    }));
  }

  /**
   * Update user's selected component
   */
  updateUserSelection(roomId: string, userId: string, componentId: string | null): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(userId);
    if (user) {
      user.selectedComponentId = componentId;
      room.lastActivityAt = new Date();
    }
  }

  /**
   * Get user's socket ID
   */
  getUserSocketId(userId: string): string | null {
    for (const room of this.rooms.values()) {
      const user = room.users.get(userId);
      if (user) {
        return user.socketId;
      }
    }
    return null;
  }

  /**
   * Get room statistics
   */
  getRoomStats(roomId: string): {
    userCount: number;
    componentCount: number;
    createdAt: Date;
    lastActivityAt: Date;
  } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      userCount: room.users.size,
      componentCount: room.components.length,
      createdAt: room.createdAt,
      lastActivityAt: room.lastActivityAt,
    };
  }

  /**
   * Get all rooms
   */
  getAllRooms(): Array<{ roomId: string; userCount: number; componentCount: number }> {
    return Array.from(this.rooms.entries()).map(([roomId, room]) => ({
      roomId,
      userCount: room.users.size,
      componentCount: room.components.length,
    }));
  }
}
