-- Nivel de riesgo del vendedor. Sustituye al booleano `trusted`, que obligaba a
-- meter en el mismo saco a una aseguradora y a un desguace.
--
-- Arranca en 'high' para todos: lo desconocido es lo mas comun y equivocarse por
-- optimismo es lo que cuesta dinero. La preclasificacion por nombre corre
-- despues, desde la aplicacion.
ALTER TABLE "auction_seller_classifications"
  ADD COLUMN "riskLevel" TEXT NOT NULL DEFAULT 'high';

CREATE INDEX "auction_seller_classifications_riskLevel_idx"
  ON "auction_seller_classifications"("riskLevel");

-- Lo que ya estaba marcado a mano como de fiar arranca en riesgo bajo, para no
-- perder el trabajo de clasificacion que hubiera hecho el equipo.
UPDATE "auction_seller_classifications" SET "riskLevel" = 'low' WHERE "trusted" = true;
