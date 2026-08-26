import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * Lo que manda el bloque HTTP de Automa. Se queda deliberadamente en un solo
 * campo obligatorio: cuantos menos huecos que rellenar en el workflow, menos
 * formas de configurar mal una VM.
 */
export class PollDto {
  /**
   * El email de la cuenta con la que trabaja esta VM (lo recomendado: el
   * vínculo con el agente se hace solo), o un slug suelto como `vm-01`.
   *
   * Se acepta tal cual y crea la fila, así que se restringe la forma: un
   * dedazo aquí crearía una VM fantasma con su propio cupo.
   */
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9][a-z0-9._+-]*(@[a-z0-9.-]+\.[a-z]{2,})?$/i, {
    message: 'worker must be an email or a slug (letters, digits, dot, dash, underscore)',
  })
  worker!: string;

  /** `false` para que responda al momento en vez de retener hasta 20 s. */
  @IsOptional()
  @IsBoolean()
  wait?: boolean;
}
