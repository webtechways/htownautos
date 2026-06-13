import { IsInt, Min } from 'class-validator';

/** Minimum deposit: $10.00 */
const MIN_DEPOSIT_CENTS = 1000;

/**
 * Portal customer initiates a deposit to their ledger balance.
 * Amount is in cents (integer). Minimum is $10.00.
 */
export class CreateDepositDto {
  @IsInt()
  @Min(MIN_DEPOSIT_CENTS, {
    message: `Minimum deposit is $${(MIN_DEPOSIT_CENTS / 100).toFixed(2)}`,
  })
  amountCents!: number;
}
