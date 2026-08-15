-- Persistir el tamaño calculado de gallery/: recorrer 2M+ objetos tarda minutos,
-- y al vivir solo en memoria el tile mostraba "…" tras cada despliegue.
ALTER TABLE "image_scrape_config" ADD COLUMN "storageBytes" BIGINT;
ALTER TABLE "image_scrape_config" ADD COLUMN "storageObjects" INTEGER;
ALTER TABLE "image_scrape_config" ADD COLUMN "storageComputedAt" TIMESTAMP(3);
