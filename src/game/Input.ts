export type InputState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

const KEYS = new Map<string, keyof InputState>([
  ["KeyW", "up"],
  ["ArrowUp", "up"],
  ["KeyS", "down"],
  ["ArrowDown", "down"],
  ["KeyA", "left"],
  ["ArrowLeft", "left"],
  ["KeyD", "right"],
  ["ArrowRight", "right"],
]);

export class Input {
  private state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  private gamepadIndex: number | null = null;

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("gamepadconnected", this.onGamepadConnect);
    window.addEventListener("gamepaddisconnected", this.onGamepadDisconnect);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const action = KEYS.get(e.code);
    if (action) {
      this.setKey(action, true);
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const action = KEYS.get(e.code);
    if (action) {
      this.setKey(action, false);
    }
  };

  private onGamepadConnect = (e: GamepadEvent): void => {
    this.gamepadIndex = e.gamepad.index;
  };

  private onGamepadDisconnect = (): void => {
    this.gamepadIndex = null;
  };

  pollGamepad(): void {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = this.gamepadIndex !== null ? gamepads[this.gamepadIndex] : null;
    if (!gp) return;

    const { axes, buttons } = gp;
    const sanitizedAxes = axes.map((a) =>
      typeof a === "number" && !isNaN(a) ? Math.max(-1, Math.min(1, a)) : 0
    );
    const lx = sanitizedAxes[0] ?? 0;
    const ly = sanitizedAxes[1] ?? 0;
    const deadzone = 0.2;

    this.setKey("up", ly < -deadzone);
    this.setKey("down", ly > deadzone);
    this.setKey("left", lx < -deadzone);
    this.setKey("right", lx > deadzone);

    if (buttons[0]?.pressed) {
      this.vibrate(100);
    }
  }

  vibrate(ms: number): void {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(ms);
    }
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = this.gamepadIndex !== null ? gamepads[this.gamepadIndex] : null;
    if (gp?.vibrationActuator) {
      gp.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: ms,
        weakMagnitude: 0.8,
        strongMagnitude: 0.8,
      });
    }
  }

  setKey(action: keyof InputState, value: boolean): void {
    if (value) {
      switch (action) {
        case "up":
          this.state.down = false;
          break;
        case "down":
          this.state.up = false;
          break;
        case "left":
          this.state.right = false;
          break;
        case "right":
          this.state.left = false;
          break;
      }
    }
    this.state[action] = value;
  }

  get(): InputState {
    return { ...this.state };
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("gamepadconnected", this.onGamepadConnect);
    window.removeEventListener("gamepaddisconnected", this.onGamepadDisconnect);
  }
}
