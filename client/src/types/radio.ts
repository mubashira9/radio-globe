export interface RadioStation {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  country: string;
  geo_lat: number | null;
  geo_long: number | null;
  clickcount: number;
}
