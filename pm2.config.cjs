module.exports = {
  apps: [{
    name: "learning-connect",
    script: "./dist/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000,
      HOST: "0.0.0.0",
      SESSION_SECRET: "G47QQQvvL5MvBLdf+K19hw5H2NeFm+431yTlV8w7hgmAseCqCMJ8v4zHli4oKbT4IrrKI+Lrb43AiGoDXDMWFiA==",
      DATABASE_URL: "postgresql://neondb_owner:npg_7piYHyGAht6r@ep-patient-hall-a6e502ww.us-west-2.aws.neon.tech/neondb?sslmode=require",
      PGDATABASE: "neondb",
      PGHOST: "ep-patient-hall-a6e502ww.us-west-2.aws.neon.tech",
      PGPORT: "5432",
      PGUSER: "neondb_owner",
      PGPASSWORD: "npg_7piYHyGAht6r"
    },
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env_production: {
      NODE_ENV: "production",
      PORT: 5000,
      HOST: "0.0.0.0",
      SESSION_SECRET: "G47QQQvvL5MvBLdf+K19hw5H2NeFm+431yTlV8w7hgmAseCqCMJ8v4zHli4oKbT4IrrKI+Lrb43AiGoDXDMWFiA==",
      DATABASE_URL: "postgresql://neondb_owner:npg_7piYHyGAht6r@ep-patient-hall-a6e502ww.us-west-2.aws.neon.tech/neondb?sslmode=require",
      PGDATABASE: "neondb",
      PGHOST: "ep-patient-hall-a6e502ww.us-west-2.aws.neon.tech",
      PGPORT: "5432",
      PGUSER: "neondb_owner",
      PGPASSWORD: "npg_7piYHyGAht6r"
    },
    env_file: ".env"
  }]
} 