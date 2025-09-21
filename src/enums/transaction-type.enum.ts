export enum TransactionType {
  DEPOSIT = 'deposit', // واریز وجه
  WITHDRAW = 'withdraw', // برداشت وجه
  PRIZE = 'prize', // جایزه
  REFERRAL_BONUS = 'referral_bonus', // پاداش معرفی
  GAME_FEE = 'game_fee', // هزینه بازی
  BINGO_LINE = 'bingo_line', // برد خطی بازی
  BINGO_FULL_CARD = 'bingo_full_card', // برد کارت کامل
  WHEEL_SPIN = 'wheel_spin', // برد گردونه
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}
