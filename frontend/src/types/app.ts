export interface ActiveReport {
  reportId: string;
  projectId: string;
  projectName: string;
  startTime: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}
