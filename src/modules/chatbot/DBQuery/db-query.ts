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

  filmBYName: `
  SELECT DISTINCT
  "distinctAlias"."Film_filmId" AS "ids_Film_filmId",
  "distinctAlias"."Film_createdAt"
FROM (
  SELECT
    "Film"."filmId" AS "Film_filmId",
    "Film"."originalTitle" AS "Film_originalTitle",
    "Film"."title" AS "Film_title",
    "Film"."description" AS "Film_description",
    "Film"."releaseDate" AS "Film_releaseDate",
    "Film"."year" AS "Film_year",
    "Film"."thumbUrl" AS "Film_thumbUrl",
    "Film"."slug" AS "Film_slug",
    "Film"."duration" AS "Film_duration",
    "Film"."view" AS "Film_view",
    "Film"."ageCode" AS "Film_ageCode",
    "Film"."typeCode" AS "Film_typeCode",
    "Film"."countryCode" AS "Film_countryCode",
    "Film"."langCode" AS "Film_langCode",
    "Film"."publicStatusCode" AS "Film_publicStatusCode",
    "Film"."createdAt" AS "Film_createdAt",
    "Film"."updatedAt" AS "Film_updatedAt",
    "Film"."deletedAt" AS "Film_deletedAt",
    "Film"."createdBy" AS "Film_createdBy",
    "Film"."updatedBy" AS "Film_updatedBy",
    "Film"."deletedBy" AS "Film_deletedBy",

    "Film__Film_language"."id" AS "Film__Film_language_id",
    "Film__Film_language"."keyMap" AS "Film__Film_language_keyMap",
    "Film__Film_language"."type" AS "Film__Film_language_type",
    "Film__Film_language"."valueEn" AS "Film__Film_language_valueEn",
    "Film__Film_language"."valueVi" AS "Film__Film_language_valueVi",
    "Film__Film_language"."description" AS "Film__Film_language_description",
    "Film__Film_language"."createdAt" AS "Film__Film_language_createdAt",
    "Film__Film_language"."updatedAt" AS "Film__Film_language_updatedAt",

    "Film__Film_age"."id" AS "Film__Film_age_id",
    "Film__Film_age"."keyMap" AS "Film__Film_age_keyMap",
    "Film__Film_age"."type" AS "Film__Film_age_type",
    "Film__Film_age"."valueEn" AS "Film__Film_age_valueEn",
    "Film__Film_age"."valueVi" AS "Film__Film_age_valueVi",
    "Film__Film_age"."description" AS "Film__Film_age_description",
    "Film__Film_age"."createdAt" AS "Film__Film_age_createdAt",
    "Film__Film_age"."updatedAt" AS "Film__Film_age_updatedAt",

    "Film__Film_filmGenres"."id" AS "Film__Film_filmGenres_id",
    "Film__Film_filmGenres"."filmId" AS "Film__Film_filmGenres_filmId",
    "Film__Film_filmGenres"."genreCode" AS "Film__Film_filmGenres_genreCode",

    "Film__Film_filmGenres__Film__Film_filmGenres_genre"."id" AS "Film__Film_filmGenres__Film__Film_filmGenres_genre_id",
    "Film__Film_filmGenres__Film__Film_filmGenres_genre"."keyMap" AS "Film__Film_filmGenres__Film__Film_filmGenres_genre_keyMap",
    "Film__Film_filmGenres__Film__Film_filmGenres_genre"."type" AS "Film__Film_filmGenres__Film__Film_filmGenres_genre_type",
    "Film__Film_filmGenres__Film__Film_filmGenres_genre"."valueEn" AS "Film__Film_filmGenres__Film__Film_filmGenres_genre_valueEn",
    "Film__Film_filmGenres__Film__Film_filmGenres_genre"."valueVi" AS "Film__Film_filmGenres__Film__Film_filmGenres_genre_valueVi",
    "Film__Film_filmGenres__Film__Film_filmGenres_genre"."description" AS "Film__Film_filmGenres__Film__Film_filmGenres_genre_description",
    "Film__Film_filmGenres__Film__Film_filmGenres_genre"."createdAt" AS "Film__Film_filmGenres__Film__Film_filmGenres_genre_createdAt",
    "Film__Film_filmGenres__Film__Film_filmGenres_genre"."updatedAt" AS "Film__Film_filmGenres__Film__Film_filmGenres_genre_updatedAt",

    "Film__Film_filmImages"."id" AS "Film__Film_filmImages_id",
    "Film__Film_filmImages"."filmId" AS "Film__Film_filmImages_filmId",
    "Film__Film_filmImages"."url" AS "Film__Film_filmImages_url",
    "Film__Film_filmImages"."type" AS "Film__Film_filmImages_type",
    "Film__Film_filmImages"."createdAt" AS "Film__Film_filmImages_createdAt",
    "Film__Film_filmImages"."updatedAt" AS "Film__Film_filmImages_updatedAt",
    "Film__Film_filmImages"."deletedAt" AS "Film__Film_filmImages_deletedAt"

  FROM "films" "Film"
  LEFT JOIN "all_code" "Film__Film_language"
    ON "Film__Film_language"."keyMap" = "Film"."langCode"
  LEFT JOIN "all_code" "Film__Film_age"
    ON "Film__Film_age"."keyMap" = "Film"."ageCode"
  LEFT JOIN "film_genre" "Film__Film_filmGenres"
    ON "Film__Film_filmGenres"."filmId" = "Film"."filmId"
  LEFT JOIN "all_code" "Film__Film_filmGenres__Film__Film_filmGenres_genre"
    ON "Film__Film_filmGenres__Film__Film_filmGenres_genre"."keyMap" = "Film__Film_filmGenres"."genreCode"
  LEFT JOIN "film_images" "Film__Film_filmImages"
    ON "Film__Film_filmImages"."filmId" = "Film"."filmId"
    AND ("Film__Film_filmImages"."deletedAt" IS NULL)
  WHERE "Film"."deletedAt" IS NULL
) "distinctAlias"
ORDER BY "distinctAlias"."Film_createdAt" DESC, "Film_filmId" ASC
LIMIT 50 OFFSET 0;
  `,
};
