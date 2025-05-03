// src/modules/follows/follows.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private followsRepository: Repository<Follow>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async followUser(targetUserId: number, currentUserId: number): Promise<any> {
    if (targetUserId == currentUserId) {
    throw new BadRequestException('Bạn không thể theo dõi chính mình.');
    }

    const [follower, targetUser, existingFollow] = await Promise.all([
      this.usersRepository.findOne({ where: { id: currentUserId } }),

      this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.followers', 'followers')
      .where('user.id = :id', { id: targetUserId })
      .getOne(),

      this.followsRepository.findOne({
      where: { follower: { id: currentUserId }, following: { id: targetUserId } },
      })
    ]);

    if (!targetUser) {
      throw new NotFoundException('Người dùng không tồn tại.');
      }
    if (existingFollow) {
    throw new BadRequestException('Bạn đã theo dõi người dùng này trước đó.');
    }

    follower.totalFollowing += 1;
    targetUser.totalFollowers += 1;
    this.usersRepository.save(follower);
    this.usersRepository.save(targetUser);
    const follow = this.followsRepository.create({ follower, following: targetUser });
    this.followsRepository.save(follow);
    this.notificationsService.sendNotificationWithImage(targetUserId, "NEW_FOLLOWER", follower.id, follower.avatar, follower.name)
    return { message: 'Đã theo dõi người dùng.'};

  }

  async unfollowUser(targetUserId: number, currentUserId: number): Promise<any> {
    const follow = await this.followsRepository.findOne({
      where: { follower: { id: currentUserId }, following: { id: targetUserId } },
      relations: ['follower', 'following']
    });
    if (!follow) {
      throw new BadRequestException('Bạn chưa theo dõi người dùng này.');
    }

    follow.follower.totalFollowing -= 1;
    follow.following.totalFollowers -= 1;

    this.usersRepository.save(follow.follower);
    this.usersRepository.save(follow.following);
    this.followsRepository.remove(follow);
    return { message: 'Đã hủy theo dõi người dùng.'};
  }

  async getFollowers(userId: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['followers', 'followers.follower'],
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }
    const followers = user.followers.map((follow) => follow.follower);
    return { followers };
  }

  async getFollowing(userId: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following', 'following.following'],
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }
    const following = user.following.map((follow) => follow.following);
    return { following };
  }
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.followsRepository.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });
    return !!follow;
  }
  async checkFollow(followerId: number, followingId: number): Promise<any> {
    const follow = await this.followsRepository.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });
    if (!follow) {
      return { isFollowed: false };
    }
    return { isFollowed: true };
  }
  async initFollow(): Promise<any> {
    const followMap = await this.followsRepository
      .createQueryBuilder('follow')
      .select(['follow.id', 'follower.id', 'following.id'])
      .leftJoin('follow.follower', 'follower')
      .leftJoin('follow.following', 'following')
      .getMany();
    const users = await this.usersRepository.find();
    users.forEach((user) => {
      user.totalFollowers = followMap.filter((follow) => follow.following.id == user.id).length;
      user.totalFollowing = followMap.filter((follow) => follow.follower.id == user.id).length;
      console.log(user.id, user.totalFollowers, user.totalFollowing);
    });
    this.usersRepository.save(users);
    return { message: 'Done' };    
  }
}
