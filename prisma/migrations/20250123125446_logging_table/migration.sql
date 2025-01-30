-- CreateTable
CREATE TABLE "api_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_numeric_id" VARCHAR(15),
    "user_full_name" VARCHAR(300),
    "user_role" VARCHAR(50),
    "organization_id" INTEGER,
    "organization_name" VARCHAR,
    "method" VARCHAR(50),
    "path" VARCHAR(150),
    "request" TEXT,
    "response" TEXT,
    "status" INTEGER,
    "duration" SMALLINT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_logs_pkey" PRIMARY KEY ("id")
);
