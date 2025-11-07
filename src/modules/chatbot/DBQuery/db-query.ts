export const BackenDBQuery = {
  all_user: `
    SELECT 
      "User"."userId" AS "User_userId",
      "User"."email" AS "User_email",
      "User"."fullName" AS "User_fullName",
      "User"."phoneNumber" AS "User_phoneNumber",
      "User"."avatarUrl" AS "User_avatarUrl",
      "User"."gender_code" AS "User_gender_code",
      "User"."age" AS "User_age",
      "User"."role_id" AS "User_role_id",
      "User"."birthDate" AS "User_birthDate",
      "User"."isVip" AS "User_isVip",
      "User"."status_code" AS "User_status_code",
      "User"."vipExpireDate" AS "User_vipExpireDate",
      "User"."refreshToken" AS "User_refreshToken",
      "User"."isDeleted" AS "User_isDeleted",
      "User"."createdAt" AS "User_createdAt",
      "User"."updatedAt" AS "User_updatedAt",
      "User"."deletedAt" AS "User_deletedAt",
      "User"."createdBy" AS "User_createdBy",
      "User"."updatedBy" AS "User_updatedBy",
      "User"."deletedBy" AS "User_deletedBy"
    FROM "users" "User"
    WHERE "User"."isDeleted" = false
    ORDER BY "User"."createdAt" DESC
    LIMIT 50
  `,

  filmDetailQuery: `
SELECT
  film."filmId",
  film."originalTitle",
  film."title",
  film."description",
  film."releaseDate",
  film."year",
  film."thumbUrl",
  film."slug",
  film."duration",
  film."view",
  film."ageCode",
  film."typeCode",
  film."countryCode",
  film."langCode",
  film."publicStatusCode",
  film."createdAt",
  film."updatedAt",
  film."deletedAt",
  film."createdBy",
  film."updatedBy",
  film."deletedBy",
  language."keyMap" AS "language_keyMap",
  language."valueEn" AS "language_valueEn",
  language."valueVi" AS "language_valueVi",
  age."keyMap" AS "age_keyMap",
  type."keyMap" AS "type_keyMap",
  country."keyMap" AS "country_keyMap",
  publicStatus."keyMap" AS "publicStatus_keyMap",
  filmGenres."genreCode" AS "genreCode",
  filmImages."url" AS "imageUrl",
  genre."valueVi" AS "genre_valueVi"
FROM "films" film
LEFT JOIN "all_code" language ON language."keyMap" = film."langCode"
LEFT JOIN "all_code" age ON age."keyMap" = film."ageCode"
LEFT JOIN "all_code" type ON type."keyMap" = film."typeCode"
LEFT JOIN "all_code" country ON country."keyMap" = film."countryCode"
LEFT JOIN "all_code" publicStatus ON publicStatus."keyMap" = film."publicStatusCode"
LEFT JOIN "film_genre" filmGenres ON filmGenres."filmId" = film."filmId"
LEFT JOIN "film_images" filmImages ON filmImages."filmId" = film."filmId" AND filmImages."deletedAt" IS NULL
LEFT JOIN "all_code" genre ON genre."keyMap" = filmGenres."genreCode"
WHERE film."slug" = $1
  AND film."deletedAt" IS NULL
`,
};
