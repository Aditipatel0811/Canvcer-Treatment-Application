export default {
  dialect: "postgresql",
  schema: "./src/utils/schema.jsx",
  out: "./drizzle",
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_10jHVwYFNAdD@ep-restless-mode-a5dgfab0-pooler.us-east-2.aws.neon.tech/health?sslmode=require',
    connectionString:
      'postgresql://neondb_owner:npg_10jHVwYFNAdD@ep-restless-mode-a5dgfab0-pooler.us-east-2.aws.neon.tech/health?sslmode=require',
  },
};
