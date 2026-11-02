export class Camera {
  private x: number;
  private y: number;
  private targetX: number;
  private targetY: number;
  private lerp: number;

  constructor(x = 0, y = 0, lerp = 0.1) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.lerp = lerp;
  }

  setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  update(): void {
    this.x += (this.targetX - this.x) * this.lerp;
    this.y += (this.targetY - this.y) * this.lerp;
  }

  get position(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  setLerp(value: number): void {
    this.lerp = value;
  }
}
