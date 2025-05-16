// src/modules/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto, TokenDto } from './dtos/login.dto';
import { ForgotDto } from './dtos/forgot.dto';
import { ResetPassword1Dto, ResetPassword2Dto } from './dtos/reset-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../mailer/mailer.service';
import { v4 as uuidv4 } from 'uuid';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { Post } from '../posts/entities/post.entity';
import { FullReponsePostDto, LiteReponsePostDto, ReponseUserDto, ReponseUserProfileDto } from '../posts/dtos/create-post.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as fileType from 'file-type';
import { randomInt } from 'crypto';
import { GetRecipeDto } from './dtos/aichef.dto';
import axios from 'axios'; // Import axios
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType, Part  } from "@google/generative-ai"; // Import necessary types
interface PostAnalysisSchema {
  overview: string; // General overview of the post and image
  isEnglishRelated: boolean; // Flag indicating if the post is about English learning
  englishKnowledge?: { // Optional: Only if isEnglishRelated is true
    topic: string; // Main topic (e.g., "Passive Voice", "Present Perfect")
    details: string[]; // Detailed explanation, grammar rules, formulas
    examples: string[]; // Example sentences
  }[];
  learningTips?: string[]; // Optional: Only if isEnglishRelated is true
  wittyAnalysis?: string; // Optional: Only if isEnglishRelated is false
}
interface ExerciseSchema {
  analysisSummary: string; // Brief summary of the English concepts found (or why none were found)
  isEnglishRelated: boolean; // Whether the post is related to English learning
  exercises: {
    question: string; // The multiple-choice question
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctAnswer: 'A' | 'B' | 'C' | 'D'; // The correct option key
    explanation: string; // Brief explanation why the answer is correct, referencing the post content if possible
  }[];
}

