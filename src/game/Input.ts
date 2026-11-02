export type InputState = {
  throttle: boolean;
  brake: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  handbrake: boolean;
};

const KEYS = new Map<string, keyof InputState>([
  ["KeyW", "throttle"],
  ["ArrowUp", "throttle"],
  ["KeyS", "brake"],
  ["ArrowDown", "brake"],
  ["KeyA", "steerLeft"],
  ["ArrowLeft", "steerLeft"],
  ["KeyD", "steerRight"],
  ["ArrowRight", "steerRight"],
  ["Space", "handbrake"],
]);

export class Input {
  private state: InputState = {
    throttle: false,
    brake: false,
    steerLeft: false,
    steerRight: false,
    handbrake: false,
  };

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const action = KEYS.get(e.code);
    if (action) {
      this.state[action] = true;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const action = KEYS.get(e.code);
    if (action) {
      this.state[action] = false;
    }
  };

  get(): InputState {
    return { ...this.state };
  }

  setKey(action: keyof InputState, value: boolean): void {
    this.state[action] = value;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
