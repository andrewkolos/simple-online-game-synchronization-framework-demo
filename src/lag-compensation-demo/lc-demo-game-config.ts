export interface LcDemoGameConfig {
  playFieldWidth: number;
  playFieldHeight: number;
  respawnTimeMs: number;
}

export const basicLcDemoGameConfig: LcDemoGameConfig = {
  playFieldHeight: 150,
  playFieldWidth: 900,
  respawnTimeMs: 3000,
};
