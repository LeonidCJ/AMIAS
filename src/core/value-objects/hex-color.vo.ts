import { DomainException } from '../exceptions/domain.exception';

export class HexColor {
  private readonly value: string;

  constructor(value: string) {
    if (!HexColor.isValid(value)) {
      throw new DomainException(`Invalid HexColor format: '${value}'. Expected format: #RRGGBB.`);
    }
    this.value = value.toUpperCase();
  }

  public static isValid(hex: string): boolean {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexRegex.test(hex);
  }

  public getValue(): string {
    return this.value;
  }
}
