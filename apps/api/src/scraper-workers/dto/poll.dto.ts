import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * Lo que manda el bloque HTTP de Automa. Se queda deliberadamente en un solo
 * campo obligatorio: cuantos menos huecos que rellenar en el workflow, menos
 * formas de configurar mal una VM.
 */
export class PollDto {
  // El id se acepta tal cual y crea la fila, así que se restringe la forma:
  // un dedazo en el workflow crearía una VM fantasma con su propio cupo.
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-z0-9][a-z0-9._-]*$/i, {
    message: 'worker must be a slug: letters, digits, dot, dash or underscore',
  })
  worker!: string;

  /** `false` para que responda al momento en vez de retener hasta 20 s. */
  @IsOptional()
  @IsBoolean()
  wait?: boolean;
}