@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }
  async getUserIdFromToKen(token: string): Promise<number> {
    const payload = this.jwtService.decode(token);
    return payload['sub'];
  }
  async register(registerDto: RegisterDto, baseUrl: string): Promise<any> {
    
    try {
      let { username, email, password, name } = registerDto;
      if(name === null || name === undefined){
        name = "Ham ăn " + randomInt(10000, 99999);
      }
      const existingUser = await this.usersRepository.findOne({ where: [{ email }, { username }] });

      if (existingUser?.isActive) {
        throw new BadRequestException('Email hoặc tên đăng nhập đã được sử dụng.');
      }
      if(existingUser){
        await this.usersRepository.delete(existingUser.id);
      }
      const hashedPassword = await bcrypt.hash(password, 10);


      const user = this.usersRepository.create({
        username,
        email,
        name,
        password: hashedPassword,
        isActive: false,
        verificationToken: uuidv4(),
      });

      await this.usersRepository.save(user);
      const url = `${baseUrl}/auth/verify-email?token=${user.verificationToken}`;
      await this.mailerService.sendVerificationEmail(user.username, user.email, user.verificationToken, baseUrl);

      return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.'};
    } 
    catch (error) {
      if (error instanceof BadRequestException) {
      throw error;
      }
      console.log(error);
      throw new BadRequestException('Có lỗi xảy ra trong quá trình đăng ký.');
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { username, password, tokenFCM } = loginDto;
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản chưa được xác thực.');
    }

    const payload = { sub: user.id, username: user.username, roles: user.roles };
    const token = this.jwtService.sign(payload);

    if(tokenFCM !== null && tokenFCM !== undefined){
      user.tokenFCM = tokenFCM;
      await this.usersRepository.save(user);
    }
    return { access_token: token, message: 'Đăng nhập thành công', user: new ReponseUserDto(user) };
  }

  async verifyEmail(token: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { verificationToken: token } });
    
    if (!user) {
      return `
        <!DOCTYPE html>
        <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <title>Xác Thực Email - Lỗi</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="max-width: 600px; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); text-align: center;">
              <div style="font-size: 50px; color: #e74c3c; margin-bottom: 20px;">❌</div>
              <h1 style="color: #333333; margin-bottom: 20px;">Xác Thực Email Thất Bại</h1>
              <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                Liên kết xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực hoặc liên hệ hỗ trợ.
              </p>
              <footer style="margin-top: 40px; color: #888888; font-size: 14px;">&copy; 2024 EngNet. Tất cả các quyền được bảo lưu.</footer>
            </div>
          </body>
        </html>
      `;
    }
  
    user.isActive = true;
    user.verificationToken = null;
    await this.usersRepository.save(user);
  
    return `
      <!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <title>Xác Thực Email Thành Công</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh;">
          <div style="max-width: 600px; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); text-align: center;">
            <div style="font-size: 50px; color: #28a745; margin-bottom: 20px;">✅</div>
            <h1 style="color: #333333; margin-bottom: 20px;">🎉 Email Xác Thực Thành Công!</h1>
            <p style="color: #555555; font-size: 16px; line-height: 1.6;">
              <strong>Username:</strong> ${user.username}<br>
              <strong>Email:</strong> ${user.email}
            </p>
            <p style="color: #555555; font-size: 16px; line-height: 1.6;">
              Cảm ơn bạn đã xác thực email của mình. Bây giờ bạn có thể truy cập đầy đủ các tính năng của EngNet và bắt đầu khám phá những công thức nấu ăn tuyệt vời!
            </p>
            <a href="https://www.EngNet.com" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; margin-top: 30px;">Về Trang Chủ</a>
            <footer style="margin-top: 40px; color: #888888; font-size: 14px;">&copy; 2024 EngNet. Tất cả các quyền được bảo lưu.</footer>
          </div>
        </body>
      </html>
    `;
  }
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác.');
    }
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersRepository.save(user);
    return { message: 'Đổi mật khẩu thành công.' };
  }
  
  async forgotPassword(forgotDto: ForgotDto): Promise<any> {
    const { email } = forgotDto;
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      user.resetPasswordCode = Math.floor(100000 + Math.random() * 900000).toString();
      await this.usersRepository.save(user);

      // Gửi email reset mật khẩu
      await this.mailerService.sendResetPasswordEmail(user.name, user.email, user.resetPasswordCode);
    }

    return { message: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.' };
  }
  

  async resetPasswordCode(resetPassword1Dto: ResetPassword1Dto): Promise<any> {
    const { email, code } = resetPassword1Dto;

    const user = await this.usersRepository.findOne({ where: { email: email } });
    if(user.resetPasswordCode === null){
      throw new BadRequestException('Mã xác nhận đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
    }
    if(user.resetPasswordCode !== code){
      throw new BadRequestException('Mã xác nhận không đúng.');
    }

    user.verificationToken = uuidv4();
    user.resetPasswordCode = null;
    await this.usersRepository.save(user);
    return { token: user.verificationToken, message: 'Mã xác nhận đúng. Bạn có thể đặt lại mật khẩu.' };
  }
  async resetPassword(resetPassword2Dto: ResetPassword2Dto): Promise<any> {
    const { email, token, password } = resetPassword2Dto;

    const user = await this.usersRepository.findOne({ where: { email: email } });
    if(user.verificationToken === null){
      throw new BadRequestException('Mã xác nhận đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.');
    }
    if(user.verificationToken !== token){
      throw new BadRequestException('Mã xác nhận không đúng.');
    }

    user.password = await bcrypt.hash(password, 10);
    user.verificationToken = null;
    await this.usersRepository.save(user);
    return { message: 'Đặt lại mật khẩu thành công.' };
  }
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<any> {
    let profile = await this.usersRepository.findOne({ where: { id: userId } });
    if (!profile) {
      return { message: 'Không tìm thấy profile.' };
    }
    Object.assign(profile, updateProfileDto);
    await this.usersRepository.save(profile);
    return { message: 'Cập nhật hồ sơ thành công.', profile };
  }
  async getProfileByUserId(userId: number): Promise<any> {
    const profile = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['followers', 'following'],
    });
    if (!profile) {
      throw new NotFoundException('Hồ sơ không tồn tại.');
    }
    const totalFollowers = profile.followers.length;
    const totalFollowing = profile.following.length;

    const { id, bio, name, avatar, banner } = profile;
    
    return { userId: id, bio, name, avatar, banner, totalFollowers, totalFollowing };

  }
  async searchUserByUsername(username: string, page: number): Promise<any> {
    const users = await this.usersRepository.find
    ({
      where: {
        username: Like(`%${username}%`)
      }
    })
    const itemsPerPage = 10;
    const startIndex = (page - 1) * itemsPerPage;
    if (users.length > itemsPerPage*page) {
      return {nextPage: true, users: users.slice(startIndex, startIndex + itemsPerPage).map(user => new ReponseUserProfileDto(user, user.totalFollowing, user.totalFollowers))};
    }
    else{
      return {nextPage: false, users: users.slice(startIndex, startIndex + itemsPerPage).map(user => new ReponseUserProfileDto(user, user.totalFollowing, user.totalFollowers))};
    }
  }
  async searchUserByName(name: string, page: number): Promise<any> {
    const users = await this.usersRepository.find
    ({
      where: {
        name: Like(`%${name}%`)
      }
    })
    const itemsPerPage = 10;
    const startIndex = (page - 1) * itemsPerPage;
    if (users.length > itemsPerPage*page) {
      return {nextPage: true, users: users.slice(startIndex, startIndex + itemsPerPage).map(user => new ReponseUserProfileDto(user, user.totalFollowing, user.totalFollowers))};
    }
    else{
      return {nextPage: false, users: users.slice(startIndex, startIndex + itemsPerPage).map(user => new ReponseUserProfileDto(user, user.totalFollowing, user.totalFollowers))};
    }
  }
  async addToFavorites(postId: any, userId: number): Promise<any> {
    const [user, post] = await Promise.all([
      this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.favorites', 'favorites')
      .where('user.id = :userId', { userId })
      .select(['user.id', 'favorites.id'])
      .getOne(),
      
      this.postsRepository.createQueryBuilder('post')
      .where('post.id = :postId', { postId })
      .getOne()
    ]);
      
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại.');
    }
    
    const favoritePostIds = user.favorites.map((fav) => fav.id);
    if (favoritePostIds.some((fav) => fav == postId)) {
      throw new BadRequestException('Bài viết đã có trong danh sách yêu thích.');
    }
    
    user.favorites.push(post);
    this.usersRepository.save(user);
    return { message: 'Đã thêm bài viết vào danh sách yêu thích.'};
  
  }

  async deleteFromFavorites(postId: number, userId: number): Promise<any> {
    const user = await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.favorites', 'favorites')
      .where('user.id = :userId', { userId })
      .select(['user.id', 'favorites.id'])
      .getOne();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const favoriteIndex = user.favorites.findIndex((fav) => fav.id == postId);

    if (favoriteIndex == -1) {
      throw new NotFoundException('Bài viết không nằm trong danh sách yêu thích của bạn.');
    }
    user.favorites.splice(favoriteIndex, 1);

    this.usersRepository.save(user);
    return { message: 'Đã xóa bài viết khỏi danh sách yêu thích.' };
  }

  async getFavorites(page: number, userId: number): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const favorites = user.favorites;

    const itemsPerPage = 10;
    const startIndex = (page - 1) * itemsPerPage;
    if (favorites.length > itemsPerPage*page) {
      return {nextPage: true, favorites: favorites.slice(startIndex, startIndex + itemsPerPage).map(fav => new LiteReponsePostDto(fav))};
    }
    else{
      return {nextPage: false, favorites: favorites.slice(startIndex, startIndex + itemsPerPage).map(fav => new LiteReponsePostDto(fav))};
    }
  }
  async checkFavorite(postId: number, userId: number): Promise<any> {
    const user = await this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.favorites', 'favorites')
      .where('user.id = :userId', { userId })
      .select(['user.id', 'favorites.id'])
      .getOne();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const favoritePostIds = user.favorites.map((fav) => fav.id);
    if (favoritePostIds.some((fav) => fav == postId)) {
      return { isFavorited: true };
    }
    return { isFavorited: false };

  }
  async setTokenFCM(tokenDto: TokenDto, userId: number): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.tokenFCM = tokenDto.token;
    await this.usersRepository.save(user);
    return { message: 'Đã cập nhật tokenFCM.' };
  }
  async logout(userId: number): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.tokenFCM = null;
    await this.usersRepository.save(user);
    return { message: 'Đã đăng xuất.' };
  }
  /*
  async uploadImage(file: Express.Multer.File): Promise<any> {
    try {
      if(!file) return {error: "No file uploaded"}
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'uploads',
      });
      console.log(result.secure_url);
      return result.secure_url;

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
    */
  async uploadImage(buffer: Buffer): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'uploads' },
          (error, result) => {
            if (error) {
              reject(new InternalServerErrorException('Failed to upload image to Cloudinary'));
            }
            console.log({imageURL: result.secure_url})
            resolve(
              {imageURL: result.secure_url}
            );
          }
        );

        readable.pipe(uploadStream);
      });

    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
  // #############################
  async urlToGenerativePart(url: string, mimeType: string): Promise<{ inlineData: { data: string; mimeType: string } }> {
    try {
      const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data); // 'binary' encoding is deprecated for ArrayBuffer
      return {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType,
        },
      };
    } catch (error) {
      console.error("Error fetching image from URL:", url, error);
      throw new InternalServerErrorException('Failed to fetch image for analysis');
    }
  }

  async CreateExFromPost(postId: number, level: number): Promise<any> {
    try {
      const postData = await this.postsRepository.findOne({
        where: { id: postId },
        // No need to load author for this specific task
      });

      if (!postData) {
        throw new NotFoundException('Post not found');
      }

      // Map level (1-6) to CEFR levels (A1-C2)
      const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const targetLevel = cefrLevels[level - 1] || 'B1'; // Default to B1 if level is invalid

      // It's highly recommended to store API keys in environment variables
      const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCpO5z7jxHYM6JDa6eSQs8lx4atAjPWgVw"; // Use the provided key
      const MODEL_NAME = "gemini-2.0-flash"; // Model supporting image and JSON output

      const genAI = new GoogleGenerativeAI(API_KEY);

      // Define the desired JSON output structure for Gemini
      const exerciseResponseSchema = {
        type: SchemaType.OBJECT,
        properties: {
          analysisSummary: {
            type: SchemaType.STRING,
            description: `Tóm tắt ngắn gọn về các khái niệm tiếng Anh được tìm thấy trong bài viết và hình ảnh, hoặc giải thích tại sao không thể tạo bài tập (ví dụ: nội dung không liên quan). Ngôn ngữ: Tiếng Việt.`,
          },
          isEnglishRelated: {
            type: SchemaType.BOOLEAN,
            description: "Xác định bài viết có liên quan trực tiếp đến việc học tiếng Anh hay không.",
          },
          exercises: {
            type: SchemaType.ARRAY,
            description: `Danh sách các câu hỏi trắc nghiệm (A, B, C, D) dựa trên nội dung tiếng Anh trong bài viết và hình ảnh, phù hợp với trình độ ${targetLevel}. Ngôn ngữ: Tiếng Anh cho câu hỏi và lựa chọn, Tiếng Việt cho giải thích.`,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: {
                  type: SchemaType.STRING,
                  description: "Câu hỏi trắc nghiệm bằng tiếng Việt, rõ ràng, ngắn gọn.",
                },
                options: {
                  type: SchemaType.OBJECT,
                  properties: {
                    A: { type: SchemaType.STRING, description: "Lựa chọn A (Tiếng Anh)" },
                    B: { type: SchemaType.STRING, description: "Lựa chọn B (Tiếng Anh)" },
                    C: { type: SchemaType.STRING, description: "Lựa chọn C (Tiếng Anh)" },
                    D: { type: SchemaType.STRING, description: "Lựa chọn D (Tiếng Anh)" },
                  },
                  required: ["A", "B", "C", "D"],
                },
                correctAnswer: {
                  type: SchemaType.STRING,
                  enum: ["A", "B", "C", "D"],
                  description: "Chữ cái (A, B, C, hoặc D) của đáp án đúng.",
                },
                explanation: {
                    type: SchemaType.STRING,
                    description: "Giải thích bằng tiếng Việt tại sao đáp án đó đúng, tại sao từng đáp án khác sai",
                }
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
        required: ["analysisSummary", "exercises", "isEnglishRelated"],
      };


      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        safetySettings: [ // Standard safety settings
           { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
           { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
           { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
           { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        generationConfig: {
          temperature: 0.1, // Lower temperature for more predictable exercises
          topP: 0.45,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: exerciseResponseSchema,
        },
      });

      // Map numeric level (1-6) to descriptive difficulty
      let targetLevelDesc: string;
      if (level <= 2) {
        targetLevelDesc = 'Easy';
      } else if (level <= 4) {
        targetLevelDesc = 'Medium';
      } else {
        targetLevelDesc = 'Hard';
      }

      const prompt = `
        Bạn là một trợ lý AI chuyên nghiệp, bậc thầy trong việc tạo ra các bài tập tiếng Anh đa dạng và phù hợp với từng cấp độ từ nội dung mạng xã hội. Nhiệm vụ của bạn là phân tích sâu sắc một bài viết (tiêu đề, mô tả, nội dung chi tiết) và hình ảnh đi kèm (nếu có) để xây dựng các câu hỏi trắc nghiệm chất lượng cao, kiểm tra nhiều kỹ năng khác nhau cho người học tiếng Anh.

        Phân tích bài viết sau:

           ID Bài viết: ${postData.id}
           Tiêu đề: ${postData.title || 'Không có'}
           Mô tả: ${postData.description || 'Không có'}
           Các bước/Nội dung chi tiết: ${postData.steps ? postData.steps.join('\n') : 'Không có'}
           URL Hình ảnh: ${postData.mainImage || 'Không có hình ảnh'}

        Yêu cầu:

        1.  Phân tích Chuyên sâu: Đọc hiểu văn bản VÀ phân tích hình ảnh (nếu có) một cách kỹ lưỡng. Xác định không chỉ từ vựng/ngữ pháp rõ ràng mà còn cả các cấu trúc ẩn ý, sắc thái nghĩa, cách diễn đạt tự nhiên, và kiến thức văn hóa (nếu có) liên quan đến tiếng Anh.
        2.  Đánh giá Mức độ liên quan: Nội dung có trực tiếp dạy, minh họa, hoặc cung cấp ngữ cảnh thực tế cho việc học tiếng Anh không?
        3.  Tạo Bài tập Đa dạng (Nếu liên quan):
           Dựa trên phân tích, tạo ra 4 câu hỏi trắc nghiệm (A, B, C, D). Câu hỏi bằng tiếng Việt, đáp án bằng tiếng Anh.
           Đa dạng hóa loại câu hỏi: Kết hợp nhiều dạng để kiểm tra toàn diện, mỗi loại câu hỏi lấy 1:
               Từ vựng: Nghĩa của từ/cụm từ trong ngữ cảnh, từ đồng nghĩa/trái nghĩa, collocations (kết hợp từ), phrasal verbs, idioms (thành ngữ).
               Ngữ pháp: Chọn cấu trúc đúng, sửa lỗi sai, sử dụng thì/dạng phù hợp, cấu trúc câu phức tạp (mệnh đề, câu điều kiện, bị động...).
               Đọc hiểu: Tìm ý chính, chi tiết cụ thể, suy luận (inference), hiểu thái độ/mục đích của tác giả, liên kết thông tin giữa văn bản và hình ảnh.
               Điền vào chỗ trống (Gap-fill): Chọn từ/cụm từ phù hợp nhất để hoàn thành câu.
               Ứng dụng thực tế (Situational): Đưa ra một tình huống ngắn gọn liên quan đến chủ đề bài viết, yêu cầu chọn cách diễn đạt/phản hồi bằng tiếng Anh phù hợp nhất, thể hiện sự hiểu biết về kiến thức đã học.
           Phân hóa Độ khó Rõ rệt (${targetLevelDesc}): Điều chỉnh độ phức tạp của câu hỏi, từ vựng, cấu trúc ngữ pháp, và các phương án gây nhiễu (distractors) một cách tinh vi cho từng cấp độ:

               Easy:
               Trọng tâm: Nhận biết từ vựng cơ bản, cấu trúc câu đơn giản (S-V-O), thì hiện tại đơn/tiếp diễn, quá khứ đơn cơ bản. Tìm thông tin trực tiếp, rõ ràng trong bài.
               Câu hỏi: Chủ yếu là "Cái gì?", "Ở đâu?", "Ai?", chọn từ đúng nghĩa đen, hoàn thành câu rất đơn giản.
               Ví dụ loại câu hỏi: Chọn nghĩa đúng của một từ rất phổ biến trong bài; Điền một giới từ cơ bản vào chỗ trống; Tìm một chi tiết được nêu rõ trong 1-2 câu đầu.
               Phương án nhiễu: Rất khác biệt, dễ loại trừ (sai nghĩa hoàn toàn, sai ngữ pháp cơ bản).

               Medium:
               Trọng tâm: Hiểu ý chính, suy luận đơn giản, từ vựng phổ biến và một số collocations/phrasal verbs thông dụng, các thì phức tạp hơn (hiện tại hoàn thành, quá khứ tiếp diễn), câu điều kiện loại 1 & 2, bị động cơ bản, mệnh đề quan hệ đơn giản.
               Câu hỏi: Yêu cầu hiểu hàm ý cơ bản, tóm tắt ý, áp dụng quy tắc ngữ pháp vào ngữ cảnh tương tự, phân biệt từ gần nghĩa thông dụng, chọn câu trả lời phù hợp trong một tình huống đơn giản.
               Ví dụ loại câu hỏi: Từ nào đồng nghĩa với X trong đoạn văn?; Tại sao tác giả đề cập đến Y?; Chọn thì đúng cho động từ trong câu Z; Nếu bạn ở trong tình huống mô tả, bạn sẽ nói gì (chọn câu đơn giản, trực tiếp)?
               Phương án nhiễu: Có vẻ hợp lý về chủ đề nhưng sai về chi tiết, ngữ pháp, hoặc sắc thái nghĩa trong ngữ cảnh câu hỏi.

               Hard:
               Trọng tâm: Phân tích sâu, suy luận phức tạp, hiểu ẩn ý/thái độ/mục đích, từ vựng nâng cao/học thuật/chuyên ngành (nếu có), idioms, phrasal verbs phức tạp, cấu trúc ngữ pháp tinh vi (đảo ngữ, câu chẻ, điều kiện hỗn hợp/loại 3, mệnh đề phân từ, bị động nâng cao), từ vựng thật khó, hiếm gặp, bắt buộc có hành ngữ,...
               Câu hỏi: Yêu cầu phân tích dụng ý tác giả, đánh giá thông tin, tổng hợp ý từ nhiều nguồn (văn bản + hình ảnh), hiểu sắc thái nghĩa tinh tế, áp dụng kiến thức vào tình huống phức tạp hoặc trừu tượng, chọn cách diễn đạt tự nhiên và phù hợp nhất về văn phong.
               Ví dụ loại câu hỏi: Thái độ của tác giả đối với vấn đề X là gì?; Hàm ý chính của hình ảnh khi kết hợp với đoạn văn là gì?; Chọn cấu trúc ngữ pháp nâng cao (vd: đảo ngữ) phù hợp nhất để diễn đạt lại ý Y; Trong tình huống Z phức tạp, cách phản hồi nào thể hiện sự tinh tế/lịch sự/chuyên nghiệp nhất (chọn câu phức tạp, có sắc thái)?
               Phương án nhiễu: Rất tinh vi, dễ gây nhầm lẫn, kiểm tra sự khác biệt nhỏ về nghĩa/cách dùng, các lỗi sai phổ biến ở trình độ cao, hoặc các lựa chọn đúng một phần nhưng không phải là tốt nhất.

           Ngôn ngữ: Câu hỏi (tiếng Việt) và các lựa chọn A, B, C, D (tiếng Anh).
           Đáp án & Giải thích Chi tiết: Cung cấp đáp án đúng (chữ cái A/B/C/D) và giải thích bằng Tiếng Việt cực kỳ rõ ràng, logic. Phải chỉ rõ:
               Tại sao đáp án đúng (dựa vào đâu trong bài/hình ảnh? quy tắc ngữ pháp/từ vựng nào? logic suy luận?).
               Tại sao từng phương án sai lại không chính xác (sai ở điểm nào: ngữ pháp, từ vựng, logic, không liên quan, không phù hợp ngữ cảnh/văn phong?).
        4.  Trường hợp Không liên quan: Nếu nội dung không đủ chất lượng hoặc không liên quan đến tiếng Anh để tạo bài tập ý nghĩa ở cấp độ yêu cầu, giải thích rõ lý do trong 'analysisSummary' và để trống 'exercises'.
        5.  Định dạng Output: TUYỆT ĐỐI CHÍNH XÁC trả về kết quả dạng JSON theo 'responseSchema'. Đảm bảo mọi trường bắt buộc đều có mặt, đúng kiểu dữ liệu, và nội dung logic.

        Hãy vận dụng sự sáng tạo và kiến thức chuyên sâu về ngôn ngữ để tạo ra những bài tập thực sự thử thách và hữu ích, phản ánh chính xác độ khó yêu cầu (${targetLevelDesc}).
        `;

      const chatSession = model.startChat({
        history: [],
        // generationConfig is already set in getGenerativeModel
      });

      const parts: Part[] = [{ text: prompt }]; // Initialize parts with the text prompt

      // Fetch image data if URL exists and add it to the parts
      if (postData.mainImage) {
        try {
          // Basic MIME type detection based on common extensions
          let imageMimeType = 'image/jpeg'; // Default
          const extension = postData.mainImage.split('.').pop()?.toLowerCase();
          if (extension === 'png') {
            imageMimeType = 'image/png';
          } else if (extension === 'gif') {
            imageMimeType = 'image/gif';
          } else if (extension === 'webp') {
            imageMimeType = 'image/webp';
          }
          // Add more types if needed

          const imagePart = await this.urlToGenerativePart(postData.mainImage, imageMimeType);
          parts.push(imagePart); // Add the image part
        } catch (imageError) {
          console.warn(`Could not fetch or process image for post ${postId}: ${imageError.message}. Proceeding without image.`);
          // Optionally add a note to the prompt that the image couldn't be processed
          // parts[0].text += "\n\nLưu ý: Không thể tải hoặc xử lý hình ảnh được cung cấp.";
        }
      }

      const result = await chatSession.sendMessage(parts);
      const responseText = result.response.text();

      // Log the raw response for debugging
      // console.log("Raw Gemini Response for Exercise Generation:", responseText);

      try {
        // Gemini should return valid JSON because of responseSchema
        const parsedData: ExerciseSchema = JSON.parse(responseText);
        return parsedData;
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON response for exercises:", parseError);
        console.error("Raw response was:", responseText);
        throw new InternalServerErrorException('Failed to parse AI exercise generation response');
      }

    } catch (error) {
      console.error("Error during exercise generation:", error);
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      // Log the specific Gemini API error if available
      if (error.response && error.response.data) {
          console.error("Gemini API Error:", error.response.data);
      } else if (error.message) {
          console.error("Gemini SDK/Request Error:", error.message);
      }
      throw new InternalServerErrorException('Failed to generate exercises with AI');
    }
  }
  async phanTichPost(postID: number): Promise<any> {
    try {
      const postData = await this.postsRepository.findOne({
         where: { id: postID },
         relations: ['author'] // Ensure author is loaded if needed later, though not directly used in prompt
        });

      if (!postData) {
        throw new NotFoundException('Post not found');
      }

      // It's highly recommended to store API keys in environment variables
      const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCpO5z7jxHYM6JDa6eSQs8lx4atAjPWgVw";
      const MODEL_NAME = "gemini-2.0-flash"; // Use gemini-1.5-flash as it supports image input

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
         model: MODEL_NAME,
         // Safety settings can be adjusted as needed
         safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
         ],
        });

      const generationConfig = {
        temperature: 0, // Adjust temperature for creativity vs. factuality
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192, // Adjust as needed
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            overview: {
              type: SchemaType.STRING,
              description: "Tóm tắt chung về nội dung bài viết và hình ảnh (nếu có).",
            },
            isEnglishRelated: {
              type: SchemaType.BOOLEAN,
              description: "Xác định bài viết có liên quan trực tiếp đến việc học tiếng Anh hay không.",
            },
            englishKnowledge: {
              type: SchemaType.ARRAY,
              description: "Chỉ bao gồm nếu isEnglishRelated là true. Chi tiết về các điểm kiến thức tiếng Anh.",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  topic: {
                    type: SchemaType.STRING,
                    description: "Chủ đề ngữ pháp hoặc từ vựng chính (ví dụ: 'Passive Voice', 'Present Perfect', 'Vocabulary: Travel').",
                  },
                  details: {
                    type: SchemaType.ARRAY,
                    description: "Giải thích chi tiết, quy tắc ngữ pháp, công thức liên quan đến chủ đề.",
                    items: { type: SchemaType.STRING },
                  },
                  examples: {
                    type: SchemaType.ARRAY,
                    description: "Các câu ví dụ minh họa cho chủ đề.",
                    items: { type: SchemaType.STRING },
                  },
                },
                required: ["topic", "details", "examples"],
              },
            },
            learningTips: {
              type: SchemaType.ARRAY,
              description: "Chỉ bao gồm nếu isEnglishRelated là true. Các mẹo học tập, ghi nhớ liên quan đến kiến thức trong bài.",
              items: { type: SchemaType.STRING },
            },
            wittyAnalysis: {
              type: SchemaType.STRING,
              description: "Chỉ bao gồm nếu isEnglishRelated là false. Một phân tích ngắn gọn, hài hước, hoặc lém lỉnh về nội dung bài viết và hình ảnh.",
            },
          },
          required: ["overview", "isEnglishRelated"],
        },
      };

      const prompt = `
Bạn là một trợ lý AI phân tích nội dung mạng xã hội cho người học tiếng Anh. Nhiệm vụ của bạn là phân tích bài viết và hình ảnh đi kèm (nếu có) để cung cấp thông tin hữu ích cho người dùng.

Phân tích bài viết sau:

   Tiêu đề: ${postData.title}
   Mô tả: ${postData.description}
   Các bước/Nội dung chi tiết: ${postData.steps ? postData.steps.join('\n') : 'Không có'}
   URL Hình ảnh: ${postData.mainImage || 'Không có hình ảnh'}

Yêu cầu:

1.  Đọc và hiểu nội dung văn bản (tiêu đề, mô tả, các bước) VÀ phân tích hình ảnh từ URL được cung cấp.
2.  Đánh giá tổng quan: Cung cấp một cái nhìn chung về chủ đề của bài viết và hình ảnh.
3.  Xác định tính liên quan đến tiếng Anh: Quyết định xem nội dung chính có phải về dạy/học tiếng Anh không (ngữ pháp, từ vựng, kỹ năng, mẹo học...).
4.  Nếu liên quan đến tiếng Anh:
       Trích xuất các chủ đề kiến thức chính (ví dụ: "Câu bị động", "Từ vựng chủ đề du lịch").
       Với mỗi chủ đề, cung cấp giải thích chi tiết hơn, làm rõ các quy tắc, công thức được đề cập hoặc ẩn ý. Đảm bảo tính chính xác về ngữ pháp.
       Cung cấp thêm các ví dụ minh họa rõ ràng.
       Đề xuất các mẹo phải đi sâu, cụ thể vào kiến thức đó, không viết chung chung.
5.  Nếu KHÔNG liên quan đến tiếng Anh:
       Cung cấp một phân tích dí dỏm, hài hước, hoặc thú vị về nội dung bài viết và hình ảnh. Giữ thái độ tích cực và vui vẻ.
6.  Luôn trả về kết quả dưới dạng JSON theo đúng cấu trúc đã định nghĩa trong responseSchema. Đảm bảo tất cả các trường bắt buộc đều có mặt.

Hãy phân tích cẩn thận cả văn bản và hình ảnh để đưa ra kết quả chính xác và hữu ích nhất bằng tiếng Việt.
`;

      const chatSession = model.startChat({
        generationConfig,
        history: [
        ],
      });

      const parts: any[] = [prompt];

      // Fetch image data if URL exists and add it to the parts
      if (postData.mainImage) {
        // Assuming JPEG, adjust mime type if necessary (e.g., 'image/png')
        // You might need a more robust way to determine mime type if URLs vary
        const imageMimeType = 'image/jpeg'; // Or determine dynamically if possible
        const imagePart = await this.urlToGenerativePart(postData.mainImage, imageMimeType);
        parts.push(imagePart);
      }


      const result = await chatSession.sendMessage(parts);
      const responseText = result.response.text();

      // Log the raw response for debugging
      // console.log("Raw Gemini Response:", responseText);

      try {
        const parsedData: PostAnalysisSchema = JSON.parse(responseText);
        return parsedData;
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON response:", parseError);
        console.error("Raw response was:", responseText);
        throw new InternalServerErrorException('Failed to parse AI analysis response');
      }

    } catch (error) {
      console.error("Error during post analysis:", error);
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      // Log the specific Gemini API error if available
      if (error.response && error.response.data) {
          console.error("Gemini API Error:", error.response.data);
      } else if (error.message) {
          console.error("Gemini SDK/Request Error:", error.message);
      }
      throw new InternalServerErrorException('Failed to analyze post with AI');
    }
  }







  async sendImageToAI(buffer: Buffer): Promise<any> {
    try{
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      
      const genAI = new GoogleGenerativeAI("AIzaSyBEEXfHU_NM0mQUIrqitWBcc-JzIR-3ccw");
      function fileToGenerativePart(buf, mimeType) {
        return {
          inlineData: {
            data: buf.toString("base64"),
            mimeType
          },
        };
      }
      const imageParts = [
        fileToGenerativePart(buffer, "image/jpeg")
      ]
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const generationConfig = {
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          description: "Danh sách nguyên liệu phân tích được từ trong ảnh và tên các món ăn chế biến được chỉ với những nguyên liệu đó",
          properties: {
            ingredients: {
              type: "array",
              description: "Danh sách nguyên liệu phân tích được từ trong ảnh",
              items: {
                type: "object",
                description: "Nguyên liệu phân tích được từ trong ảnh",
                properties: {
                  name: {
                    type: "string",
                    description: "Tên nguyên liệu"
                  },
                  quantity: {
                    type: "string",
                    description: "Số lượng nguyên liệu"
                  }
                },
                required: [
                  "name",
                  "quantity"
                ]
              }
            },
            recipes: {
              type: "array",
              description: "Danh sách món ăn chế biến được chỉ với những nguyên liệu có sẵn, không cần chuẩn bị thêm",
              items: {
                type: "string",
                description: "Tên món ăn"
              }
            }
          },
          required: [
            "ingredients",
            "recipes"
          ]
        },
      };
      const chatSession = model.startChat({
        generationConfig,
        history: [
        ],
      });
      const prompt = 
`
Bạn là trợ lý AI chuyên phân tích nguyên liệu và nấu ăn. Tôi sẽ gửi cho bạn một hình ảnh là các nguyên liệu nấu ăn, tôi cần bạn phân tích hình ảnh đó và tìm những món ăn nấu được ngay từ những nguyên liệu đó mà không cần mua thêm. Khi nhận hình ảnh nguyên liệu, bạn phải phân tích và liệt kê chính xác các nguyên liệu có trong ảnh (bao gồm số lượng cụ thể như "1kg", "2 thìa canh", "3 quả").
Sau đó hãy tạo ra 3-6 món ăn nấu được luôn với những nguyên liệu đã có, không cần chuẩn bị thêm, chỉ dùng những nguyên liệu đã có để tạo món ăn, không tạo những món ăn mà thiếu nguyên liệ.
Mỗi món ăn tạo ra phải thật hợp lý, thực tế, ăn được. Chỉ dùng những nguyên liệu đã có để tạo món ăn, không tạo những món ăn mà thiếu nguyên liệu.
Kết quả trả về là tiếng việt.
`
      
      //const result = await model.generateContent([prompt, ...imageParts]);
      const result = await chatSession.sendMessage([prompt, ...imageParts]);

      const data = result.response.text();
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to analyze image');
    }

  }
  async getRecipesByIngredients(getRecipeDto: GetRecipeDto ): Promise<any> {
    try{
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      
      const genAI = new GoogleGenerativeAI("AIzaSyBEEXfHU_NM0mQUIrqitWBcc-JzIR-3ccw");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const generationConfig = {
        temperature: 1,
        topP: 0.5,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              description: "Danh sách công thức nấu ăn",
              items: {
                type: "object",
                description: "Công thức nấu ăn",
                properties: {
                  name: {
                    type: "string",
                    description: "Tên món ăn, phải thật lém lỉnh, hài hước, thú vị"
                  },
                  ingredients: {
                    type: "array",
                    description: "Danh sách nguyên liệu, số lượng nguyên liệu cần chế biến món ăn",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          description: "Tên nguyên liệu"
                        },
                        quantity: {
                          type: "string",
                          description: "Số lượng nguyên liệu"
                        }
                      },
                      required: [
                        "name",
                        "quantity"
                      ]
                    }
                  },
                  steps: {
                    type: "array",
                    description: "Danh sách các bước nấu ăn, hướng dẫn cách chế biến món ăn",
                    items: {
                      type: "string",
                      description: "Bước nấu ăn, phải thật lém lỉnh, hài hước, thú vị"
                    }
                  }
                },
                required: [
                  "name",
                  "ingredients",
                  "steps"
                ]
              }
            }
          },
          required: [
            "recipes"
          ]
        },
      };
      
      const chatSession = model.startChat({
        generationConfig,
        history: [
        ],
      });
      let prompt: any;
      prompt =
