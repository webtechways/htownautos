-- KYC ID document images (private S3 keys) on the buyer.
ALTER TABLE "buyers" ADD COLUMN "idFrontKey" TEXT;
ALTER TABLE "buyers" ADD COLUMN "idBackKey" TEXT;
