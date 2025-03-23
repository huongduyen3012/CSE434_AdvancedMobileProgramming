export interface CompassModule {
  startCompassUpdates(): void;
  stopCompassUpdates(): void;
}

export interface CompassData {
  degree: number;
}

export default CompassModule;
