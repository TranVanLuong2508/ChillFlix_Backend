import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BackenDBQuery } from './DBQuery/db-query';
import { Client } from 'pg';

@Injectable()
export class ChatbotService {
  private client: Client;
  private model: any;
  constructor(private configService: ConfigService) {
    this.client = new Client({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
    });

    this.client
      .connect()
      .then(() => console.log(`Connected to DB: ${this.configService.get('DB_NAME')}`))
      .catch((err) => console.error('DB connection error:', err));

    const genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') as string,
    );
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async query(sql: string, params: any[] = []) {
    return this.client.query(sql, params);
  }

  toSlug(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async handleChat(question: string) {
    if (!question) {
      return { error: 'Question is required' };
    }
    try {
      const analysisPrompt = `
    Phân tích câu hỏi người dùng và xác định họ muốn gì:
    "${question}"
    
    Trả về JSON:
    {
      "intent": "film_detail|search_movie|recommend_genre|info_plan|popular|list_genre|actor_info|director_info|search_by_actor|search_by_director|general|all_user|thanks_you",
      "keywords": ["keyword1", "keyword2"],
      "genre": "tìm genre code nếu có (G_ACTION, G_HORROR, G_ROMANCE, G_COMEDY, G_SCIFI, G_THRILLER, G_DETECTIVE, G_SCHOOL, G_WAR, G_FANTASY, G_HISTORY, G_DOC, G_FAMILY, G_MUSICAL...)",
      "country": "tìm country code nếu có (C_VN, C_US, C_KR, C_CN, C_JP, C_HK, C_FR, C_TH, C_UK, C_DE, C_TW, C_AU, C_CA...)",
      "actor_name": "tên diễn viên nếu người dùng hỏi về phim có diễn viên X",
      "director_name": "tên đạo diễn nếu người dùng hỏi về phim của đạo diễn Y"
    }
    
    Lưu ý:
    - Nếu intent rơi vào trường hợp "film_detail", thì keywords chỉ lấy tên phim và viết hoa chữ cái đầu mỗi từ
    - Nếu hỏi "phim có diễn viên X" hoặc "phim của diễn viên X" => intent: "search_by_actor"
    - Nếu hỏi "phim của đạo diễn Y" => intent: "search_by_director"
    - Nếu hỏi "thông tin diễn viên X" => intent: "actor_info"
    - Nếu hỏi các câu hỏi có nghĩa tương tự "danh sách người dùng" => intent: "all_user"
    - Nếu hỏi "phim X" nhưng dạng đầy đủ như xem "chi tiết phim / xem nội dung phim /  thông tin phim tên X" hoặc chỉ cần dính 1 tên phim cụ thể ==> intent: "film_detail"
    - Nếu câu được cung cấp là 1 câu có vẻ như "cảm ơn" vì  được giúp đỡ, có thể là hơi  hướng genZ một chút ==> intent: "thanks_you"
    
    CHỈ trả về JSON.
    `;

      const analysisResult = await this.model.generateContent(analysisPrompt);
      let analysisText = analysisResult.response
        .text()
        .replace(/```json|```/g, '')
        .trim();
      const intent = JSON.parse(analysisText);
      console.log('Check Intent: ', intent);

      let dbQuery = '';
      let queryParams: (string | number)[] = [];

      switch (intent.intent) {
        case 'all_user':
          dbQuery = BackenDBQuery.all_user;
          queryParams = [];
          break;
        case 'thanks_you':
          const prompt = `Bạn tên là FlixAI. Khi người dùng nói "cảm ơn" hoặc tương tự, hãy trả về một câu trả lời ngắn, thân thiện, hơi GenZ nhưng phù hợp với ChillFlix. CHỈ TRẢ VỀ 1 DÒNG TEXT, KHÔNG DÙNG JSON, KHÔNG DÙNG MARKDOWN.`;
          const content = await this.model.generateContent(prompt);
          let finalText = content.response.text().trim();
          // optional: remove surrounding ``` nếu có
          finalText = finalText.replace(/^```(?:\w+)?\n?|```$/g, '').trim();

          return { answer: finalText, data: [] };

        case 'film_detail':
          const filmName = intent.keywords?.join(' ') || question;
          dbQuery = BackenDBQuery.filmDetailQuery;
          const slug = this.toSlug(filmName);
          queryParams = [slug];

          break;
        case 'search_movie':
          // Tìm phim theo tên với GROUP BY đầy đủ
          dbQuery = `
          SELECT 
            f."filmId", 
            f.title, 
            f."originalTitle",
            f.description,
            f.year,
            f."thumbUrl",
            f.slug,
            f.view,
            f."releaseDate",
            ac_age."valueVi" as age_rating,
            ac_type."valueVi" as film_type,
            ac_country."valueVi" as country,
            ac_lang."valueVi" as language,
            STRING_AGG(DISTINCT ac_genre."valueVi", ', ') as genres
          FROM films f
          LEFT JOIN all_code ac_age ON f."ageCode" = ac_age."keyMap"
          LEFT JOIN all_code ac_type ON f."typeCode" = ac_type."keyMap"
          LEFT JOIN all_code ac_country ON f."countryCode" = ac_country."keyMap"
          LEFT JOIN all_code ac_lang ON f."langCode" = ac_lang."keyMap"
          LEFT JOIN film_genre fg ON f."filmId" = fg."filmId"
          LEFT JOIN all_code ac_genre ON fg."genreCode" = ac_genre."keyMap"
          WHERE 
            f."deletedAt" IS NULL AND
            (f.title ILIKE $1 OR f."originalTitle" ILIKE $1 OR f.description ILIKE $1)
          GROUP BY 
            f."filmId", f.title, f."originalTitle", f.description, f.year, 
            f."thumbUrl", f.slug, f.view, f."releaseDate",
            ac_age."valueVi", ac_type."valueVi", ac_country."valueVi", ac_lang."valueVi"
          ORDER BY f.view DESC
          LIMIT 10
        `;
          queryParams = [`%${intent.keywords.join(' ')}%`];
          break;

        case 'recommend_genre':
          if (intent.genre) {
            dbQuery = `
            SELECT 
              f."filmId", 
              f.title, 
              f."originalTitle",
              f.description,
              f.year,
              f."thumbUrl",
              f.slug,
              f.view,
              ac_type."valueVi" as film_type,
              ac_country."valueVi" as country,
              STRING_AGG(DISTINCT ac_genre."valueVi", ', ') as genres
            FROM films f
            LEFT JOIN all_code ac_type ON f."typeCode" = ac_type."keyMap"
            LEFT JOIN all_code ac_country ON f."countryCode" = ac_country."keyMap"
            LEFT JOIN film_genre fg ON f."filmId" = fg."filmId"
            LEFT JOIN all_code ac_genre ON fg."genreCode" = ac_genre."keyMap"
            WHERE 
              f."deletedAt" IS NULL AND
              EXISTS (
                SELECT 1 FROM film_genre fg2 
                WHERE fg2."filmId" = f."filmId" AND fg2."genreCode" = $1
              )
            GROUP BY 
              f."filmId", f.title, f."originalTitle", f.description, f.year, 
              f."thumbUrl", f.slug, f.view,
              ac_type."valueVi", ac_country."valueVi"
            ORDER BY f.view DESC
            LIMIT 10
          `;
            queryParams = [intent.genre];
          }
          break;

        case 'popular':
          dbQuery = `
          SELECT 
            f."filmId", 
            f.title,
            f."originalTitle",
            f.description,
            f.year,
            f."thumbUrl",
            f.slug,
            f.view,
            ac_country."valueVi" as country,
            ac_type."valueVi" as film_type,
            STRING_AGG(DISTINCT ac_genre."valueVi", ', ') as genres
          FROM films f
          LEFT JOIN all_code ac_country ON f."countryCode" = ac_country."keyMap"
          LEFT JOIN all_code ac_type ON f."typeCode" = ac_type."keyMap"
          LEFT JOIN film_genre fg ON f."filmId" = fg."filmId"
          LEFT JOIN all_code ac_genre ON fg."genreCode" = ac_genre."keyMap"
          WHERE f."deletedAt" IS NULL
          GROUP BY 
            f."filmId", f.title, f."originalTitle", f.description, f.year, 
            f."thumbUrl", f.slug, f.view,
            ac_country."valueVi", ac_type."valueVi"
          ORDER BY f.view DESC
          LIMIT 10
        `;
          break;

        case 'list_genre':
          dbQuery = `
          SELECT 
            ac."keyMap" as genre_code,
            ac."valueVi" as genre_name,
            ac."valueEn" as genre_name_en,
            COUNT(DISTINCT fg."filmId") as film_count
          FROM all_code ac
          LEFT JOIN film_genre fg ON ac."keyMap" = fg."genreCode"
          LEFT JOIN films f ON fg."filmId" = f."filmId" AND f."deletedAt" IS NULL
          WHERE ac.type = 'GENRE' AND ac."keyMap" != 'G_ALL'
          GROUP BY ac."keyMap", ac."valueVi", ac."valueEn"
          ORDER BY film_count DESC
        `;
          break;

        case 'actor_info':
          dbQuery = `
          SELECT 
            a.actor_id,
            a.actor_name,
            a.slug,
            a."shortBio",
            a.birth_date,
            ac_gender."valueVi" as gender,
            ac_country."valueVi" as nationality,
            a.avatar_url,
            COUNT(DISTINCT fa.film_id) as film_count,
            STRING_AGG(DISTINCT f.title, ', ') as films
          FROM actors a
          LEFT JOIN all_code ac_gender ON a.gender_code = ac_gender."keyMap"
          LEFT JOIN all_code ac_country ON a.nationality_code = ac_country."keyMap"
          LEFT JOIN film_actors fa ON a.actor_id = fa.actor_id
          LEFT JOIN films f ON fa.film_id = f."filmId" AND f."deletedAt" IS NULL
          WHERE 
            a."deletedAt" IS NULL AND
            a.actor_name ILIKE $1
          GROUP BY 
            a.actor_id, a.actor_name, a.slug, a."shortBio", 
            a.birth_date, ac_gender."valueVi", ac_country."valueVi", a.avatar_url
          LIMIT 5
        `;
          queryParams = [`%${intent.actor_name || intent.keywords.join(' ')}%`];
          break;

        case 'search_by_actor':
          // Tìm phim theo diễn viên
          dbQuery = `
          SELECT 
            f."filmId", 
            f.title, 
            f."originalTitle",
            f.description,
            f.year,
            f."thumbUrl",
            f.slug,
            f.view,
            ac_type."valueVi" as film_type,
            ac_country."valueVi" as country,
            STRING_AGG(DISTINCT ac_genre."valueVi", ', ') as genres,
            STRING_AGG(DISTINCT a.actor_name, ', ') as actors
          FROM films f
          INNER JOIN film_actors fa ON f."filmId" = fa.film_id
          INNER JOIN actors a ON fa.actor_id = a.actor_id
          LEFT JOIN all_code ac_type ON f."typeCode" = ac_type."keyMap"
          LEFT JOIN all_code ac_country ON f."countryCode" = ac_country."keyMap"
          LEFT JOIN film_genre fg ON f."filmId" = fg."filmId"
          LEFT JOIN all_code ac_genre ON fg."genreCode" = ac_genre."keyMap"
          WHERE 
            f."deletedAt" IS NULL AND
            a."deletedAt" IS NULL AND
            a.actor_name ILIKE $1
          GROUP BY 
            f."filmId", f.title, f."originalTitle", f.description, f.year, 
            f."thumbUrl", f.slug, f.view,
            ac_type."valueVi", ac_country."valueVi"
          ORDER BY f.view DESC
          LIMIT 10
        `;
          queryParams = [`%${intent.actor_name || intent.keywords.join(' ')}%`];
          break;

        case 'search_by_director':
          // Tìm phim theo đạo diễn
          dbQuery = `
          SELECT 
            f."filmId", 
            f.title, 
            f."originalTitle",
            f.description,
            f.year,
            f."thumbUrl",
            f.slug,
            f.view,
            ac_type."valueVi" as film_type,
            ac_country."valueVi" as country,
            STRING_AGG(DISTINCT ac_genre."valueVi", ', ') as genres,
            STRING_AGG(DISTINCT d.director_name, ', ') as directors
          FROM films f
          INNER JOIN film_directors fd ON f."filmId" = fd.film_id
          INNER JOIN directors d ON fd.director_id = d.director_id
          LEFT JOIN all_code ac_type ON f."typeCode" = ac_type."keyMap"
          LEFT JOIN all_code ac_country ON f."countryCode" = ac_country."keyMap"
          LEFT JOIN film_genre fg ON f."filmId" = fg."filmId"
          LEFT JOIN all_code ac_genre ON fg."genreCode" = ac_genre."keyMap"
          WHERE 
            f."deletedAt" IS NULL AND
            d."deletedAt" IS NULL AND
            d.director_name ILIKE $1
          GROUP BY 
            f."filmId", f.title, f."originalTitle", f.description, f.year, 
            f."thumbUrl", f.slug, f.view,
            ac_type."valueVi", ac_country."valueVi"
          ORDER BY f.view DESC
          LIMIT 10
        `;
          queryParams = [`%${intent.director_name || intent.keywords.join(' ')}%`];
          break;

        case 'director_info':
          dbQuery = `
          SELECT 
            d.director_id,
            d.director_name,
            d.slug,
            d.story,
            d.birth_date,
            ac_gender."valueVi" as gender,
            ac_country."valueVi" as nationality,
            d."avatarUrl" as avatar_url,
            COUNT(DISTINCT fd.film_id) as film_count,
            STRING_AGG(DISTINCT f.title, ', ') as films
          FROM directors d
          LEFT JOIN all_code ac_gender ON d.gender_code = ac_gender."keyMap"
          LEFT JOIN all_code ac_country ON d.nationality_code = ac_country."keyMap"
          LEFT JOIN film_directors fd ON d.director_id = fd.director_id
          LEFT JOIN films f ON fd.film_id = f."filmId" AND f."deletedAt" IS NULL
          WHERE 
            d."deletedAt" IS NULL AND
            d.director_name ILIKE $1
          GROUP BY 
            d.director_id, d.director_name, d.slug, d.story,
            d.birth_date, ac_gender."valueVi", ac_country."valueVi", d."avatarUrl"
          LIMIT 5
        `;
          queryParams = [`%${intent.keywords.join(' ')}%`];
          break;

        case 'info_plan':
          dbQuery = `
          SELECT 
            sp."planId",
            sp."planName",
            sp."planDuration",
            ac."valueVi" as duration_type,
            sp.price,
            sp."isActive"
          FROM _subscriptionPlans sp
          LEFT JOIN all_code ac ON sp."durationType_code" = ac."keyMap"
          WHERE sp."isActive" = true AND sp."deletedAt" IS NULL
          GROUP BY 
            sp."planId", sp."planName", sp."planDuration", 
            ac."valueVi", sp.price, sp."isActive"
          ORDER BY sp.price ASC
        `;
          break;

        default:
          // General search - tìm theo nhiều tiêu chí
          dbQuery = `
          SELECT 
            f."filmId", 
            f.title,
            f."originalTitle",
            f.description,
            f.year,
            f."thumbUrl",
            f.slug,
            f.view,
            ac_type."valueVi" as film_type,
            ac_country."valueVi" as country,
            STRING_AGG(DISTINCT ac_genre."valueVi", ', ') as genres
          FROM films f
          LEFT JOIN all_code ac_type ON f."typeCode" = ac_type."keyMap"
          LEFT JOIN all_code ac_country ON f."countryCode" = ac_country."keyMap"
          LEFT JOIN film_genre fg ON f."filmId" = fg."filmId"
          LEFT JOIN all_code ac_genre ON fg."genreCode" = ac_genre."keyMap"
          WHERE 
            f."deletedAt" IS NULL AND
            (f.title ILIKE $1 OR f."originalTitle" ILIKE $1 OR f.description ILIKE $1)
          GROUP BY 
            f."filmId", f.title, f."originalTitle", f.description, f.year, 
            f."thumbUrl", f.slug, f.view,
            ac_type."valueVi", ac_country."valueVi"
          ORDER BY f.view DESC
          LIMIT 10
        `;
          queryParams = [`%${question}%`];
      }

      if (!dbQuery) {
        return { error: 'Không xác định được ý định truy vấn' };
      }

      console.log('check dbQuery: ', dbQuery);
      // const dbResult = await this.databaseService.query(dbQuery, queryParams);
      const dbResult = await this.query(dbQuery, queryParams);
      console.log(`Tìm thấy ${dbResult.rows.length} kết quả`);

      if (dbResult.rows.length === 0) {
        return {
          answer:
            'Xin lỗi, tôi không tìm thấy thông tin trong hệ thống.Bạn có thể hỏi thông tin khác, ví dụ như diễn viên, đạo diễn, các gói đăng ký VIP, ...',
          data: [],
        };
      }

      const responsePrompt = `
    Bạn là trợ lý AI thông minh của ChillFlix - nền tảng xem phim trực tuyến tại Việt Nam.
    
    Người dùng hỏi: "${question}"
    
    Dữ liệu từ cơ sở dữ liệu ChillFlix:
    ${JSON.stringify(dbResult.rows, null, 2)}
    
    Hãy trả lời câu hỏi một cách tự nhiên, thân thiện, hấp dẫn, **KHÔNG dùng markdown hay ký tự đặc biệt**.
    
    QUY TẮC BẮT BUỘC:
    - CHỈ dùng thông tin từ dữ liệu trên
    - KHÔNG bịa đặt phim, diễn viên, đạo diễn không có trong database
    - Nếu thiếu thông tin, nói rõ "Không có trong hệ thống"
    - Nếu là gói đăng ký, format giá tiền dễ đọc (VD: 49.000đ/tháng)
    - Trả lời ngắn gọn, súc tích nhưng đầy đủ thông tin
    - Nếu là thông tin diễn viên/đạo diễn, đề cập tiểu sử và phim tham gia
    - Nếu tìm phim theo diễn viên/đạo diễn, liệt kê tên phim và thể loại
    
    Trả về JSON:
    {
          "answer": "Câu trả lời dựa trên cơ sở dữ liệu (tối đa 250 từ)",
          "data": ${
            intent.intent === 'info_plan'
              ? '[{planId, planName, price, duration, duration_type}]'
              : intent.intent === 'actor_info' || intent.intent === 'director_info'
                ? '[{name, birth_date, nationality, bio, films}]'
                : intent.intent === 'all_user'
                  ? '[{User_userId, User_email, User_fullName, User_phoneNumber, User_avatarUrl, User_gender_code, User_age, User_role_id, User_birthDate, User_isVip, User_status_code, User_vipExpireDate}]'
                  : intent.intent === 'film_detail'
                    ? '[{ filmId, title, originalTitle, description, year, genres, country, age_rating, film_type, images }]'
                    : ''
          }
    }
    
    CHỈ trả JSON, không markdown.
    `;

      const finalResult = await this.model.generateContent(responsePrompt);
      console.log('check rs', finalResult.response);
      let finalText = finalResult.response
        .text()
        .replace(/```json|```/g, '')
        .trim();
      const response = JSON.parse(finalText);

      console.log('check response', response);
      return response;
    } catch (error) {
      console.log();
    }
  }
}