`
Nhập vai thành một đầu bếp chuyên nghiệp, hãy giúp tôi xây dựng các công thức nấu ăn chỉ với những nguyên liệu của tôi, không được sử dụng thêm nguyên liệu nào khác.
Các món ăn phải thực tế, có thật, ăn được.
Dưới đây là danh sách nguyên liệu của tôi:
${JSON.stringify(getRecipeDto, null, 2)}
Chỉ được sử dụng những nguyên liệu trên, tạo cho tôi những nguyên liệu và các bước để nấu các món ăn thật ngon từ những nguyên liệu đó.
Các bước nấu ăn phải đủ: sơ chế nguyên liệu, chế biến món ăn, trình bày món ăn.
Các bước hướng dẫn phải thật hài hước, thú vị, lém lỉnh, bắt chước cách nói chuyện hài hước của giới trẻ, bắt chước cách sử dụng những từ ngữ trending, những từ giới trẻ hay dùng. 
Pha các trò đùa, câu chuyện, tình huống hài hước vào bước chế biến món ăn.
Có thể ẩn dụ trêu đùa (nội dung người lớn nhưng tế nhị).
`;

      if(getRecipeDto.recipes){
prompt = 
`
Nhập vai thành một đầu bếp chuyên nghiệp, hãy giúp tôi xây dựng các công thức nấu ăn chỉ với những nguyên liệu của tôi, không được sử dụng thêm nguyên liệu nào khác.
Các món ăn phải thực tế, có thật, ăn được.
Dưới đây là danh sách nguyên liệu của tôi:
${JSON.stringify(getRecipeDto, null, 2)}
Chỉ được sử dụng những nguyên liệu trên, tạo cho tôi những nguyên liệu và các bước để nấu từng món ăn sau:
${JSON.stringify(getRecipeDto.recipes, null, 2)}
Các bước nấu ăn phải đủ: sơ chế nguyên liệu, chế biến món ăn, trình bày món ăn.
Các bước hướng dẫn phải thật hài hước, thú vị, lém lỉnh, bắt chước cách nói chuyện hài hước của giới trẻ, bắt chước cách sử dụng những từ ngữ trending, những từ giới trẻ hay dùng. 
Pha các trò đùa, câu chuyện, tình huống hài hước vào bước chế biến món ăn.
Có thể ẩn dụ trêu đùa (nội dung người lớn nhưng tế nhị).
`
      }
      let result: any;
      if(getRecipeDto.note){
        const note = 
`
Ghi chú cho món ăn:
${JSON.stringify(getRecipeDto.note, null, 2)}
`
        result = await chatSession.sendMessage([prompt,...note]);
      }
      else 
      {
        result = await chatSession.sendMessage(prompt);
      }
      console.log('ok2');
      const data = result.response.text();
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (error) {
      console.log(error);
      throw new Error('Failed get recipes by ingredients');
    }
  }
}

